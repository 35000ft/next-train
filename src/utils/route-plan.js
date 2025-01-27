import {dijkstra, findAllPaths, findTransfers} from "src/utils/route-algorithm";
import dayjs from "dayjs";
import {stopInfoParse} from "src/models/Train";
import _ from "lodash";

export const MAIN_STATION_PREFIX = "M"
// 最短换乘时间 30秒
const MIN_TRANSFER_TIME = 30

/**
 *
 * @param {{}} rawGraph
 * @param {Number|String} fromMainId
 * @param {Number|String} toMainId
 * @returns {{}}
 */
function initGraph(rawGraph, fromMainId, toMainId) {
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
    const _fromMainId = MAIN_STATION_PREFIX + fromMainId
    // Construct the start route from departure station
    Array.from(new Set(rawGraph[fromMainId].map(it => it[0]))).forEach(it => {
        graph[_fromMainId] = graph[_fromMainId] || {}
        graph[_fromMainId][it] = 0
    })
    const _toMainId = MAIN_STATION_PREFIX + toMainId
    // Construct the end route to arrival station
    Array.from(new Set(rawGraph[toMainId].map(it => it[0]))).forEach(it => {
        graph[_toMainId] = graph[_toMainId] || {}
        graph[_toMainId][it] = 0

        graph[it] = graph[it] || {}
        graph[it][_toMainId] = 0
    })
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
    console.log('path min cost:', shortest)
    const planPromises = []
    const allSolutions = []
    await findAllPaths(graph, start, end, ({path, distance}) => {
        const parsedPath = parseRoute(subIdToMainMap, path)
        const promise = planOnePathSolution(
            {
                distance,
                path,
                parsedPath
            },
            depTime,
            trainGetter,
            transferInfoGetter,
            //规划成功回调
            (trains) => {
                const solution = toSolution(trains)
                solution.distance = distance
                allSolutions.push(solution)
                cb(solution)
            })
        planPromises.push(promise)
    }, shortest,)
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
 * @param cb
 */
async function planOnePathSolution({distance, path, parsedPath}, depTime, trainGetter, transferInfoGetter, cb) {
    const {lineId, stationIds} = parsedPath[0]
    const solutions = []
    const allPromises = []
    await trainGetter({lineId, stationId: stationIds[0], depTime}).then(trainInfoList => {
        console.log('ttr', trainInfoList)
        const promises = trainInfoList.map(t => recursivePlan(t, parsedPath, depTime, trainGetter, transferInfoGetter, [], (solution) => {
            solutions.push(solution)
            cb(solution)
        }))
        allPromises.push(...promises)
    })
    await Promise.all(allPromises)
    return solutions
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
    let i = 0
    let getOffIndex = -1
    let getOnIndex = -1
    let indexOffset = -1
    for (; i < parsedPath.length; i++) {
        const {stationIds} = parsedPath[i]

        const getOffStationId = [...stationIds].reverse().find(item => stopStationIds.includes(item))
        getOffIndex = stopStationIds.lastIndexOf(getOffStationId)
        if (i === 0) {
            getOnIndex = stopStationIds.indexOf(stationIds[0])
            if (getOnIndex === -1) {
                return
            }
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
                if (arrTime.add(transferInfo.needTime, 'second').isAfter(getOnStop.dep)) {
                    console.warn('Transfer time is not enough', `arrive time:${arrTime.format()}`, `dep time:${getOnStop.dep.format()}`, `transfer need time:${transferInfo.needTime}`)
                    return
                }
                trains.push(transferInfo)
            }
        }
        indexOffset = 0

        isFind = true
        indexOffset = stationIds.indexOf(getOffStationId)
        if (indexOffset < stationIds.length - 1) {
            break
        }

    }
    if (!isFind) return
    const train = {
        get depTime() {
            return this.depStop.dep
        },
        get arrTime() {
            return this.arrStop.arr
        },
        get arrStationName() {
            return this.arrStop.stationName
        },
        get depStationName() {
            return this.depStop.stationName
        },
        terminal: stopInfoParse(trainInfo.schedule.slice(-1)[0]),
        isFirstStop: getOnIndex === 0,
        get depStop() {
            return this.stops[0]
        },
        get arrStop() {
            return this.stops.slice(-1)[0]
        },
        stops: trainInfo.schedule.slice(getOnIndex, getOffIndex + 1).map(it => stopInfoParse(it)),
        getOnIndex,
        getOffIndex,
        trainInfo,
        category: trainInfo.category,
        type: 'train'
    }
    trains.push(train)
    const getOffStop = stopInfoParse(trainInfo.schedule[getOffIndex])
    const isArrived = parsedPath.length === 1 && getOffStop.stationId === parsedPath[0].stationIds.slice(-1)[0]
    if (isArrived) {
        //到达终点
        console.log('Arrived', trains)
        cb(trains)
        return Promise.resolve(trains)
    }

    const nextParsedPath = _.cloneDeep(parsedPath.slice(i))
    let transferFromId
    const currentPathIndex = i > 0 ? i - 1 : 0
    if (indexOffset > 0) {
        //该车次未能到达一段path的终点 需要对该段path进行切割
        nextParsedPath[nextParsedPath.length - 1].stationIds = nextParsedPath[0].stationIds.slice(indexOffset)
        nextParsedPath[nextParsedPath.length - 1].subStationIds = nextParsedPath[0].subStationIds.slice(indexOffset)
        transferFromId = parsedPath[i].subStationIds[indexOffset]
    } else {
        transferFromId = parsedPath[currentPathIndex].subStationIds.slice(-1)[0]
    }
    const curLineId = parsedPath[currentPathIndex].lineId
    const nextLineId = indexOffset > 0 ? curLineId : nextParsedPath[0].lineId

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

function toSolution(trains) {
    const transfers = trains.filter(it => it.type === 'transfer')
    const walkDistance = transfers.reduce((acc, cur) => {
        return acc + cur.distance
    }, 0)
    return {
        transferTimes: transfers.length,
        walkDistance,
        trains: trains,
        depTime: trains[0].depTime,
        arrTime: trains.slice(-1)[0].arrTime
    }
}
