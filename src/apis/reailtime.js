import axios from "axios";

// const host = 'http://111.229.192.148'
const host = 'http://localhost'


export async function fetchScheduledTrainInfo(stationId, lineId, time) {
    const url = `${host}/metro-realtime/train-info/scheduled`
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
    const url = `${host}/metro-realtime/station/train-info/${stationId}/${lineId}`
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
    const url = `${host}/metro-realtime/station/schedule/v2/${stationId}/${lineId}`
    return await axios
        .post(url)
        .then(res => {
            return res.data.data
        })
        .catch(err => {
            return Promise.reject(err)
        })
}
