import axios from "src/utils/axios"

/**
 * Fetch all stations of a rail system
 * @param {String} railsystemCode Code of Rail system, like "NJMTR"
 */
export async function fetchStations(railsystemCode) {
    const url = `api/file/railsystem/stations/${railsystemCode}`
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

export async function fetchLines(railsystemCode) {
    const url = `api/file/railsystem/lines/${railsystemCode}`
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

export async function fetchRailsystem(railsystemCode) {
    const url = `api/metro-realtime/query/railsystem/id/${railsystemCode}`
    return await axios
        .get(url)
        .then(res => {
            return res.data.data || res.data
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
            return res.data.data || res.data
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
            return res.data.data || res.data
        })
        .catch(err => {
            return Promise.reject(err)
        })
}

export async function fetchGraph(railsystemCode) {
    const url = `api/file/railsystem/graphs/${railsystemCode}`
    return await axios
        .get(url)
        .then(res => {
            return res.data.data || res.data
        })
        .catch(err => {
            return Promise.reject(err)
        })
}

export async function fetchTransfers(railsystemCode) {
    const url = `api/file/railsystem/transfers/${railsystemCode}`
    return await axios
        .get(url)
        .then(res => {
            return res.data.data || res.data
        })
        .catch(err => {
            return Promise.reject(err)
        })
}
