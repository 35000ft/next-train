import axios from "axios";

const host = 'http://111.229.192.148'
const local = 'http://localhost'

export async function fetchScheduledTrainInfo(stationId, lineId, time) {
    const url = `${host}/nj-metro-realtime/train-info/scheduled`
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
    const url = `${host}/nj-metro-realtime//station/train-info/${stationId}/${lineId}`
    return await axios
        .post(url)
        .then(res => {
            const _d = res.data.data.map(it => {
                return {
                    id: it.trainInfoId.toString(),
                    trainNo: it.trainInfoId.toString(),
                    arr: it.arrTime.replace(' ', 'T'),
                    dep: it.depTime.replace(' ', 'T'),
                    terminal: it.terminal,
                    category: [it.trainType],
                    direction: it.direction ? 0 : 1,
                }
            })
            return _d
        })
        .catch(err => {
            return Promise.reject(err)
        })
}
