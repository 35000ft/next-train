import {dijkstra, findAllPaths, findTransfers} from "src/utils/route-algorithm";
import dayjs from "dayjs";
import {stopInfoParse, trainLineOfStopParser} from "src/models/Train";
import _ from "lodash";
import {diff} from "src/utils/time-utils";

export const MAIN_STATION_PREFIX = "M"

/**
 *
 * @param {{}} rawGraph
 * @param {Number|String} fromMainId
 * @param {Number|String} toMainId
 * @param viaIds
 * @returns {{}}
 */
function initGraph(rawGraph, fromMainId, toMainId, viaIds = []) {
    const subIdToMainMap = new Map()
    const graph = Object.entries(rawGraph)
        .map(([k, v]) => {
            return v.map(it => [k, ...it])
        })
        .flat()
        .reduce((acc, cur) => {
            let [mainStationId, fromId, toId, distance, transferId, lineId] = cur
            const _mainStationId = MAIN_STATION_PREFIX + mainStationId
            acc[fromId] = acc[fromId] || {}
            if (transferId) {
                acc[fromId][_mainStationId] = 0
                acc[_mainStationId] = acc[_mainStationId] || {}
                const subStationToId = toId.split('-')[0]

                acc[subStationToId] = acc[subStationToId] || {}

                acc[_mainStationId][subStationToId] = 0
                acc[subStationToId][_mainStationId] = 0

                const subStationFromId = fromId.split('-')[0]
                acc[subStationFromId] = acc[subStationFromId] || {}
                acc[subStationFromId][_mainStationId] = 0
                return acc
            }
            subIdToMainMap.set(fromId, {
                mainStationId,
                lineId
            })
            acc[fromId][toId] = distance
            return acc
        }, {})

    // Prefix "M" stands it is a main station id
    const toMainStationIds = [toMainId, ...viaIds]
    for (const mainStationId of toMainStationIds) {
        const _toMainId = MAIN_STATION_PREFIX + mainStationId
        Array.from(new Set(rawGraph[mainStationId].map(it => it[0]))).forEach(it => {
            graph[_toMainId] = graph[_toMainId] || {}
            graph[_toMainId][it] = 0

            graph[it] = graph[it] || {}
            graph[it][_toMainId] = 0
        })
    }

    // Construct the start route from departure station
    const fromMainStationIds = [fromMainId, ...viaIds]
    for (const mainStationId of fromMainStationIds) {
        const _fromMainId = MAIN_STATION_PREFIX + mainStationId
        Array.from(new Set(rawGraph[mainStationId].map(it => it[0]))).forEach(it => {
            graph[_fromMainId] = graph[_fromMainId] || {}
            graph[_fromMainId][it] = 0
        })
    }

    return {
        graph,
        subIdToMainMap
    }
}

/**
 *
 * @param {Map}  subIdToMainMap
 * @param {Array} path 如 ['M180','193', '194', '195', '196', 'M65'] 代表卸甲甸到泰冯路
 */
function parseRoute(subIdToMainMap, path) {
    const result = []
    const {lineId, mainStationId} = subIdToMainMap.get(path[1])
    result.push({lineId, stationIds: [mainStationId], subStationIds: [path[1]]})
    for (const node of path.slice(2, -1)) {
        const last = result.slice(-1)[0]
        if (node.startsWith(MAIN_STATION_PREFIX)) {
            //TODO
        } else {
            const {lineId, mainStationId} = subIdToMainMap.get(node)
            if (!lineId) continue
            if (last.lineId === lineId) {
                last.stationIds.push(mainStationId)
                last.subStationIds.push(node)
            } else {
                result.push({lineId, stationIds: [mainStationId], subStationIds: [node]})
            }
        }
    }
    return result
}


