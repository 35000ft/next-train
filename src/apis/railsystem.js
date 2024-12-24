import axios from "src/utils/axios"

/**
 * Fetch all stations of a rail system
 * @param {String} railsystemCode Code of Rail system, like "NJMTR"
 * @param {String} version Version of Rail system like '240125
 */
export async function fetchStations(railsystemCode, version) {
    const url = `api/file/railsystem/stations/${railsystemCode}`
    return await axios
        .get(url, {params: {v: version || ""}})
        .then(res => {
            return {
                stations: res.data.data,
                version: res.headers['version'] || version
            }
        })
        .catch(err => {
            console.log('err', err)
            return Promise.reject(err)
        })
}

export async function fetchLines(railsystemCode, version) {
    const url = `api/file/railsystem/lines/${railsystemCode}`
    return await axios
        .get(url, {params: {v: version || ""}})
        .then(res => {
            return {
                lines: res.data.data,
                version: res.headers['version'] || version
            }
        })
        .catch(err => {
            console.log('err', err)
            return Promise.reject(err)
        })
}

export async function fetchRailsystem(railsystemCode) {
    const url = `api/metro-realtime/query/railsystem/id/${railsystemCode}`
    return await axios
        .get(url)
        .then(res => {
            return res.data.data
        })
        .catch(err => {
            return Promise.reject(err)
        })
}

/**
 * Fetch line by id
 * @param {String} lineId Id of line
 */
export async function fetchLine(lineId) {
    const url = `api/file/railsystem/lines/id/${lineId}`
    return await axios
        .get(url)
        .then(res => {
            return res.data.data
        })
        .catch(err => {
            return Promise.reject(err)
        })
}

export async function fetchStation(stationId) {
    const url = `api/file/railsystem/stations/id/${stationId}`
    return await axios
        .get(url)
        .then(res => {
            return res.data.data
        })
        .catch(err => {
            return Promise.reject(err)
        })
}

