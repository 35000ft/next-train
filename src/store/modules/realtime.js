import dayjs from "dayjs";
import LRU from "src/utils/LRU";
import {trainInfoParser} from "src/models/Train";
import {reactive} from "vue";

const state = {
    trainInfoMap: reactive(new LRU(100))
}

export const tempTrainInfo = {
    id: "67023",
    trainNo: "7442",
    category: "LOCAL",
    categoryNote: "1号线",
    direction: 0,
    viaCode: "ALL@1",
    schedule: [
        [
            "1",
            "八卦洲大桥南",
            dayjs(new Date()).add(-49, 'minute').toDate(),
            dayjs(new Date()).add(-48, 'minute').toDate()
        ],
        [
            "2",
            "笆斗山",
            dayjs(new Date()).add(-46, 'minute').toDate(),
            dayjs(new Date()).add(-45, 'minute').toDate()
        ],
        [
            "3",
            "燕子矶",
            dayjs(new Date()).add(-43, 'minute').toDate(),
            dayjs(new Date()).add(-42, 'minute').toDate()
        ],
        [
            "4",
            "吉祥庵",
            dayjs(new Date()).add(-41, 'minute').toDate(),
            dayjs(new Date()).add(-40, 'minute').toDate()
        ],
        [
            "5",
            "晓庄",
            dayjs(new Date()).add(-39, 'minute').toDate(),
            dayjs(new Date()).add(-38, 'minute').toDate()
        ],
        [
            "6",
            "迈皋桥",
            dayjs(new Date()).add(-37, 'minute').toDate(),
            dayjs(new Date()).add(-36, 'minute').toDate()
        ],
        [
            "7",
            "红山动物园",
            dayjs(new Date()).add(-35, 'minute').toDate(),
            dayjs(new Date()).add(-34, 'minute').toDate()
        ],
        [
            "8",
            "南京站",
            dayjs(new Date()).add(-33, 'minute').toDate(),
            dayjs(new Date()).add(-32, 'minute').toDate()
        ],
        [
            "9",
            "新模范马路",
            dayjs(new Date()).add(-31, 'minute').toDate(),
            dayjs(new Date()).add(-30, 'minute').toDate()
        ],
        [
            '10',
            "玄武门",
            dayjs(new Date()).add(-29, 'minute').toDate(),
            dayjs(new Date()).add(-28, 'minute').toDate()
        ],
        [
            "11",
            "鼓楼",
            dayjs(new Date()).add(-27, 'minute').toDate(),
            dayjs(new Date()).add(-26, 'minute').toDate()
        ],
        [
            "12",
            "珠江路",
            dayjs(new Date()).add(-25, 'minute').toDate(),
            dayjs(new Date()).add(-24, 'minute').toDate()
        ],
        [
            "13",
            "新街口",
            dayjs(new Date()).add(-23, 'minute').toDate(),
            dayjs(new Date()).add(-22, 'minute').toDate()
        ],
        [
            "14",
            "张府园",
            dayjs(new Date()).add(-19, 'minute').toDate(),
            dayjs(new Date()).add(-20, 'minute').toDate()
        ],
        [
            "15",
            "三山街",
            dayjs(new Date()).add(-18, 'minute').toDate(),
            dayjs(new Date()).add(-17, 'minute').toDate()
        ],
        [
            "16",
            "中华门",
            dayjs(new Date()).add(-15, 'minute').toDate(),
            dayjs(new Date()).add(-14, 'minute').toDate()
        ],
        [
            "17",
            "安德门",
            dayjs(new Date()).add(-12, 'minute').toDate(),
            dayjs(new Date()).add(-11, 'minute').toDate()
        ],
        [
            "18",
            "天隆寺",
            dayjs(new Date()).add(-9, 'minute').toDate(),
            dayjs(new Date()).add(-8, 'minute').toDate()
        ],
        [
            "19",
            "软件大道",
            dayjs(new Date()).add(-6, 'minute').toDate(),
            dayjs(new Date()).add(-5, 'minute').toDate()
        ],
        [
            "20",
            "花神庙",
            dayjs(new Date()).add(-3, 'minute').toDate(),
            dayjs(new Date()).add(-2, 'minute').toDate()
        ],
        [
            "21",
            "南京南站",
            dayjs(new Date()).add(0, 'minute').toDate(),
            dayjs(new Date()).add(2, 'minute').toDate()
        ],
        [
            "22",
            "双龙大道",
            dayjs(new Date()).add(4, 'minute').toDate(),
            dayjs(new Date()).add(5, 'minute').toDate()
        ],
        [
            "23",
            "河定桥",
            dayjs(new Date()).add(6, 'minute').toDate(),
            dayjs(new Date()).add(7, 'minute').toDate()
        ],
        [
            "24",
            "胜太路",
            dayjs(new Date()).add(9, 'minute').toDate(),
            dayjs(new Date()).add(10, 'minute').toDate()
        ],
        [
            "25",
            "百家湖",
            dayjs(new Date()).add(12, 'minute').toDate(),
            dayjs(new Date()).add(13, 'minute').toDate()
        ],
        [
            "26",
            "小龙湾",
            dayjs(new Date()).add(15, 'minute').toDate(),
            dayjs(new Date()).add(16, 'minute').toDate()
        ],
        [
            "27",
            "竹山路",
            dayjs(new Date()).add(18, 'minute').toDate(),
            dayjs(new Date()).add(19, 'minute').toDate()
        ],
        [
            "28",
            "天印大道",
            dayjs(new Date()).add(21, 'minute').toDate(),
            dayjs(new Date()).add(22, 'minute').toDate()
        ],
        [
            "29",
            "龙眠大道",
            dayjs(new Date()).add(24, 'minute').toDate(),
            dayjs(new Date()).add(25, 'minute').toDate()
        ],
        [
            "30",
            "南医大·江苏经贸学院",
            dayjs(new Date()).add(28, 'minute').toDate(),
            dayjs(new Date()).add(30, 'minute').toDate()
        ],
        [
            "31",
            "南京交院",
            dayjs(new Date()).add(32, 'minute').toDate(),
            dayjs(new Date()).add(33, 'minute').toDate()
        ],
        [
            "32",
            "中国药科大学",
            dayjs(new Date()).add(35, 'minute').toDate(),
            dayjs(new Date()).add(36, 'minute').toDate()
        ]
    ],
}


