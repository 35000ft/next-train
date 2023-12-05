const host = "https://api.nmtr.site"

export async function fetchStationTrainInfo(stationId, lineId) {
    const url = `${host}/nj-metro-realtime/station/train-info/${stationId}/${lineId}`
    return await axios.post(url).then(res => {
        return res.data.data
    }, () => {
        console.log(`get stationId: ${stationId} lineId: ${lineId} trainInfo error!`)
        return Promise.reject()
    })
}

export async function fetchStationSchedule(stationId, lineId) {
    const url = `${host}/nj-metro-realtime/station/schedule/${stationId}/${lineId}`
    return await axios.post(url).then(res => {
        return res.data.data
    }, () => {
        console.log(`get stationId: ${stationId} lineId: ${lineId} schedule error!`)
        return Promise.reject()
    })
}
