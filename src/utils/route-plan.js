import {dijkstra, findAllPaths, findTransfers} from "src/utils/route-algorithm";

export const MAIN_STATION_PREFIX = "M"

/**
 *
 * @param {{}} rawGraph
 * @param {Number|String} fromMainId
 * @param {Number|String} toMainId
 * @returns {{}}
 */
function initGraph(rawGraph, fromMainId, toMainId) {
    const graph = Object.entries(rawGraph)
        .map(([k, v]) => {
            return v.map(it => [k, ...it])
        })
        .flat()
        .reduce((acc, cur) => {
            // console.log('cur', cur)
            let [mainStationId, fromId, toId, distance, transferId] = cur
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
    return graph
}

/**
 *
 * @param rawGraph
 * @param route 如 ['M180','193', '194', '195', '196', 'M65'] 代表卸甲甸到泰冯路
 */
function parseRoute(rawGraph, route) {

}


export async function planRoute(rawGraph, fromMainId, toMainId, depTime, cb) {
    const graph = initGraph(rawGraph, fromMainId, toMainId)
    console.log('planRoute', graph)
    const allRoutes = []
    const start = MAIN_STATION_PREFIX + fromMainId;
    const end = MAIN_STATION_PREFIX + toMainId;
    const shortest = dijkstra(graph, start, end)
    shortest['transfers'] = findTransfers(graph, shortest['path'])
    console.log('path min cost:', shortest)
    await findAllPaths(graph, start, end, ({path, distance}) => {
        console.log('path', path, distance)
    }, shortest,)

}

