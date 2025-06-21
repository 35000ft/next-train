import axios from "src/utils/axios"

/**
 * Fetch all stations of a rail system
 * @param {String} railsystemCode Code of Rail system, like "NJMTR"
 * @param update is force update
 */
export async function fetchStations(railsystemCode, update = false) {
    const url = `api/file/railsystem/stations/${railsystemCode}${update ? '?v=latest' : ''}`
    return await axios
        .get(url,)
        .then(res => {
            return res.data.data || res.data
        })
        .catch(err => {
            console.log('err', err)
            return Promise.reject(err)
        })
}

export async function fetchLines(railsystemCode, update = false) {
    const url = `api/file/railsystem/lines/${railsystemCode}${update ? '?v=latest' : ''}`
    return await axios.get(url).then(res => res.data.data || res.data)
        .catch(err => {
            return Promise.reject(err)
        })
}

export async function fetchRailsystem(railsystemCode, update = false) {
    const url = `api/metro-realtime/query/railsystem/${railsystemCode}${update ? '?v=latest' : ''}`
    return await axios.get(url).then(res => res.data.data || res.data)
        .catch(err => {
            return Promise.reject(err)
        })
}

/**
 * Fetch line by id
 * @param {String} lineId Id of line
 * @param update
 */
export async function fetchLine(lineId, update = false) {
    const url = `api/file/railsystem/lines/id/${lineId}${update ? '?v=latest' : ''}`
    return await axios
        .get(url)
        .then(res => {
            return res.data.data || res.data
        })
        .catch(err => {
            return Promise.reject(err)
        })
}

export async function fetchStation(stationId, update = false) {
    const url = `api/file/railsystem/stations/id/${stationId}${update ? '?v=latest' : ''}`
    return await axios
        .get(url)
        .then(res => {
            return res.data.data || res.data
        })
        .catch(err => {
            return Promise.reject(err)
        })
}

export async function fetchGraph(railsystemCode, update = false) {
    const url = `api/file/railsystem/graphs/${railsystemCode}${update ? '?v=latest' : ''}`
    return await axios
        .get(url)
        .then(res => {
            return res.data.data || res.data
        })
        .catch(err => {
            return Promise.reject(err)
        })
}

export async function fetchTransfers(railsystemCode, update = false) {
    const url = `api/file/railsystem/transfers/${railsystemCode}${update ? '?v=latest' : ''}`
    return await axios.get(url).then(res => res.data.data || res.data)
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
