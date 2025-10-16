import axios from "src/utils/axios"
import {OperationMsg} from "src/models/OperationMsg";

export async function fetchStationTrainInfo(stationId, lineId) {
    const url = `api/metro-realtime/realtime/train-info/station/v2/${stationId}/${lineId}`
    return await axios
        .post(url)
        .then(res => {
            return res.data.data
        })
        .catch(err => {
            return Promise.reject(err)
        })
}

export async function fetchStationSchedule(stationId, scheduleId) {
    const url = `api/metro-realtime/realtime/train-info/station/schedule/v3/${stationId}/${scheduleId}`
    return await axios
        .post(url)
        .then(res => {
            return res.data.data
        })
        .catch(err => {
            return Promise.reject(err)
        })
}

export async function fetchTrainInfoById(id) {
    const url = `api/metro-realtime/realtime/train-info/id/${id}`
    return await axios
        .get(url)
        .then(res => {
            return res.data.data
        })
        .catch(err => {
            return Promise.reject(err)
        })
}

export async function fetchScheduleHeader(lineId) {
    const url = `api/metro-realtime/schedules/header/get/line/${lineId}`
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
 *
 * @param stationId
 * @param lineId
 * @param depTime
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export async function fetchStationTrainInfoAtTime(stationId, lineId, depTime) {
    const url = `api/metro-realtime/realtime/train-info/station/scheduled/${stationId}/${lineId}`
    const body = {
        stationId, lineId, time: depTime
    }
    return await axios
        .post(url, body)
        .then(res => {
            return res.data.data
        })
        .catch(err => {
            return Promise.reject(err)
        })
}

export async function fetchLineOnServiceTrains(lineId) {
    const url = `api/metro-realtime/realtime/train-info/on-service/line/${lineId}`
    return await axios.post(url).then(res => res.data.data).catch(err => Promise.reject(err))
}

export async function fetchOperationMsg(stationId, form) {
    const url = `api/metro-realtime/op-msg/station/${stationId}`
    return await axios.post(url, form).then(res => {
        if (res.data.data) {
            return res.data.data.map(it => new OperationMsg(it))
        } else {
            return []
        }
    })
        .catch(err => Promise.reject(err))
}

export async function fetchLineSchedules(lineId) {
    const url = `api/metro-realtime/schedules/m/line/${lineId}`
    return await axios.post(url).then(res => res.data.data).catch(err => Promise.reject(err))
}

export async function fetchScheduleRule(id) {
    const url = `api/metro-realtime/schedules/m/schedule-rule/get/id/${id}`
    return await axios.get(url).then(res => res.data.data).catch(err => Promise.reject(err))
}

export async function updateScheduleRule(id, data) {
    const url = `api/metro-realtime/schedules/m/schedule-rule/update/id/${id}`;
    return axios.post(url, data).then(res => res.data.data)
}

export async function createScheduleRule(data) {
    const url = `api/metro-realtime/schedules/m/schedule-rule/create`;
    return axios.post(url, data).then(res => res.data.data)
}

export async function fetchSchedule(id) {
    const url = `api/metro-realtime/schedules/m/id/${id}`
    return await axios.get(url).then(res => res.data.data).catch(err => Promise.reject(err))
}

export async function fetchScheduleDropdown(data) {
    const url = `api/metro-realtime/schedules/m/dropdown`
    return await axios.post(url, data).then(res => res.data.data).catch(err => Promise.reject(err))
}

export async function updateSchedule(id, data) {
    const url = `api/metro-realtime/schedules/m/update/id/${id}`;
    return axios.post(url, data).then(res => res.data.data)
}

export async function createSchedule(id, data) {
    const url = `api/metro-realtime/schedules/m/screate/id/${id}`;
    return axios.post(url, data).then(res => res.data.data)
}
