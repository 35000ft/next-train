import {diffFromNow} from "src/utils/time-utils";

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
        code: 'arrived'
    },
    DEPARTED: {
        code: 'departed'
    },
    ARRIVE_SOON: {
        code: 'arriveSoon'
    },
    ONTIME: {
        code: 'ontime'
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
        console.log('le', dep, new Date())
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


export {TRAIN_CATEGORY, TRAIN_STATUS, calcTrainStatus}
