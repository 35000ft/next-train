import dayjs from "dayjs";

const state = {}

const line1Trains = [{
    direction: "中国药科大学",
    trains: [{
        id: 23,
        trainNo: "5101",
        arr: dayjs(new Date()).add(7, 'minute').toDate(),
        dep: dayjs(new Date()).add(10, 'minute').toDate(),
        terminal: "中国药科大学",
    }, {
        id: 424,
        trainNo: "5103",
        arr: dayjs(new Date()).add(4, 'minute').toDate(),
        dep: dayjs(new Date()).add(5, 'minute').toDate(),
        terminal: "河定桥",
    }]
}, {
    direction: "八卦洲大桥南",
    trains: [{
        id: 1474,
        trainNo: "5102",
        arr: dayjs(new Date()).add(1, 'minute').toDate(),
        dep: dayjs(new Date()).add(2, 'minute').toDate(),
        terminal: "迈皋桥",
    }, {
        id: 2752,
        trainNo: "5104",
        arr: dayjs(new Date()).add(2, 'minute').toDate(),
        dep: dayjs(new Date()).add(5, 'minute').toDate(),
        terminal: "八卦洲大桥南",
    },]
},
]
const line3Trains = [{
    direction: "林场",
    trains: [{
        id: 78654,
        trainNo: "4101",
        arr: dayjs(new Date()).add(3, 'minute').toDate(),
        dep: dayjs(new Date()).add(4, 'minute').toDate(),
        terminal: "林场",
    }, {
        id: 73245,
        trainNo: "4103",
        arr: dayjs(new Date()).add(7, 'minute').toDate(),
        dep: dayjs(new Date()).add(10, 'minute').toDate(),
        terminal: "林场",
    }]
}, {
    direction: "秣周东路",
    trains: [{
        id: 788,
        trainNo: "4102",
        arr: dayjs(new Date()).add(1, 'minute').toDate(),
        dep: dayjs(new Date()).add(2, 'minute').toDate(),
        terminal: "秣周东路",
    }, {
        id: 6786,
        trainNo: "4104",
        arr: dayjs(new Date()).add(2, 'minute').toDate(),
        dep: dayjs(new Date()).add(5, 'minute').toDate(),
        terminal: "胜太西路",
    },]
},
]
const tm = {
    "1": line1Trains,
    "3": line3Trains
}
const mutations = {}

const actions = {
    loadStationTrains({commit}, {stationId, lineId}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(tm[lineId])
            }, 1200)
        })
    },
}

const getters = {}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
}
