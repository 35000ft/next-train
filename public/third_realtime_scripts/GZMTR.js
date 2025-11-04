async function Third_FetchStationTrain(line, station) {
    if (!line?.thirdId || !station.thirdId) {
        return Promise.reject('Line thirdId and station thirdId must be provided')
    }
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
        return Promise.reject(`Fetch GZMTR train response: ${JSON.parse(data)}`)
    }
    return Promise.resolve(data)
}