export async function planRoute(rawGraph, fromMainId, toMainId, trainGetter, transferInfoGetter, depTime = dayjs(), cb) {
    const {graph, subIdToMainMap} = initGraph(rawGraph, fromMainId, toMainId)
    const start = MAIN_STATION_PREFIX + fromMainId;
    const end = MAIN_STATION_PREFIX + toMainId;
    const shortest = dijkstra(graph, start, end)

    shortest['transfers'] = findTransfers(graph, shortest['path'])
    console.log('Shortest Route:', shortest)
    const planPromises = []
    const allSolutions = []

    const pathCb = ({path, distance}) => {
        const parsedPath = parseRoute(subIdToMainMap, path)
        const onePathPromise = planOnePathSolution(
            {
                distance,
                path,
                parsedPath
            },
            depTime,
            trainGetter,
            transferInfoGetter,
        ).then(solutions => {
            allSolutions.push(...solutions)
            for (const solution of solutions) {
                cb(solution)
            }
            return solutions
        })
        planPromises.push(onePathPromise)
    }
    pathCb(shortest)
    await findAllPaths(graph, start, end, pathCb, shortest)
    return Promise.all(planPromises).then(res => {
        return allSolutions
    })
}

/**
 *
 * @param {Number} distance 路线的距离
 * @param {Array} path 物理路径
 * @param {Array<{}>} parsedPath 转为使用各条线路的路径
 * @param {dayjs.Dayjs} depTime 出发时间
 * @param {Function} trainGetter 获取符合条件的车次的函数 接受参数 {lineId,stationId,depTime}
 * @param transferInfoGetter
 */
async function planOnePathSolution({distance, path, parsedPath}, depTime, trainGetter, transferInfoGetter) {
    const {lineId, stationIds} = parsedPath[0]
    const solutions = new Set()
    const allPromises = []
    await trainGetter({lineId, stationId: stationIds[0], depTime}).then(trainInfoList => {
        console.log('Candidate trainInfoList:', trainInfoList)
        const promises = trainInfoList.map(t => recursivePlan(t, parsedPath, depTime, trainGetter, transferInfoGetter, [],
            (trains) => {
                const solution = toSolution(trains, distance)
                if (solutions.size === 0) {
                    solutions.add(solution)
                    return
                }
                const toDeleteSolutions = Array.from(solutions)
                    .filter(it => it.arrTime.isAfter(solution.arrTime)
                        && diff(it.depTime, solution.depTime) >= 0)
                if (toDeleteSolutions.length > 0) {
                    toDeleteSolutions.forEach(it => solutions.delete(it))
                    solutions.add(solution)
                } else {
                    const betterSolutions = Array.from(solutions).filter(it => diff(solution.depTime, it.depTime) === 0 && diff(solution.arrTime, it.arrTime) > 0)
                    if (betterSolutions.length === 0) {
                        solutions.add(solution)
                    }
                }
            }))
        allPromises.push(...promises)
    })
    await Promise.all(allPromises)

    console.log('One Path Solutions', parsedPath, solutions)
    return Array.from(solutions)
}

/**
 *
 * @param {{}} trainInfo
 * @param {Array<{}>} parsedPath
 * @param lastDepTime
 * @param trainGetter
 * @param transferInfoGetter
 * @param trains 当前使用的列车和换乘
 * @param cb 成功回调
 * @param preTransferInfo 上一个换乘点信息 用于检查车次出发时间是否满足换乘需求
 */
