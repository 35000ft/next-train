import axios from "src/utils/axios"

export async function fetchScheduledTrainInfo(stationId, lineId, time) {
    const url = `api/metro-realtime/train-info/scheduled`
    return await axios
        .post(url, {
            stationId: stationId,
            lineIdList: [lineId],
            time: time
        })
        .then(res => {
            return res.data.data
        })
        .catch(err => {
            return Promise.reject(err)
        })
}

export async function fetchStationCurrentTrainInfo(stationId, lineId) {
    const url = `api/metro-realtime/station/train-info/${stationId}/${lineId}`
    return await axios
        .post(url)
        .then(res => {
            return res.data.data
        })
        .catch(err => {
            return Promise.reject(err)
        })
}

export async function fetchStationSchedule(stationId, lineId) {
    const url = `api/metro-realtime/station/schedule/v2/${stationId}/${lineId}`
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
    const url = `api/metro-realtime/train-info/id/${id}`
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
