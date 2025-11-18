const lineMap = new Map() // key: Third Line ID value: line data
const RAILSYSTEM_CODE = 'GZMTR'

async function Third_FetchStationTrain(line, station) {
    if (!line?.thirdId || !station.thirdId) {
        return Promise.reject('Line thirdId and station thirdId must be provided')
    }
    lineMap.set(line.thirdId, line)
    const url = `https://nmtr.online/api/metro-trace/gzmtr/station/trains?station_no=${station.thirdId}&line_id=${line.thirdId}`
    const r = fetch(url, {
        method: "POST", mode: 'cors', headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(res => res).catch(e => e)
    const rr = await r
    const data = await rr.json()
    if (!(data instanceof Array)) {
        console.warn('Fetch GZMTR train error: invalid response', data)
        return Promise.reject(`Fetch GZMTR train error`)
    }
    data.forEach(it => {
        it.id = Util_generateTrainInfoId(RAILSYSTEM_CODE, it.id)
    })
    return Promise.resolve(data)
}

async function Third_FetchTrainInfoById(trainInfoId) {
    const rawId = trainInfoId.split('@').slice(-1)[0]
    const temp = rawId.split('_')
    if (temp.length !== 2) {
        return Promise.reject('Invalid train info id')
    }
    const thirdLineId = temp[1]
    const lineData = lineMap.get(thirdLineId)
    const url = `https://nmtr.online/api/metro-trace/gzmtr/trains/detail/id?train_id=${rawId}`
    const r = fetch(url, {
        method: "POST", mode: 'cors', headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(res => res).catch(e => e)
    const rr = await r
    const data = await rr.json()
    if (!data) {
        console.warn('Fetch GZMTR train detail error: invalid response', data)
        return Promise.reject(`Fetch GZMTR train detail error`)
    }
    data.lineId = lineData?.id
    data.timezone = '+08:00'
    const parsedData = Util_toTrainInfoDetailResponse(data, RAILSYSTEM_CODE)
    return Promise.resolve(parsedData)
}
