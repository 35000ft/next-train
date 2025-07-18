const THIRD_ROUTE_PATH_MAP = new Map()
let circleRoutePath = [
    {lng: 118.71918, lat: 32.205823},
    {lng: 118.719176, lat: 32.205875},
    {lng: 118.719534, lat: 32.2059},
    {lng: 118.719533, lat: 32.20591},
    {lng: 118.719497, lat: 32.20616},
    {lng: 118.719433, lat: 32.20652},
    {lng: 118.719331, lat: 32.20723},
    {lng: 118.718791, lat: 32.207192},
    {lng: 118.718262, lat: 32.207146},
    {lng: 118.71823, lat: 32.207143},
    {lng: 118.717934, lat: 32.207111},
    {lng: 118.717873, lat: 32.207103},
    {lng: 118.716825, lat: 32.206969},
    {lng: 118.716765, lat: 32.206962},
    {lng: 118.716453, lat: 32.206942},
    {lng: 118.71629, lat: 32.206932},
    {lng: 118.715546, lat: 32.206862},
    {lng: 118.715543, lat: 32.206862},
    {lng: 118.714979, lat: 32.206773},
    {lng: 118.714762, lat: 32.20674},
    {lng: 118.714595, lat: 32.206714},
    {lng: 118.713843, lat: 32.206592},
    {lng: 118.713742, lat: 32.206576},
    {lng: 118.712972, lat: 32.206463},
    {lng: 118.712374, lat: 32.206393},
    {lng: 118.712312, lat: 32.206385},
    {lng: 118.711508, lat: 32.206277},
    {lng: 118.711498, lat: 32.206275},
    {lng: 118.711254, lat: 32.206279},
    {lng: 118.710248, lat: 32.206197},
    {lng: 118.710229, lat: 32.206195},
    {lng: 118.709701, lat: 32.20611},
    {lng: 118.709633, lat: 32.206107},
    {lng: 118.70921, lat: 32.20609},
    {lng: 118.708948, lat: 32.206055},
    {lng: 118.708647, lat: 32.206014},
    {lng: 118.708342, lat: 32.205959},
    {lng: 118.708015, lat: 32.20591},
    {lng: 118.707246, lat: 32.205826},
    {lng: 118.70722, lat: 32.205823},
    {lng: 118.707124, lat: 32.205814},
    {lng: 118.706459, lat: 32.205702},
    {lng: 118.70639, lat: 32.205695},
    {lng: 118.706102, lat: 32.205681},
    {lng: 118.706034, lat: 32.205682},
    {lng: 118.705673, lat: 32.205659},
    {lng: 118.705385, lat: 32.205652},
    {lng: 118.704875, lat: 32.205632},
    {lng: 118.70427, lat: 32.205632},
    {lng: 118.703782, lat: 32.205636},
    {lng: 118.70373, lat: 32.205638},
    {lng: 118.702952, lat: 32.205669},
    {lng: 118.702813, lat: 32.205675},
    {lng: 118.702641, lat: 32.205671},
    {lng: 118.701865, lat: 32.205708},
    {lng: 118.701149, lat: 32.205763},
    {lng: 118.700139, lat: 32.20587},
    {lng: 118.700139, lat: 32.205866},
    {lng: 118.700058, lat: 32.205343},
    {lng: 118.70005, lat: 32.205135},
    {lng: 118.70007, lat: 32.20481},
    {lng: 118.700147, lat: 32.204409},
    {lng: 118.70033, lat: 32.203863},
    {lng: 118.700444, lat: 32.203586},
    {lng: 118.701776, lat: 32.201563},
    {lng: 118.701788, lat: 32.201546},
    {lng: 118.702523, lat: 32.201889},
    {lng: 118.702936, lat: 32.202092},
    {lng: 118.703711, lat: 32.202461},
    {lng: 118.704177, lat: 32.20267},
    {lng: 118.704612, lat: 32.20287},
    {lng: 118.705004, lat: 32.203063},
    {lng: 118.70614, lat: 32.203543},
    {lng: 118.706153, lat: 32.203548},
    {lng: 118.706711, lat: 32.203754},
    {lng: 118.707545, lat: 32.20403},
    {lng: 118.70818, lat: 32.204181},
    {lng: 118.708698, lat: 32.204287},
    {lng: 118.708904, lat: 32.204322},
    {lng: 118.709709, lat: 32.204477},
    {lng: 118.71032, lat: 32.204563},
    {lng: 118.711393, lat: 32.204674},
    {lng: 118.711857, lat: 32.204727},
    {lng: 118.711859, lat: 32.204728},
    {lng: 118.71258, lat: 32.204824},
    {lng: 118.712834, lat: 32.20484},
    {lng: 118.71367, lat: 32.204944},
    {lng: 118.714336, lat: 32.205031},
    {lng: 118.71461, lat: 32.205092},
    {lng: 118.714819, lat: 32.205113},
    {lng: 118.714856, lat: 32.205116},
    {lng: 118.715107, lat: 32.205058},
    {lng: 118.715241, lat: 32.205018},
    {lng: 118.71545, lat: 32.204931},
    {lng: 118.715646, lat: 32.204759},
    {lng: 118.715814, lat: 32.204681},
    {lng: 118.715926, lat: 32.204697},
    {lng: 118.716545, lat: 32.204785},
    {lng: 118.71676, lat: 32.204852},
    {lng: 118.717218, lat: 32.20495},
    {lng: 118.717564, lat: 32.204985},
    {lng: 118.718067, lat: 32.205063},
    {lng: 118.719095, lat: 32.205157},
    {lng: 118.719183, lat: 32.20517},
    {lng: 118.719235, lat: 32.205196},
    {lng: 118.719226, lat: 32.205348},
    {lng: 118.719198, lat: 32.205563},
    {lng: 118.719194, lat: 32.205616},
    {lng: 118.71918, lat: 32.205822},
]
THIRD_ROUTE_PATH_MAP.set('CIRCLE', circleRoutePath)
const THIRD_VehicleInfoMap = new Map()
const THIRD_TrainInfoMap = new Map()