async function recursivePlan(trainInfo, parsedPath, lastDepTime, trainGetter, transferInfoGetter, trains = [], cb, preTransferInfo) {
    let isFind = false
    const stopStationIds = trainInfo.schedule.map(it => it[0])
    let currentPathIndex = -1
    let getOffIndex = -1
    let getOnIndex = -1
    let curPathStationOffset
    for (let i = 0; i < parsedPath.length; i++) {
        // 当前路径的主车站id列表
        const {stationIds} = parsedPath[i]

        // 查找下车站id
        const getOffStationId = [...stationIds].reverse().find(item => stopStationIds.includes(item))
        //如果下车站id不为空
        if (getOffStationId !== undefined) {
            const _curPathStationOffset = stationIds.indexOf(getOffStationId)
            if (_curPathStationOffset > 0) {
                // 查找下车站id在当前路径主车站id列表的位置
                curPathStationOffset = _curPathStationOffset

                //更新当前路径index
                currentPathIndex = i

                // 查找下车站在列车时刻表的index
                getOffIndex = stopStationIds.lastIndexOf(getOffStationId)
            }
        }

        //第一次循环获取上车站索引
        if (i === 0) {
            //查找上车站在列车时刻表的index 只需要在第一次查找 但下车站index需要查找多次
            getOnIndex = stopStationIds.indexOf(stationIds[0])

            //找不到上车站index 不能搭乘该列车 return
            if (getOnIndex === -1) {
                return
            }
            //下车站index小于等于上车站index 不能搭乘该列车 return
            if (getOffIndex <= getOnIndex) {
                return
            }
            if (preTransferInfo) {
                const {fromPlatform, fromId, arrTime, fromMainId} = preTransferInfo
                const getOnStop = stopInfoParse(trainInfo.schedule[getOnIndex])
                const transferInfo = await transferInfoGetter({
                    fromId,
                    fromPlatform,
                    fromMainId,
                    toId: parsedPath[0].subStationIds[0],
                    toPlatform: getOnStop.platform,
                    toMainId: getOnStop.stationId
                })
                transferInfo.type = 'transfer'
                transferInfo.depStationId = fromMainId
                transferInfo.arrStationId = getOnStop.stationId
                if (arrTime.add(transferInfo.needTime, 'second').isAfter(getOnStop.dep)) {
                    console.warn('Transfer time is not enough', `arrive time:${arrTime.format()}`, `dep time:${getOnStop.dep.format()}`, `transfer need time:${transferInfo.needTime}`)
                    return
                }
                trains.push(transferInfo)
            }
        }

        //通过第一次循环的检查后 可以搭乘该列车
        isFind = true
    }
    if (!isFind) return
    if (getOffIndex <= getOnIndex) {
        return
    }
    const train = buildTrain(trainInfo, getOnIndex, getOffIndex)
    trains.push(train)
    const getOffStop = stopInfoParse(trainInfo.schedule[getOffIndex])
    const isArrived = parsedPath.length === 1 && getOffStop.stationId === parsedPath[0].stationIds.slice(-1)[0]
    if (isArrived) {
        //到达终点
        console.log('Arrived', trains)
        cb(trains)
        return Promise.resolve(trains)
    }

    let nextParsedPath
    let transferFromId

    const needSplit = curPathStationOffset < parsedPath[currentPathIndex].stationIds.length - 1
    if (needSplit) {
        // 计算下一个parsedPath 为parsedPath的切片 因为需要切割所以从currentPathIndex开始
        nextParsedPath = _.cloneDeep(parsedPath.slice(currentPathIndex))
        //需要对nextParsedPath进行切割
        nextParsedPath[0].stationIds = nextParsedPath[0].stationIds.slice(curPathStationOffset)
        nextParsedPath[0].subStationIds = nextParsedPath[0].subStationIds.slice(curPathStationOffset)
        transferFromId = parsedPath[currentPathIndex].subStationIds[curPathStationOffset]
    } else {
        // 计算下一个parsedPath 为parsedPath的切片 因为不需要切割所以从currentPathIndex+1开始
        nextParsedPath = _.cloneDeep(parsedPath.slice(currentPathIndex + 1))
        transferFromId = parsedPath[currentPathIndex].subStationIds.slice(-1)[0]
    }
    const curLineId = parsedPath[currentPathIndex].lineId
    const nextLineId = needSplit ? curLineId : nextParsedPath[0].lineId

    const currentStationId = getOffStop.stationId
    const transferFromInfo = {
        fromPlatform: getOffStop.platform,
        fromId: transferFromId,
        fromMainId: getOffStop.stationId,
        arrTime: getOffStop.arr,
        toId: nextParsedPath[0].subStationIds[0]
    }

    try {
        const minTransfer = await transferInfoGetter(transferFromInfo);

        lastDepTime = getOffStop.arr.add(minTransfer.needTime, 'second')
        const nextTrainInfoList = await trainGetter({
            stationId: currentStationId,
            lineId: nextLineId,
            depTime: lastDepTime
        })

        const promises = nextTrainInfoList.map(t =>
            recursivePlan(t, nextParsedPath, lastDepTime, trainGetter, transferInfoGetter, [...trains], cb, transferFromInfo)
        )
        await Promise.all(promises)
    } catch (error) {
        console.error('Error in recursivePlan:', error)
        return Promise.resolve(error)
    }
}

