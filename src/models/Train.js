import {diffFromNow} from "src/utils/time-utils";
import dayjs from "dayjs";

const TRAIN_CATEGORY = {
    LOCAL: {
        code: 'local',
        bgColor: '#36598f'
    },
    EXPRESS: {
        code: 'express',
        bgColor: '#EA7600'
    },
    NONSTOP: {
        code: 'nonstop',
        bgColor: '#F1B434'
    },
    THROUGH: {
        code: 'through',
        bgColor: '#E89CAE'
    },
    SHORT: {
        code: 'short',
        bgColor: '#009ACE'
    },
    INITIAL: {
        code: 'initial',
        bgColor: '#009A44'
    },
    TERMINAL: {
        code: 'terminal',
        bgColor: '#A6093D'
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

/**
 *
 * @param {Array[4]} stopInfo
 * @returns {{ stationName: String,stationId: String, dep: dayjs.Dayjs, arr: dayjs.Dayjs}}
 */
const stopInfoParser = (stopInfo) => {
    return {
        stationId: stopInfo[0],
        stationName: stopInfo[1],
        arr: dayjs(stopInfo[2]),
        dep: dayjs(stopInfo[3]),
    }
}

const categoryParser = (category) => {
    return TRAIN_CATEGORY[category] || TRAIN_CATEGORY.LOCAL
}

/**
 *
 * @param {[]}schedule
 * @param {String} date 2024-12-25
 * @return {*|*[]}
 */
const trainScheduleParser = (schedule, date) => {
    if (schedule) {
        return schedule.map(it => {
            return {
                stationId: it[0],
                stationName: it[1],
                arr: dayjs(date).startOf('day').add(it[2], 'seconds'),
                dep: dayjs(date).startOf('day').add(it[3], 'seconds'),
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

/**
 *
 * @param viaString 1@1D-32@1U
 * @return [] [{lineId: '1', from:{id:'1', direction:'+'}, to:{id:'32', direction:'-'}}]
 *
 */
const trainViaParser = (viaString) => {
    let useLines = viaString.split('-')
    useLines = useLines.reduce((result, value, index) => {
        if (index === 0) return result
        if ((index + 1) % 2 === 0) {
            const [from, to] = useLines.slice(index - 1, index + 1)
            const [fromId, fromLine] = from.split('@')
            const [toId, toLine] = to.split('@')
            const r = {
                lineId: fromLine.substring(0, fromLine.length - 1),
                from: {
                    id: fromId,
                    direction: fromLine.substring(fromLine.length - 1) === 'D' ? '+' : '-'
                },
                to: {
                    id: toId,
                    direction: toLine.substring(toLine.length - 1) === 'D' ? '+' : '-'
                }
            }
            result.push(r)
        }
        return result
    }, [])
    console.log('toLine', useLines)
    return useLines
}

export {
    TRAIN_CATEGORY,
    TRAIN_STATUS,
    trainViaParser,
    calcTrainStatus,
    categoryParser,
    trainLineOfStopParser,
    trainScheduleParser
}