const __STOP_TIME__ = {
    '东苑南门': 120,
    '西苑食堂': 120,
}

// 对路线进行插值
function densifyRoute(routePath, segmentLength = 5) {
    const lineCoords = routePath.map(p => [p.lng, p.lat])
    const line = turf.lineString(lineCoords)

    const totalLength = turf.length(line, {units: 'meters'}) // 总长（单位：米）
    const numSegments = Math.floor(totalLength / segmentLength)

    const densifiedCoords = []

    for (let i = 0; i <= numSegments; i++) {
        const distance = (i * segmentLength) / 1000  // 转换为公里
        const point = turf.along(line, distance, {units: 'kilometers'})
        densifiedCoords.push(point.geometry.coordinates)
    }

    return densifiedCoords.map(coord => ({
        lng: coord[0],
        lat: coord[1]
    }))
}

function gcjToTurfPoint(lng, lat) {
    return turf.point(coordtransform.gcj02towgs84(Number(lng), Number(lat)))
}


async function intiJSession() {
    const params = new URLSearchParams({
        account: "njxxgc",
        password: "guzhb791126"
    });
    const url = `http://47.96.16.23:8080/StandardApiAction_login.action?${params.toString()}`
    try {
        const result = await Util_fetchThroughAllOrigins(url)
        const jsession = result?.jsession;
        if (!jsession) {
            throw new Error("未能从响应中获取到 jsession");
        }
        console.log("NUIST小公交实时jsession:", jsession);
        __NUIST__JSession = jsession
        return jsession
    } catch (error) {
        console.error("NUIST小公交实时初始化失败: 获取 jsession 出错：", error);
        return null;
    }
}

let __NUIST__JSession;
intiJSession().then(jsession => {
    circleRoutePath = densifyRoute(circleRoutePath, 5)
})

function calcTrainDirectionByHx(vehicleInfo, curPointOnLine, routePath) {
    // 两次位置未发生变化 使用车头朝向判断 currentVehicleInfo.hx 0为正北 顺时针增大
    const curPointIndex = curPointOnLine.properties.index
    if (curPointIndex === routePath.length - 1) {
        return 'down'
    }
    const lastPointIndex = Math.min(curPointIndex + 5, routePath.length - 1)
    const angles = []
    const nextPoints = routePath.slice(curPointIndex + 1, lastPointIndex)
    const vehicleHeading = vehicleInfo.hx
    for (let p of nextPoints) {
        const pGeo = turf.point([p.lng, p.lat])
        const lineBearing = turf.bearing(curPointOnLine, pGeo)
        let delta = (vehicleHeading - lineBearing + 360) % 360
        if (delta > 180) delta = 360 - delta  // 最小夹角
        angles.push(delta)
    }
    const average = angles.reduce((sum, val) => sum + val, 0) / angles.length;
    const isForward = average < 90
    console.log('通过方向判断 车辆:', vehicleInfo.vid, '平均夹角', average, '方向', vehicleHeading, '运行方向为:', isForward ? 'down' : 'up')
    return isForward ? 'down' : 'up'
}

