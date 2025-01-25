import {dijkstra, findAllPaths, findTransfers} from "src/utils/route-algorithm";
import dayjs from "dayjs";
import {stopInfoParse} from "src/models/Train";

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

                acc[toId] = acc[toId] || {}

                acc[_mainStationId][toId] = 0
                acc[toId][_mainStationId] = 0

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
    result.push({lineId, stationIds: [mainStationId]})
    for (const node of path.slice(2, -1)) {
        const last = result.slice(-1)[0]
        if (node.startsWith(MAIN_STATION_PREFIX)) {
            //TODO
        } else {
            const {lineId, mainStationId} = subIdToMainMap.get(node)
            if (!lineId) continue
            if (last.lineId === lineId) {
                last.stationIds.push(mainStationId)
            } else {
                result.push({lineId, stationIds: [mainStationId]})
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
    await findAllPaths(graph, start, end, ({path, distance}) => {
        const parsedPath = parseRoute(subIdToMainMap, path)
        planOnePathSolution(
            {
                distance,
                path,
                parsedPath
            },
            depTime,
            trainGetter,
            transferInfoGetter,
            //规划成功回调
            (solution) => {

            })
    }, shortest,)
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
    await trainGetter({lineId, stationId: stationIds[0], depTime}).then(trainInfoList => {
        console.log('ttr', trainInfoList)
        const promises = trainInfoList.map(t => recursivePlan(t, parsedPath, depTime, trainGetter, transferInfoGetter, [], cb))
    })
}

/**
 *
 * @param {{}} trainInfo
 * @param {Array<{}>} parsedPath
 * @param lastDepTime
 * @param trainGetter
 * @param transferInfoGetter
 * @param trains
 * @param cb
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
        if (i === 0) {
            getOnIndex = stopStationIds.indexOf(stationIds[0])
            if (getOnIndex === -1) {
                break
            }
            if (preTransferInfo) {
                //Check if depart time match transfer require
                const getOnStop = stopInfoParse(trainInfo.schedule[getOnIndex])
                const transferCondition = {
                    fromPlat
                }

            }
        }
        indexOffset = 0
        const getOffStationId = [...stationIds].reverse().find(item => stopStationIds.includes(item))
        getOffIndex = stopStationIds.lastIndexOf(getOffStationId)
        if (getOffIndex <= getOnIndex) {
            isFind = false
            break
        } else {
            isFind = true
            indexOffset = stationIds.indexOf(getOffStationId)
            if (indexOffset < stationIds.length - 1) {
                break
            }
        }
    }
    if (isFind && getOnIndex > 0) {
        const train = {
            getOnIndex,
            getOffIndex,
            trainInfo
        }
        trains.push(train)
        if (parsedPath.length === 1 && indexOffset === parsedPath[0].stationIds.length - 1) {
            //到达终点
            console.log('Arrived', trains)
            cb(trains)
            return Promise.resolve()
        }
        // assert i >= 1
        if (i < 1) {
            console.warn('parsedPath index i less then 1!')
            return
        }
        //TODO
        const nextParsedPath = parsedPath.slice(i)
        if (indexOffset > 0) {
            nextParsedPath[nextParsedPath.length - 1].stationIds = nextParsedPath[0].stationIds.slice(indexOffset)
        }
        const curLineId = parsedPath[i - 1].lineId
        const nextLineId = indexOffset > 0 ? curLineId : nextParsedPath[0].lineId

        const getOffStop = stopInfoParse(trainInfo.schedule[getOffIndex])
        const currentStationId = getOffStop.stationId
        const transferFromInfo = {
            platform: getOffStop.platform,
            stationId: getOffStop.stationId,
            arrTime: getOffStop.arr
        }
        console.log('next', getOffStop, currentStationId, transferFromInfo)

        trainGetter({
            stationId: currentStationId,
            lineId: nextLineId,
            depTime: lastDepTime.add(MIN_TRANSFER_TIME, 'second')
        })

    }
}