export function planShortestSolution(rawGraph, fromMainId, toMainId, viaIds = [], trainGetter, transferInfoGetter, depTime = dayjs(), cb) {
    const {graph, subIdToMainMap} = initGraph(rawGraph, fromMainId, toMainId, viaIds)

    const {path, distance} = [...viaIds, toMainId].map(v => {
        const _fromMainId = MAIN_STATION_PREFIX + fromMainId
        const _toMainId = MAIN_STATION_PREFIX + v
        const route = dijkstra(graph, _fromMainId, _toMainId)
        fromMainId = v
        return route
    }).reduce((e1, e2) => {
        return {
            distance: e1.distance + e2.distance,
            path: [...e1.path, ...e2.path.slice(1)]
        }
    })
    const parsedPath = parseRoute(subIdToMainMap, path)
    return planOnePathSolution({distance, path, parsedPath}, depTime, trainGetter, transferInfoGetter)
        .then(solutions => {
            for (const solution of solutions) {
                cb(solution)
            }
            return solutions
        })
}

function toSolution(segments, distance) {
    const transfers = segments.filter(it => it.type === 'transfer')
    const solutionId = segments.filter(it => it.type === 'train').map(it => it.trainInfo.id).join('-')
    const walkDistance = transfers.reduce((acc, cur) => {
        return acc + cur.distance
    }, 0)

    const _trains = []
    if (segments[0].type === 'train') {
        _trains.push(segments[0])
    }
    for (let i = 1; i < segments.length; i++) {
        if (segments[i].type === 'train') {
            if (segments[i - 1].type === 'transfer') {
                const transfer = segments[i - 1]
                if (transfer.depStationId !== transfer.arrStationId) {
                    segments[i].outerTransfer = transfer
                } else {
                    segments[i].transfer = transfer
                }
            }
            _trains.push(segments[i])
        }
    }
    const depTime = segments[0].depTime
    const arrTime = segments.slice(-1)[0].arrTime

    return {
        id: solutionId,
        transferTimes: transfers.length,
        walkDistance,
        distance,
        totalTime: diff(arrTime, depTime),
        trains: _trains,
        depTime,
        arrTime,
        depStationId: segments[0].depStationId,
        arrStationId: segments.slice(-1)[0].arrStationId,
    }
}

function buildTrain(trainInfo, getOnIndex, getOffIndex) {
    const stops = trainInfo.schedule.slice(getOnIndex, getOffIndex + 1).map(it => stopInfoParse(it))
    return {
        depTime: stops[0].dep,
        arrTime: stops.slice(-1)[0].arr,
        get arrStationName() {
            return this.arrStop.stationName
        },
        get depStationName() {
            return this.depStop.stationName
        },
        get depStationId() {
            return this.depStop.stationId
        },
        get arrStationId() {
            return this.arrStop.stationId
        },
        terminal: stopInfoParse(trainInfo.schedule.slice(-1)[0]),
        isFirstStop: getOnIndex === 0,
        get depStop() {
            return this.stops[0]
        },
        get arrStop() {
            return this.stops.slice(-1)[0]
        },
        stops: stops,
        getOnIndex,
        getOffIndex,
        trainInfo,
        category: trainInfo.category,
        type: 'train'
    }
}