function calculateDistanceOnLoop(vehicle, station, linePath, lineInfo) {
    if (!vehicle.direction) {
        console.warn('车辆方向为空时无法计算', vehicle)
        return
    }

    function calcOneStation(_station) {
        const [lng, lat] = _station.location.split(',').map(Number)
        const stationPoint = gcjToTurfPoint(lng, lat)
        const stationOnLine = turf.nearestPointOnLine(linePath, stationPoint)
        const lineStart = vehicle.geoPointOnLine
        // 计算路径总长度
        const totalLength = turf.length(linePath, {units: 'meters'})
        // 计算起点到车辆和站点的距离
        const stationDist = turf.length(turf.lineSlice(lineStart, stationOnLine, linePath), {units: 'meters'})
        let relativeDist
        if (vehicle.direction === 'down') {
            // 如果车辆位置的index大于车站位置index turf.lineSlice只会取两个点之间的线段长度 但此时relativeDist应为总长度-该段的长度
            if (lineStart.properties.index > stationOnLine.properties.index) {
                relativeDist = totalLength - Math.abs(stationDist)
            } else {
                relativeDist = Math.abs(stationDist)
            }
        } else if (vehicle.direction === 'up') {
            if (lineStart.properties.index > stationOnLine.properties.index) {
                relativeDist = Math.abs(stationDist)
            } else {
                relativeDist = totalLength - Math.abs(stationDist)
            }
        }
        // 车辆与车站的直线距离
        const absoluteDist = turf.distance(stationOnLine, vehicle.geoPoint, {units: 'meters'})
        return {
            relativeDist, absoluteDist, station: _station, stationOnLine
        }
    }

    const stops = lineInfo.stations.map(it => calcOneStation(it)).sort((o1, o2) => o1.relativeDist - o2.relativeDist)
    const {absoluteDist, relativeDist, stationOnLine} = calcOneStation(station)
    console.log('vehicle:' + vehicle?.vid, vehicle.id, vehicle.direction, '相对距离' + station.name, relativeDist,
        '绝对距离:' + absoluteDist,
        '车站坐标:' + JSON.stringify(stationOnLine.geometry.coordinates))
    return {
        absoluteDist,
        relativeDist,
        stationPointOnLine: stationOnLine,
        stops,
    }
}

// 初始化车辆信息 主要是判断上下行 需要通过看前后两次信息的位置变化进行判断
function initVehicleInfo(preVehicleInfo, currentVehicleInfo, routePath) {
    if (!currentVehicleInfo) {
        console.warn('currentVehicleInfo不能为空',)
        return null
    }
    if (isNaN(Number(currentVehicleInfo?.mlng)) || isNaN(Number(currentVehicleInfo?.mlat))) {
        console.warn('车辆坐标异常', currentVehicleInfo)
        return null
    }
    const linePath = turf.lineString(routePath.map(p => [p.lng, p.lat]))
    const curPoint = turf.point(coordtransform.gcj02towgs84(Number(currentVehicleInfo?.mlng), Number(currentVehicleInfo?.mlat)));
    currentVehicleInfo.geoPoint = curPoint
    currentVehicleInfo.geoPointOnLine = turf.nearestPointOnLine(linePath, curPoint)

    const curOnLine = currentVehicleInfo.geoPointOnLine
    const distanceInMeters = turf.distance(curPoint, curOnLine, {units: 'meters'});
    const bearing = turf.bearing(curOnLine, curOnLine)
    console.log('车辆位置', JSON.stringify(currentVehicleInfo.geoPoint?.geometry?.coordinates),
        '线上点位:' + JSON.stringify(curOnLine.geometry?.coordinates), '离线上最近的点距离:', distanceInMeters, '方向', bearing)

    if (!preVehicleInfo) {
        currentVehicleInfo.direction = calcTrainDirectionByHx(currentVehicleInfo, curOnLine, routePath)
    } else {
        preVehicleInfo.geoPoint = turf.point(coordtransform.gcj02towgs84(Number(preVehicleInfo.mlng), Number(preVehicleInfo.mlat)))
        preVehicleInfo.geoPointOnLine = turf.nearestPointOnLine(linePath, preVehicleInfo.geoPoint)

        const preOnLine = preVehicleInfo.geoPointOnLine
        const startPoint = turf.point([routePath[0].lng, routePath[0].lat])

        // 计算距离起点的距离（单位：米）
        const preDist = turf.length(turf.lineSlice(startPoint, preOnLine, linePath), {units: 'meters'});
        const curDist = turf.length(turf.lineSlice(startPoint, curOnLine, linePath), {units: 'meters'});

        if (preDist === curDist && !isNaN(Number(currentVehicleInfo?.hx))) {
            currentVehicleInfo.stop = true
            currentVehicleInfo.direction = calcTrainDirectionByHx(currentVehicleInfo, curOnLine, routePath)
        } else {
            currentVehicleInfo.stop = false
            const isDownward = curDist > preDist;
            // 判断车辆沿路线是上行还是下行
            const d = isDownward ? 'down' : 'up'
            if (typeof currentVehicleInfo.direction === "string" && d !== currentVehicleInfo.direction) {
                currentVehicleInfo.suspectedDirection = d
            } else {
                currentVehicleInfo.direction = d
            }
            //连续两次计算得出的方向一致 则更新方向
            if (typeof currentVehicleInfo.suspectedDirection) {
                currentVehicleInfo.suspectedDirection = null
                currentVehicleInfo.direction = d
            }
            console.log('通过位置变化判断 车辆:', currentVehicleInfo.vid, '运行方向为:', currentVehicleInfo.direction)
        }
    }


    return currentVehicleInfo
}