const line1Trains = [{
    direction: "中国药科大学",
    trains: [{
        id: "23",
        trainNo: "5101",
        arr: dayjs(new Date()).add(7, 'minute').toDate(),
        dep: dayjs(new Date()).add(10, 'minute').toDate(),
        terminal: "中国药科大学ASDSADDSADA",
        category: ["LOCAL",]
    }, {
        id: "424",
        trainNo: "5103",
        arr: dayjs(new Date()).add(4, 'minute').toDate(),
        dep: dayjs(new Date()).add(5, 'minute').toDate(),
        terminal: "河定桥",
        category: ["SHORT",]
    }, {
        id: "78967",
        trainNo: "5107",
        arr: dayjs(new Date()).add(8, 'minute').toDate(),
        dep: dayjs(new Date()).add(9, 'minute').toDate(),
        terminal: "河定桥",
        category: ["SHORT",]
    }, {
        id: "746854",
        trainNo: "5203",
        arr: dayjs(new Date()).add(15, 'minute').toDate(),
        dep: dayjs(new Date()).add(17, 'minute').toDate(),
        terminal: "河定桥",
        category: ["SHORT",]
    }
    ]
}, {
    direction: "八卦洲大桥南",
    trains: [{
        id: "1474",
        trainNo: "5102",
        arr: dayjs(new Date()).add(1, 'minute').toDate(),
        dep: dayjs(new Date()).add(2, 'minute').toDate(),
        terminal: "迈皋桥",
        category: ["SHORT",]
    }, {
        id: "2752",
        trainNo: "5104",
        arr: dayjs(new Date()).add(2, 'minute').toDate(),
        dep: dayjs(new Date()).add(5, 'minute').toDate(),
        terminal: "八卦洲大桥南",
        category: ["LOCAL",]
    },]
},
]
const line3Trains = [{
    direction: "林场",
    trains: [{
        id: "78654",
        trainNo: "4101",
        arr: dayjs(new Date()).add(3, 'minute').toDate(),
        dep: dayjs(new Date()).add(4, 'minute').toDate(),
        terminal: "林场",
        category: ["LOCAL",]
    }, {
        id: "73245",
        trainNo: "4103",
        arr: dayjs(new Date()).add(7, 'minute').toDate(),
        dep: dayjs(new Date()).add(10, 'minute').toDate(),
        terminal: "林场",
        category: ["LOCAL",]
    }]
}, {
    direction: "秣周东路",
    trains: [{
        id: "788",
        trainNo: "4102",
        arr: dayjs(new Date()).add(1, 'minute').toDate(),
        dep: dayjs(new Date()).add(2, 'minute').toDate(),
        terminal: "秣周东路",
        category: ["LOCAL",]
    }, {
        id: "6786",
        trainNo: "4104",
        arr: dayjs(new Date()).add(2, 'minute').toDate(),
        dep: dayjs(new Date()).add(5, 'minute').toDate(),
        terminal: "胜太西路",
        category: ["SHORT",]
    },]
},
]
const tm = {
    "1": line1Trains,
    "3": line3Trains
}
const mutations = {
    SET_TRAININFO(trainInfoId, trainInfo) {
        //TODO state.trainInfoMap.set(trainInfo.id, trainInfo)
        state.trainInfoMap.set(trainInfoId, trainInfo)
    }
}

const actions = {
    loadStationTrains({commit}, {stationId, lineId}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(tm[lineId])
            }, 1200)
        })
    },
    //TODO
    getTrainInfoById({commit, state}, {trainInfoId}) {
        let trainInfo = state.trainInfoMap.get(trainInfoId);
        if (!trainInfo) {
            //TODO 请求接口
            trainInfo = trainInfoParser(tempTrainInfo)
            mutations.SET_TRAININFO(trainInfoId, trainInfo)
        }
        if (trainInfo) {
            return Promise.resolve(trainInfo)
        } else {
            return Promise.reject('No such trainInfo. id:' + trainInfo)
        }
    },

}

const getters = {
    trainInfoMap: state => state.trainInfoMap
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
}
