const __generateId = () => {
    return 'HKMTR-tid-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
};

async function Third_FetchStationTrain(line, station) {
    const parseOneTrain = (item, direction) => {
        if (!item?.time) {
            return null
        }
        const date = new Date(item['time'].replace(' ', 'T'))
        date.setTime(date.getTime() + (480 * 60 * 1000))
        const depTime = date.toISOString().slice(0, 19);
        date.setSeconds(date.getSeconds() - 40);
        const arrTime = date.toISOString().slice(0, 19);
        const category = line?.code === 'AEL' ? 'EXPRESS' : 'LOCAL'
        let dest = line.stations.find(it => it.code === item['dest'])
        if (!dest) {
            dest = item['dest']
        } else {
            dest = dest.name
        }
        const id = __generateId()
        return {
            "arr": arrTime,
            "dep": depTime,
            "trainDate": date.toISOString().slice(0, 10),
            "category": category,
            "id": id,
            "trainInfoId": id,
            "isLastStop": false,
            "isFirstStop": false,
            "direction": direction,
            "terminal": dest,
            "platform": item?.plat
        }
    }
    if (!line?.code || !station.code) {
        return Promise.reject('Line code and station code must be provided')
    }
    const url = `https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${line.code}&sta=${station.code}`
    const r = fetch(url, {method: "GET", referrer: 'no-referrer', mode: 'cors',})
        .then(res => res).catch(e => e)
    const rr = await r
    const res = await rr.json()
    if (res.status !== 1) {
        return Promise.reject(res)
    }
    const data = Object.values(res?.data)
    if (data.length === 0) {
        return Promise.reject('No data available')
    }
    const trainData = data[0]
    const results = []
    const upData = trainData['UP'] || []
    results.push(...upData.map(it => parseOneTrain(it, 1)))
    const downData = trainData['DOWN'] || []
    results.push(...downData.map(it => parseOneTrain(it, 0)))
    return Promise.resolve(results)
}
