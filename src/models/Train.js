import {
    diffFromNow, formatToHHMM,
    secondsToHHMM,
    toDayjs,
    toDayjsBySecondsOfDay
} from "src/utils/time-utils";
import dayjs from "dayjs";

const TRAIN_CATEGORY = {
    NORMAL: {
        code: 'local',
        bgColor: '#36598f'
    },
    LOCAL: {
        code: 'local',
        bgColor: '#36598f'
    },
    EXPRESS: {
        code: 'express',
        bgColor: '#e37b00'
    },
    NONSTOP: {
        code: 'nonstop',
        bgColor: '#d96658'
    },
    THROUGH: {
        code: 'through',
        bgColor: '#286663'
    },
    SHORT: {
        code: 'short',
        bgColor: '#53658a'
    },
    INITIAL: {
        code: 'initial',
        bgColor: '#009A44'
    },
    TERMINAL: {
        code: 'terminal',
        bgColor: '#A6093D'
    },
    THROUGH_EXPRESS: {
        code: 'through_express',
        bgColor: '#ab658a'
    },
    ZT: {
        code: 'zt',
        bgColor: '#d96658'
    },
    KS: {
        code: 'ks',
        bgColor: '#36598f'
    },
    TK: {
        code: 'tk',
        bgColor: '#ab658a'
    },
}

const TRAIN_STATUS = {
    ARRIVED: {
        code: 'arrived',
        color: '#c50c4d'
    },
    DEPARTED: {
        code: 'departed',
        color: '#888888'
    },
    ARRIVE_SOON: {
        code: 'arriveSoon'
    },
    ONTIME: {
        code: 'ontime',
        color: '#009A44'
    },
    DELAYED: {
        code: 'delayed'
    },
    CANCELED: {
        code: 'canceled'
    },
}

/**
 *
 * @param {Date} dep
 * @param {Date} arr
 */
function calcTrainStatus({dep, arr}) {
    const depDiffFromNow = diffFromNow(dep)
    const arrDiffFromNow = diffFromNow(arr)
    if (depDiffFromNow <= 0) {
        return [TRAIN_STATUS.DEPARTED, depDiffFromNow]
    }
    if (arrDiffFromNow > 0) {
        if (arrDiffFromNow < 30) {
            return [TRAIN_STATUS.ARRIVE_SOON, arrDiffFromNow]

        } else {
            return [TRAIN_STATUS.ONTIME, arrDiffFromNow]
        }
    }
    if (depDiffFromNow > 0 && arrDiffFromNow <= 0) {
        return [TRAIN_STATUS.ARRIVED, depDiffFromNow]
    } else {
        console.error('Calculate train status err, unsupported dep or arr:', dep, arr)
        return null
    }
}

const categoryParser = (category) => {
    return TRAIN_CATEGORY[category] || TRAIN_CATEGORY.LOCAL
}

const stopInfoParse = (stopInfo, timezone) => {
    if (stopInfo instanceof Array && stopInfo.length >= 5) {
        const temp = {
            stationId: stopInfo[0] || null,
            stationName: stopInfo[1],
            arr: toDayjs(stopInfo[2], timezone),
            dep: toDayjs(stopInfo[3], timezone),
            platform: stopInfo[4] || null,
            lineId: stopInfo[5] || null,
            direction: stopInfo[6],
            timezone,
        }
        const _diff = temp.dep.diff(temp.arr, 'second')
        if (_diff < 0) {
            temp.arr = temp.arr.add(1, 'day')
        }
        return temp
    } else {
        console.warn('Parse stop info err', stopInfo)
        return null
    }
}

/**
 *
 * @param {[]}schedule
 * @param {String} date 2024-12-25
 * @param {String} timezone +08:00
 * @return {*|*[]}
 */
const trainScheduleParser = (schedule, date, timezone) => {
    if (schedule instanceof Array) {
        return schedule.map(it => {
            return {
                stationId: it[0],
                stationName: it[1],
                arr: toDayjsBySecondsOfDay(date, it[2], timezone),
                dep: toDayjsBySecondsOfDay(date, it[3], timezone),
                arrStr: secondsToHHMM(it[2]),
                depStr: secondsToHHMM(it[3]),
                platform: it[4],
                lineId: it[5],
                direction: it[6],
                timezone,
            }
        })
    }
    return []
}

const thirdTrainScheduleParser = (schedule, timezone) => {
    if (schedule) {
        return schedule.map(it => {
            return {
                stationId: it.stationId,
                stationName: it.stationName,
                arr: toDayjs(it.arrTime, timezone),
                dep: toDayjs(it.depTime, timezone),
                arrStr: formatToHHMM(it.arrTime),
                depStr: formatToHHMM(it.depTime),
                platform: it?.platform,
                lineId: it?.lineId,
            }
        })
    }
    return []
}

/**
 *
 * @param {Object}trainInfo
 * @returns {[{toIndex: number, lineId: string, fromIndex: number}]}
 */
const trainLineOfStopParser = (trainInfo) => {
    const {viaCode, schedule} = trainInfo
    let segments = viaCode.split("_")
    if (segments.length > 0) {
        const [stationIndexCode, lineId] = segments[0].split("@")
        if (stationIndexCode === 'ALL') {
            return [{
                fromIndex: 0,
                toIndex: schedule.length - 1,
                lineId: lineId
            }]
        }
        const result = []
        for (let s of segments) {
            const _s = s.split("@")
            const fromTo = _s[0].split("-")
            result.push({
                fromIndex: Number(fromTo[0]) - 1,
                toIndex: Number(fromTo[1]) - 1,
                lineId: _s[1]
            })
        }
        return result
    }
    return []
}


export {
    TRAIN_CATEGORY,
    TRAIN_STATUS,
    calcTrainStatus,
    stopInfoParse,
    categoryParser,
    trainLineOfStopParser,
    trainScheduleParser,
    thirdTrainScheduleParser,
}