async function Third_FetchStationTrain(line, station) {
    if (!line || !station) {
        return Promise.reject('Line and Station Information must be provided!')
    }
    let data
    const queryKey = `${station.code}-${line.code}`
    const vehicleNoList = [
        'NXD1', 'NXD2', 'NXD3', 'NXD5', 'NXD6', 'NXD7', 'NXD8', 'NXD9', 'NXD10', 'NXD11', 'NXD12', 'NXD13'
    ]
    if (!__NUIST__JSession) {
        console.warn('JSession is not loaded, waiting')
        await new Promise((resolve) => setTimeout(resolve, 2000))
    }
    const params = new URLSearchParams({
        jsession: __NUIST__JSession,
        vehiIdno: vehicleNoList.join(','),
        toMap: 1,
    });
    const url = `http://47.96.16.23:8080/StandardApiAction_getDeviceStatus.action?${params.toString()}`
    try {
        data = await Util_fetchThroughAllOrigins(url, {parseToJson: true, noCache: true})
        if (!data.status instanceof Array) {
            throw new Error("响应无车辆信息")
        }
    } catch (e) {
        console.warn('Fetch bus error', e)
        if (THIRD_TrainInfoMap.has(queryKey)) {
            return THIRD_TrainInfoMap.get(queryKey)
        }
        if (__NUIST__JSession) {
            console.log('Try to renew JSession')
            await intiJSession()
            return Promise.reject('Try again')
        }
    }
    const linePath = turf.lineString(circleRoutePath.map(p => [p.lng, p.lat]))
    const trains = []
    // 排除不在线的车辆
    const onlineBuses = data.status.filter(it => it.ol === 1)
    if (onlineBuses.length === 0) {
        return []
    }
    for (let x of onlineBuses) {
        const vehicleInfo = initVehicleInfo(THIRD_VehicleInfoMap.get(x.id), x, circleRoutePath)
        if (vehicleInfo && line && station) {
            THIRD_VehicleInfoMap.set(x.id, vehicleInfo)
            const t = calcTrainInfo(vehicleInfo, line, station, linePath)
            if (t) {
                trains.push(t)
            }
        }
    }

    if (trains.length > 0) {
        THIRD_VehicleInfoMap.set(queryKey, trains)
    }
    return trains
}

/**
 *
 * @param distance
 * @param cruiseSpeed
 * @param acceleration
 * @returns {number}
 * @param trafficFactor 交通流量因子 影响巡航时速
 */
function estimateSegmentTime(distance, cruiseSpeed, acceleration = 1.0, trafficFactor = 1.0) {
    // cruiseSpeed 单位: m/s, acceleration 单位: m/s^2
    const accelTime = cruiseSpeed * trafficFactor / acceleration; // 加速时间
    const accelDist = 0.5 * acceleration * Math.pow(accelTime, 2); // 加速距离

    if (distance < 2 * accelDist) {
        // 距离太短，来不及匀速，只能加速后立即减速
        const t = Math.sqrt(distance / acceleration); // t1 = t2
        return 2 * t;
    } else {
        const cruiseDist = distance - 2 * accelDist;
        const cruiseTime = cruiseDist / cruiseSpeed;
        return 2 * accelTime + cruiseTime;
    }
}

