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
    ARRIVED: {},
    DEPARTED: {},
    ARRIVE_SOON: {},
    ONTIME: {},
    DELAYED: {},
    CANCELED: {},
}

class TrainInfo {
    constructor(_t) {
        this.id = _t.id
        this.trainNo = _t.trainNo
        this.arr = _t.arr
        this.dep = _t.dep
        this.terminal = _t.terminal
        this.category = _t.category
        this.status = _t.status
    }

}

export {TRAIN_CATEGORY, TrainInfo}
