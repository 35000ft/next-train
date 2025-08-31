import axios from "src/utils/axios"
import {setCache} from "src/utils/common_utils";

const baseUrl = 'api/metro-realtime'

/**
 * Fetch all stations of a rail system
 * @param {String} railsystemCode Code of Rail system, like "NJMTR"
 */
export async function fetchStations(railsystemCode) {
    const url = `api/file/railsystem/stations/${railsystemCode}`
    return await axios
        .get(url)
        .then(res => {
            const stations = res.data.data || res.data
            if (!stations instanceof Array) {
                console.warn('stations is not a Array!', stations)
                return Promise.reject('Invalid Cache')
            }
            return stations
        })
        .catch(err => Promise.reject(err))
}

export async function fetchLines(railsystemCode) {
    const url = `api/file/railsystem/lines/${railsystemCode}`
    return await axios.get(url).then(res => {
        return res.data.data || res.data
    })
        .catch(err => Promise.reject(err))
}

export async function fetchRailsystem(railsystemCode) {
    const url = `api/metro-realtime/query/railsystem/${railsystemCode}`
    return await axios.get(url)
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
 */
export async function fetchLine(lineId) {
    const url = `api/file/railsystem/lines/id/${lineId}`
    return await axios
        .get(url)
        .then(res => {
            return res.data.data || res.data
        })
        .catch(err => Promise.reject(err))
}

export async function fetchStation(stationId) {
    const url = `api/file/railsystem/stations/id/${stationId}`
    return await axios
        .get(url)
        .then(res => {
            return res.data.data || res.data
        })
        .catch(err => Promise.reject(err))
}

export async function fetchGraph(railsystemCode) {
    const url = `api/file/railsystem/graphs/${railsystemCode}`
    return await axios
        .get(url)
        .then(res => {
            return res.data.data || res.data
        })
        .catch(err => Promise.reject(err))
}

export async function fetchTransfers(railsystemCode) {
    const url = `api/file/railsystem/transfers/${railsystemCode}`
    return await axios.get(url,).then(res => {
        return res.data.data || res.data
    })
        .catch(err => Promise.reject(err))
}

export async function fetchDrawLineTemplate(lineId) {
    const url = `api/file/railsystem/draw-line-templates/id/${lineId}`
    return await axios.get(url).then(res => res.data.data || res.data)
        .catch(err => Promise.reject(err))
}

export async function fetchShowLineCanvasConfig(railsystemCode) {
    const url = `api/file/railsystem/show-line-canvas-config/${railsystemCode}`
    return await axios.get(url).then(res => res.data.data)
        .catch(err => Promise.reject(err))
}

export async function createRailsystem(data) {
    const url = `${baseUrl}/railsystems/create`;
    return axios.post(url, data).then(res => res.data.data);
}

export async function updateRailsystem(id, data) {
    const url = `${baseUrl}/railsystems/${id}`;
    return axios.post(url, data).then(res => res.data.data)
}

export async function createLine(data) {
    const url = `${baseUrl}/lines/create`;
    return axios.post(url, data).then(res => res.data.data)
}

export async function updateLine(id, data) {
    const url = `${baseUrl}/lines/update/${id}`;
    return axios.post(url, data).then(res => res.data.data)
}

export async function createStation(data) {
    const url = `${baseUrl}/station/create`;
    return axios.post(url, data).then(res => res.data.data)
}

export async function updateStation(id, data) {
    const url = `${baseUrl}/station/update/${id}`;
    return axios.post(url, data).then(res => res.data.data)
}

export async function deleteStation(id, authCode) {
    if (!authCode) {
        return Promise.reject('Authcode can not be empty')
    }
    const url = `${baseUrl}/station/update/${id}?authCode=${authCode}`;
    return axios.post(url).then(res => res.data.data)
}

export async function preDeleteStation(id) {
    const url = `${baseUrl}/station/pre-delete-check/${id}`;
    return axios.post(url).then(res => res.data.data)
}