/**
 *
 * @param targetStation 候车车站信息
 * @param vehicleInfo 车辆信息
 * @param relativeDist 相对距离（按路线行驶的距离）
 * @param absoluteDist 直线距离
 * @param stops 所有停车站
 * @returns {{remainStops: number, depTime: string, arrTime: string}}
 */
function calcETA(targetStation, vehicleInfo, relativeDist, absoluteDist, stops,) {
    // 距离小于30米且车辆处于停止状态则视为到站
    if (absoluteDist < 30 && vehicleInfo.stop) {
        const nowTimeString = Util_getTimeInTimeZone('Asia/Shanghai')
        const depTime = new Date()
        depTime.setSeconds(depTime.getSeconds() + 60)
        const depTimeString = Util_getTimeInTimeZone('Asia/Shanghai', depTime)
        return {
            arrTime: nowTimeString,
            depTime: depTimeString,
            remainStops: 0
        }
    }
    const targetStopIndex = stops.findIndex(it => it.station.id === targetStation.id)
    const remainStops = targetStopIndex + 1
    let totalTime = 0
    for (let i = 0; i <= targetStopIndex; i++) {
        const currentStop = stops[i]
        let distance = currentStop.relativeDist
        if (i > 0) {
            const preStop = stops[i - 1]
            distance = distance - preStop.relativeDist
        }
        const sec = estimateSegmentTime(distance, 25 / 3.6, 1.0)
        totalTime += sec
        if (i < targetStopIndex) {
            //TODO 停站时间 改为模型计算
            const stopTime = __STOP_TIME__[currentStop.station.name] || 30
            totalTime += stopTime
        }
    }
    const arr = new Date()
    arr.setSeconds(arr.getSeconds() + totalTime)
    const arrTime = Util_getTimeInTimeZone('Asia/Shanghai', arr)
    arr.setSeconds(arr.getSeconds() + 30)
    const depTime = Util_getTimeInTimeZone('Asia/Shanghai', arr)
    return {
        arrTime,
        depTime,
        remainStops: remainStops
    }
}

function calcTrainInfo(vehicleInfo, line, station, linePath) {
    const {
        absoluteDist,
        relativeDist,
        stops,
    } = calculateDistanceOnLoop(vehicleInfo, station, linePath, line)

    const trainSchedule = []
    for (let s of stops) {
        const {
            arrTime,
            depTime,
            remainStops
        } = calcETA(s.station, vehicleInfo, s.relativeDist, s.absoluteDist, stops)
        trainSchedule.push({
            stationId: s.station.id,
            stationName: s.station.name,
            arrTime,
            depTime,
        })
    }
    vehicleInfo.trainInfo = Util_toTrainInfoDetailResponse({
        id: vehicleInfo.id,
        schedule: trainSchedule,
        direction: vehicleInfo.direction,
        trainNo: vehicleInfo.vid,
        category: 'LOCAL',
    })

    const {
        arrTime,
        depTime,
        remainStops
    } = calcETA(station, vehicleInfo, relativeDist, absoluteDist, stops)
    console.log('距离', station.name, remainStops + '站', relativeDist + '米', 'ETA:' + arrTime)

    const curStationIndex = line.stations.findIndex(it => it.id === station.id)

    let dest = '未知'
    if (vehicleInfo.direction === 'down') {
        let nextStationIndex = curStationIndex + 1
        if (curStationIndex === line.stations.length - 1) {
            nextStationIndex = 0
        }
        const nextStation = line.stations[nextStationIndex]
        dest = `${nextStation?.name}·外环`
    } else if (vehicleInfo.direction === 'up') {
        let nextStationIndex = curStationIndex - 1
        if (curStationIndex === 0) {
            nextStationIndex = line.stations.length - 1
        }
        const nextStation = line.stations[nextStationIndex]
        dest = `${nextStation?.name}·内环`
    }
    const direction = vehicleInfo.direction === 'down' ? 0 : 1

    return {
        "arr": arrTime,
        "dep": depTime,
        "trainDate": depTime.slice(0, 10),
        "category": 'LOCAL',
        "id": vehicleInfo.id,
        "trainInfoId": vehicleInfo.id,
        "trainCode": vehicleInfo?.vid,
        "isLastStop": false,
        "isFirstStop": false,
        "direction": direction,
        "terminal": dest,
        "remainStops": remainStops > 0 ? remainStops : null,
        "distance": relativeDist,
    }
}
