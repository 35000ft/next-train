import axios from "src/utils/axios"
import {setCache} from "src/utils/common_utils";

/**
 * Fetch all stations of a rail system
 * @param {String} railsystemCode Code of Rail system, like "NJMTR"
 * @param update is force update
 */
export async function fetchStations(railsystemCode, update = false) {
    const url = `api/file/railsystem/stations/${railsystemCode}`
    const cacheKey = `railsystems-stations-${railsystemCode}`
    return await axios
        .get(url, {
            fetchOptions: {
                cacheKey: cacheKey, forceUpdate: update
            }
        })
        .then(res => {
            setCache(cacheKey, 86400 * 1000)
            return res.data.data || res.data
        })
        .catch(err => Promise.reject(err))
}

export async function fetchLines(railsystemCode, update = false) {
    const url = `api/file/railsystem/lines/${railsystemCode}`
    const cacheKey = `railsystems-lines-${railsystemCode}`
    return await axios.get(url, {
        fetchOptions: {
            cacheKey: cacheKey, forceUpdate: update
        }
    }).then(res => {
        setCache(cacheKey, 86400 * 1000)
        return res.data.data || res.data
    })
        .catch(err => Promise.reject(err))
}

export async function fetchRailsystem(railsystemCode, update = false) {
    const url = `api/metro-realtime/query/railsystem/${railsystemCode}`
    const cacheKey = `railsystems-${railsystemCode}`
    return await axios.get(url, {
        fetchOptions: {
            cacheKey: cacheKey, forceUpdate: update
        }
    })
        .then(res => res.data.data || res.data)
        .catch(err => Promise.reject(err))
}

export async function listRailsystem() {
    const url = `api/metro-realtime/query/railsystem/list`
    return await axios.get(url)
        .then(res => res.data.data || res.data)
        .catch(err => Promise.reject(err)
        )
}


/**
 * Fetch line by id
 * @param {String} lineId Id of line
 * @param update
 */
export async function fetchLine(lineId, update = false) {
    const url = `api/file/railsystem/lines/id/${lineId}`
    const cacheKey = `railsystems-line-${lineId}`
    return await axios
        .get(url, {
            fetchOptions: {
                cacheKey: cacheKey, forceUpdate: update
            }
        })
        .then(res => {
            setCache(cacheKey, 86400 * 1000)
            return res.data.data || res.data
        })
        .catch(err => Promise.reject(err))
}

export async function fetchStation(stationId, update = false) {
    const url = `api/file/railsystem/stations/id/${stationId}`
    const cacheKey = `railsystems-station-${stationId}`
    return await axios
        .get(url, {
            fetchOptions: {
                cacheKey: cacheKey, forceUpdate: update
            }
        })
        .then(res => {
            setCache(cacheKey, 86400 * 1000)
            return res.data.data || res.data
        })
        .catch(err => Promise.reject(err))
}

export async function fetchGraph(railsystemCode, update = false) {
    const url = `api/file/railsystem/graphs/${railsystemCode}${update ? '?v=latest' : ''}`
    const cacheKey = `railsystems-graphs-${railsystemCode}`
    return await axios
        .get(url, {
            fetchOptions: {
                cacheKey: cacheKey, forceUpdate: update
            }
        })
        .then(res => {
            setCache(cacheKey, 86400 * 1000)
            return res.data.data || res.data
        })
        .catch(err => Promise.reject(err))
}

export async function fetchTransfers(railsystemCode, update = false) {
    const url = `api/file/railsystem/transfers/${railsystemCode}`
    const cacheKey = `railsystems-transfers-${railsystemCode}`
    return await axios.get(url, {
        fetchOptions: {
            cacheKey: cacheKey, forceUpdate: update
        }
    }).then(res => {
        setCache(cacheKey, 86400 * 1000)
        return res.data.data || res.data
    })
        .catch(err => Promise.reject(err))
}

export async function fetchDrawLineTemplate(lineId, update = false) {
    const url = `api/file/railsystem/draw-line-templates/id/${lineId}${update ? '?v=latest' : ''}`
    return await axios.get(url).then(res => res.data.data || res.data)
        .catch(err => Promise.reject(err))
}

export async function fetchShowLineCanvasConfig(railsystemCode) {
    const url = `api/file/railsystem/show-line-canvas-config/${railsystemCode}`
    return await axios.get(url).then(res => res.data.data)
        .catch(err => Promise.reject(err))
}
