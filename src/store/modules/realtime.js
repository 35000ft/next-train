import dayjs from "dayjs";
import LRU from "src/utils/LRU";
import {trainScheduleParser, trainLineOfStopParser} from "src/models/Train";
import {reactive} from "vue";
import {isAfterNow, toLocalDatetime} from "src/utils/time-utils";
import {
    fetchScheduleHeader,
    fetchStationTrainInfo,
    fetchStationTrainInfoAtTime,
    fetchTrainInfoById
} from "src/apis/reailtime";

const state = {
    trainInfoMap: reactive(new LRU(100)),
    stationTrainInfoMap: reactive(new LRU(20)),
    stationTrainInfoDetailMap: reactive(new LRU(10)),
    LOCK: reactive(new Map()),
    lineScheduleHeaderMap: reactive(new LRU(20)),
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
    SET_STATION_TRAININFO_DETAIL(state, {trainInfoList, key}) {
        if (key && trainInfoList) {
            state.stationTrainInfoDetailMap.set(key, trainInfoList)
        }
    },
    SET_LOCK(state, {key}) {
        state.LOCK.set(key, true)
    },
    SET_LINE_SCHEDULE_HEADER(state, {lineScheduleHeader}) {
        if (lineScheduleHeader && lineScheduleHeader.lineId) {
            state.lineScheduleHeaderMap.set(lineScheduleHeader.lineId, lineScheduleHeader)
        }
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
                console.log('FetchStationTrain', 'stationId:' + stationId, 'lineId:' + lineId)
                fetchStationTrainInfo(stationId, lineId).then(_trains => {
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
    async fetchStationTrainAtTime({state, commit}, {stationId, lineId, depTime}) {
        if (lineId && stationId && depTime) {
            return new Promise((resolve, reject) => {
                depTime = toLocalDatetime(depTime)
                const lockKey = `fetchStationTrainAtTime:${stationId}-${lineId}-${depTime}`
                const _oldTrains = state.stationTrainInfoDetailMap.get(lockKey)
                if (_oldTrains) {
                    resolve(_oldTrains)
                    return
                }
                if (state.LOCK.has(lockKey)) {
                    setTimeout(() => {
                        resolve(this.dispatch('realtime/fetchStationTrainAtTime', {stationId, lineId, depTime}))
                    }, 1000)
                    return
                }
                //Add Lock
                commit('SET_LOCK', {key: lockKey})
                console.log('FetchStationTrainAtTime', 'stationId:' + stationId, 'lineId:' + lineId, 'time:' + depTime)
                fetchStationTrainInfoAtTime(stationId, lineId, depTime).then(_trains => {
                    commit('SET_STATION_TRAININFO_DETAIL', {trainInfoList: _trains, key: lockKey})
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
        if (stationTrainInfoMap) {
            const station = await this.dispatch('railsystem/getStation', {stationId})
            const lineTrains = stationTrainInfoMap.get(lineId)
            if (lineTrains) {
                if (isCurrent) {
                    const currentTrains = lineTrains.filter(it => isAfterNow(it.dep, station.timezone))
                    console.log('currentTrains', currentTrains)
                    if (currentTrains.length < 5) {
                        if (currentTrains.length === 0) {
                            return this.dispatch('realtime/fetchStationTrain', {stationId, lineId})
                        } else {
                            this.dispatch('realtime/fetchStationTrain', {stationId, lineId})
                            return currentTrains
                        }
                    } else {
                        return currentTrains
                    }
                } else {
                    return lineTrains
                }
            }
        }
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

    /**
     * 根据ID获取车次详情
     * @param commit
     * @param state
     * @param getters
     * @param {String|Number} trainInfoId
     * @param {String} date
     * @returns {Promise<Awaited<*>>}
     */
    async getTrainInfoById({commit, state,}, {trainInfoId, date}) {
        let trainInfo = state.trainInfoMap.get(trainInfoId);
        if (!trainInfo) {
            trainInfo = await fetchTrainInfoById(trainInfoId)
            if (!trainInfo) {
                return Promise.reject("No such trainInfo. id:" + trainInfoId)
            }
            //TODO 待实现根据车次时刻表设置默认date设置
            trainInfo.trainVia = trainLineOfStopParser(trainInfo)
            if (!date) {
                const railsystem = await this.dispatch("railsystem/getRailsystemByLineId", {lineId: trainInfo.trainVia[0].lineId})
                const nowTime = this.getters['application/getNowTime'](railsystem.timezone) || dayjs()
                date = nowTime.format('YYYY-MM-DD')
            }
            trainInfo.schedule = trainScheduleParser(trainInfo.schedule, date)
            commit('SET_TRAININFO', {trainInfo, trainInfoId})
        }
        if (trainInfo) {
            return Promise.resolve(trainInfo)
        } else {
            return Promise.reject('No such trainInfo. id:' + trainInfoId)
        }
    },

    /**
     *
     * @param commit
     * @param state
     * @param lineId
     * @param update 是否立即更新
     * @param date {String} 2024-10-15
     */
    async getLineScheduleHeaders({commit, state}, {lineId, update = false}) {
        const lineScheduleHeaders = state.lineScheduleHeaderMap.get(lineId)
        if (lineScheduleHeaders && !update) {
            return lineScheduleHeaders
        }
        return fetchScheduleHeader(lineId).then(lineScheduleHeaders => {
            commit('SET_LINE_SCHEDULE_HEADER', {lineScheduleHeaders})
            return lineScheduleHeaders
        })
    }
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
