import axios from "src/utils/axios"
import {toLocalDatetime} from "src/utils/time-utils";
import {OperationMsg} from "src/models/OperationMsg";

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

export async function fetchLineOnServiceTrains(lineId) {
    const url = `api/metro-realtime/train-info/on-service/line/${lineId}`
    return await axios.post(url).then(res => res.data.data).catch(err => Promise.reject(err))
}

//TODO
const operationMsg = [
    {
        "id": "1",
        "level": "HIGH",
        "message": "因5号线割接施工安排，5号线南段（吉印大道站——文靖路站）于2025年1月1日至3月15日临时停止运营服务。因5号线割接施工安排，5号线南段（吉印大道站——文靖路站）于2025年1月1日至3月15日临时停止运营服务。",
        "sourceCategory": "OFFICIAL",
        "sourceName": "南京地铁官方微博",
        "sourceUrl": "https://weibo.com/ttarticle/p/show?id=2309405116290540110311",
        "validTime": "2024-12-27T00:00:00+08:00",
        "expireTime": "2025-03-15T23:59:59+08:00"
    }
]

//TODO
export async function fetchOperationMsg(stationId, form) {
    const url = `api/metro-realtime/op-msg/station/${stationId}`
    // return await axios.post(url).then(res => res.data.data).catch(err => Promise.reject(err))
    return operationMsg.map(it => new OperationMsg(it))
}
