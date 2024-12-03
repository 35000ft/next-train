import dayjs from "dayjs";
import LRU from "src/utils/LRU";
import {trainInfoParser} from "src/models/Train";
import {reactive} from "vue";
import {getNowByTimezone, isAfterNow} from "src/utils/time-utils";
import {fetchStationCurrentTrainInfo} from "src/apis/reailtime";

const state = {
    trainInfoMap: reactive(new LRU(100)),
    stationTrainInfoMap: reactive(new LRU(20)),
    LOCK: reactive(new Map())
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
            dayjs(new Date()).add(-49, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-48, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "2",
            "笆斗山",
            dayjs(new Date()).add(-46, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-45, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "3",
            "燕子矶",
            dayjs(new Date()).add(-43, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-42, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "4",
            "吉祥庵",
            dayjs(new Date()).add(-41, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-40, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "5",
            "晓庄",
            dayjs(new Date()).add(-39, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-38, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "6",
            "迈皋桥",
            dayjs(new Date()).add(-37, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-36, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "7",
            "红山动物园",
            dayjs(new Date()).add(-35, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-34, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "8",
            "南京站",
            dayjs(new Date()).add(-33, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-32, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "9",
            "新模范马路",
            dayjs(new Date()).add(-31, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-30, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            '10',
            "玄武门",
            dayjs(new Date()).add(-29, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-28, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "11",
            "鼓楼",
            dayjs(new Date()).add(-27, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-26, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "12",
            "珠江路",
            dayjs(new Date()).add(-25, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-24, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "13",
            "新街口",
            dayjs(new Date()).add(-23, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-22, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "14",
            "张府园",
            dayjs(new Date()).add(-19, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-20, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "15",
            "三山街",
            dayjs(new Date()).add(-18, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-17, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "16",
            "中华门",
            dayjs(new Date()).add(-15, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-14, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "17",
            "安德门",
            dayjs(new Date()).add(-12, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-11, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "18",
            "天隆寺",
            dayjs(new Date()).add(-9, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-8, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "19",
            "软件大道",
            dayjs(new Date()).add(-6, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-5, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "20",
            "花神庙",
            dayjs(new Date()).add(-3, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(-2, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "21",
            "南京南站",
            dayjs(new Date()).add(0, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(2, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "22",
            "双龙大道",
            dayjs(new Date()).add(4, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(5, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "23",
            "河定桥",
            dayjs(new Date()).add(6, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(7, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "24",
            "胜太路",
            dayjs(new Date()).add(9, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(10, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "25",
            "百家湖",
            dayjs(new Date()).add(12, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(13, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "26",
            "小龙湾",
            dayjs(new Date()).add(15, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(16, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "27",
            "竹山路",
            dayjs(new Date()).add(18, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(19, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "28",
            "天印大道",
            dayjs(new Date()).add(21, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(22, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "29",
            "龙眠大道",
            dayjs(new Date()).add(24, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(25, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "30",
            "南医大·江苏经贸学院",
            dayjs(new Date()).add(28, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(30, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "31",
            "南京交院",
            dayjs(new Date()).add(32, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(33, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ],
        [
            "32",
            "中国药科大学",
            dayjs(new Date()).add(35, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
            dayjs(new Date()).add(36, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        ]
    ],
}

const mutations = {
    SET_TRAININFO(state, {trainInfoId, trainInfo}) {
        //TODO state.trainInfoMap.set(trainInfo.id, trainInfo)
        state.trainInfoMap.set(trainInfoId, trainInfo)
    },
    SET_STATION_TRAININFO(state, {trainInfoList, stationId, lineId}) {
        if (stationId && lineId && trainInfoList) {
            const stationTrainInfoMap = state.stationTrainInfoMap.get(stationId, new Map());
            stationTrainInfoMap.set(lineId, trainInfoList)
            state.stationTrainInfoMap.set(stationId, stationTrainInfoMap)
        }
    },
    SET_LOCK(state, {key}) {
        state.LOCK.set(key, true)
    },
    UNLOCK(state, {key}) {
        state.LOCK.delete(key)
    },
}

const actions = {
    async fetchStationTrain({state, commit}, {stationId, lineId}) {
        if (lineId && stationId) {
            return new Promise((resolve, reject) => {
                const lockKey = `fetchStationTrain:${stationId}-${lineId}`
                if (state.LOCK.has(lockKey)) {
                    const stationTrainInfoMap = state.stationTrainInfoMap.get(stationId)
                    const _oldTrains = stationTrainInfoMap && stationTrainInfoMap.get(lineId)
                    resolve(_oldTrains || [])
                    return
                }
                commit('SET_LOCK', {key: lockKey})
                fetchStationCurrentTrainInfo(stationId, lineId).then(_trains => {
                    commit('SET_STATION_TRAININFO', {trainInfoList: _trains, stationId, lineId})
                    resolve(_trains)
                }).catch(err => {
                    reject(err)
                }).finally(_ => {
                    commit('UNLOCK', {key: lockKey})
                })
            })
        } else {
            return Promise.reject('stationId and lineId cannot be undefined')
        }
    },
    async getStationTrains({commit, state}, {stationId, lineId, isCurrent = true}) {
        if (!(stationId && lineId)) {
            return Promise.reject('stationId and lineId cannot be undefined')
        }
        const stationTrainInfoMap = state.stationTrainInfoMap.get(stationId)
        const station = await this.dispatch('railsystem/getStation', {stationId})
        if (stationTrainInfoMap) {
            const lineTrains = stationTrainInfoMap.get(lineId)
            if (lineTrains) {
                if (isCurrent) {
                    const currentTrains = lineTrains.filter(it => isAfterNow(it.dep, station.timezone))
                    if (currentTrains.length < 10) {
                        this.dispatch('realtime/fetchStationTrain', {stationId, lineId})
                    }
                    return currentTrains
                } else {
                    return lineTrains
                }
            }
        }
        //TODO fetch by api
        return this.dispatch('realtime/fetchStationTrain', {stationId, lineId})
    },
    async getStationDirectionTrains({commit}, {stationId, lineId, eachDirectionLimit = 3}) {
        let _trains = await this.dispatch('realtime/getStationTrains', {stationId, lineId})
        let trainDirectionMap = _trains.reduce((acc, cur) => {
            if (cur.direction == null) {
                cur.direction = -1
            }
            if (!acc.has(cur.direction)) {
                acc.set(cur.direction, [])
            }
            const _data = acc.get(cur.direction)
            if (!_data.trains) {
                _data.trains = []
            }
            if (!_data.directions) {
                _data.directions = new Set()
            }
            _data.trains.push(cur)
            if (!_data.directions.has(cur.terminal)) {
                _data.directions.add(cur.terminal)
            }
            return acc
        }, new Map())
        let hasOther = false
        let _result = [...trainDirectionMap]
            .sort((a, b) => a[0] - b[0])
            .map(item => {
                const directionCode = item[0]
                const _data = item[1]
                let direction
                if (directionCode === -1) {
                    direction = 'OTHER'
                    hasOther = true
                } else {
                    direction = Array.from(_data.directions.values()).join(' / ')
                }
                const ___trains = _data.trains.slice(0, eachDirectionLimit).sort((i1, i2) => i1.dep.localeCompare(i2.dep))
                return {
                    direction: direction,
                    trains: ___trains
                }
            })
        if (hasOther) {
            _result = [..._result.slice(1), _result[0]]
        }
        return _result
    },
    //TODO
    getTrainInfoById({commit, state}, {trainInfoId}) {
        let trainInfo = state.trainInfoMap.get(trainInfoId);
        if (!trainInfo) {
            //TODO 请求接口
            trainInfo = trainInfoParser(tempTrainInfo)
            commit('SET_TRAININFO', {trainInfo, trainInfoId})
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
