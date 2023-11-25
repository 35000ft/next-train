export async function fetchStationTrainInfo(stationId, lineId) {
    const url = `http://localhost/nj-metro-realtime/station/train-info/${stationId}/${lineId}`
    // const url = `https://api.35000ft.top/nj-metro-realtime/station/train-info/${stationId}/${lineId}`
    return await axios.post(url).then(res => {
        return res.data.data
    }, () => {
        console.log(`get stationId: ${stationId} lineId: ${lineId} trainInfo error!`)
        return null
    })
}

export async function fetchStationSchedule(stationId, lineId) {
    const url = `http://localhost/nj-metro-realtime/station/schedule/${stationId}/${lineId}`
    // const url = `https://api.35000ft.top/nj-metro-realtime/station/schedule/${stationId}/${lineId}`
    return await axios.post(url).then(res => {
        return res.data.data
    }, () => {
        console.log(`get stationId: ${stationId} lineId: ${lineId} schedule error!`)
        return null
    })
}
