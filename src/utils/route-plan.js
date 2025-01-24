import {dijkstra, findAllPaths, findTransfers} from "src/utils/route-algorithm";
import dayjs from "dayjs";

export const MAIN_STATION_PREFIX = "M"

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

                const subStationFromId = fromId.replace(/^[+-]/, '')
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


export async function planRoute(rawGraph, fromMainId, toMainId, trainGetter, depTime = dayjs(), cb) {
    const {graph, subIdToMainMap} = initGraph(rawGraph, fromMainId, toMainId)
    const start = MAIN_STATION_PREFIX + fromMainId;
    const end = MAIN_STATION_PREFIX + toMainId;
    const shortest = dijkstra(graph, start, end)

    shortest['transfers'] = findTransfers(graph, shortest['path'])
    console.log('path min cost:', shortest)
    await findAllPaths(graph, start, end, ({path, distance}) => {
        const parsedPath = parseRoute(subIdToMainMap, path)
        planOnePathSolution({
            distance,
            physicalPath: path,
            parsedPath
        }, depTime, trainGetter).then(solution => {
            if (cb) {
                cb(solution)
            }
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
 */
async function planOnePathSolution({distance, path, parsedPath}, depTime, trainGetter) {

}

/**
 * 查找一趟车最多能坐到哪个站
 * @param {{}} trainInfo
 * @param {Array<{}>} parsedPath
 */
function findGetOffStation(trainInfo, parsedPath) {

}


