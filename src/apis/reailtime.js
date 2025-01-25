import axios from "src/utils/axios"
import {toLocalDatetime} from "src/utils/time-utils";

export async function fetchStationTrainInfo(stationId, lineId) {
    const url = `api/metro-realtime/station/train-info/v2/${stationId}/${lineId}`
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

export async function fetchStationScheduleV2(stationId, scheduleId) {
    const url = `api/metro-realtime/station/schedule/v3/${stationId}/${scheduleId}`
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

/**
 *
 * @param stationId
 * @param lineId
 * @param depTime
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export async function fetchStationTrainInfoAtTime(stationId, lineId, depTime) {
    const url = `api/metro-realtime/train-info/scheduled/${stationId}/${lineId}`
    const body = {
        stationId, lineId, time: toLocalDatetime(depTime)
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
