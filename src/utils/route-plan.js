import {findAllPaths} from "src/utils/route-algorithm";

const MAIN_STATION_PREFIX = "M"

/**
 *
 * @param {{}} rawGraph
 * @param {Number|String} fromMainId
 * @param {Number|String} toMainId
 * @returns {FlatArray<unknown[], 1>}
 */
function initGraph(rawGraph, fromMainId, toMainId) {
    const graph = Object.entries(rawGraph)
        .map(([k, v]) => v)
        .flat()
        .reduce((acc, cur) => {
            const [fromId, toId, distance, transferId] = cur
            if (acc[fromId]) {
                acc[fromId][toId] = distance
            } else {
                acc[fromId] = {}
                acc[fromId][toId] = distance
            }
            return acc
        }, {})

    // Prefix "M" stands it is a main station id
    const _fromMainId = MAIN_STATION_PREFIX + fromMainId
    // Construct the start route from departure station
    Array.from(new Set(rawGraph[fromMainId].map(it => it[0]))).forEach(it => {
        if (graph[_fromMainId]) {
            graph[_fromMainId][it] = 0
        } else {
            graph[_fromMainId] = {}
            graph[_fromMainId][it] = 0
        }
    })
    const _toMainId = MAIN_STATION_PREFIX + toMainId
    // Construct the end route to arrival station
    Array.from(new Set(rawGraph[toMainId].map(it => it[0]))).forEach(it => {
        if (graph[it]) {
            graph[it][_toMainId] = 0
        } else {
            graph[it] = {}
            graph[it][_toMainId] = 0
        }
    })
    return graph
}

export async function planRoute(rawGraph, fromMainId, toMainId, depTime, cb) {
    const graph = initGraph(rawGraph, fromMainId, toMainId)
    const allRoutes = []
    await findAllPaths(graph, MAIN_STATION_PREFIX + fromMainId, MAIN_STATION_PREFIX + toMainId, (path) => {
        console.log('path', path)
    })

}
