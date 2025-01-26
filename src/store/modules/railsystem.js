import {reactive, toRaw} from "vue";
import LRUCache from "src/utils/LRU";
import {fetchGraph, fetchLine, fetchLines, fetchStation, fetchStations, fetchTransfers} from "src/apis/railsystem";


const railSystems = {
    'NJMTR': {
        name: '南京',
        city: '南京',
        code: 'NJMTR',
        lang: 'zh-hans',
        fullname: '南京地铁',
        timezone: '+0800',
        defaultStationId: "13"
    },
}

const state = {
    currentRailSystem: railSystems['NJMTR'],
    railSystems: reactive(new Map(Object.entries(railSystems))),
    stations: reactive(new LRUCache(100)),
    lines: reactive(new LRUCache(50)),
    transferInfoMap: reactive(new LRUCache(5)),
}

const mutations = {
    SET_RAIL_SYSTEM_LINES(state, {railsystemCode, lines}) {
        const railsystem = state.railSystems.get(railsystemCode)
        if (!railsystemCode) {
            console.warn(`Set railsystem lines err, railsystem:${railsystemCode} dones exist`)
            return
        }
        if (lines && lines instanceof Array) {
            railsystem['lines'] = lines
            state.railSystems.set(railsystemCode, railsystem)
            state.lines.batchSet(lines, (v) => v['id'])
            console.log('Set railsystem lines OK, railsystem:', state.railSystems.get(railsystemCode))
        }
    },
    SET_LINE(state, {line}) {
        if (line && line.id) {
            state.lines.set(line.id, line)
            localStorage.setItem("line:" + line.id, JSON.stringify(line))
        }
    },
    SET_RAILSYSTEM(state, railsystem) {
        if (railsystem && railsystem.code) {
            state.railSystems.set(railsystem.id, railsystem)
        }
    },
    SET_LINE_STATIONS(state, {lineId, stations}) {
        if (state.lines.has(lineId)) {
            state.lines.get(lineId).stations = stations
            state.stations.batchSet(stations, (v) => v.id)
        }
    },
    SET_STATION(state, {station}) {
        if (station && station.id) {
            state.stations.set(station.id, station)
            localStorage.setItem("station:" + station.id, JSON.stringify(station))
        }
    },
    SET_TRANSFER_INFO(state, {railsystemCode, transferInfo}) {
        state.transferInfoMap.set(railsystemCode, transferInfo)
    }
}

const actions = {
    async getRailSystem({state, commit}, {code}) {
        return state.railSystems.get(code)
    },
    async getRailSystemGraph({state, commit}, {code}) {
        return fetchGraph(code)
    },
    async getTransferInfo({state, commit}, {fromId, fromPlatform, toId, toPlatform, fromMainId}) {
        const DEFAULT_TRANSFER_INFO = {
            needTime: 30,
            distance: 5,
            category: 'SAME_PLATFORM'
        }
        if (fromId === toId && fromPlatform === toPlatform) {
            return DEFAULT_TRANSFER_INFO
        }
        const fromStation = await this.dispatch('railsystem/getStation', {stationId: fromMainId})
        const transferInfo = await this.dispatch('railsystem/getRailSystemTransferInfo', {railsystemCode: fromStation.railsystemCode})
        const stationTransferInfo = transferInfo.filter(it => it.mainStationId.toString() === fromMainId)
            .filter(it => it.fromId.startsWith(fromId))
        if (!toPlatform) {
            const temp = stationTransferInfo.filter(it => it.toId.startsWith(toId))
            if (temp.length === 0) {
                return DEFAULT_TRANSFER_INFO
            } else {
                return temp.sort((o1, o2) => o1.needTime - o2.needTime)[0]
            }
        }
        const target = stationTransferInfo.find(it => it.fromId === fromId && it.toId === toId)
            || stationTransferInfo.find(it => it.fromId === fromId && it.toId === `${toId}-${toPlatform}`)
            || stationTransferInfo.find(it => it.fromId === `${fromId}-${fromPlatform}` && it.toId === toId)
            || stationTransferInfo.find(it => it.fromId === `${fromId}-${fromPlatform}` && it.toId === toId)
            || stationTransferInfo.find(it => it.fromId === `${fromId}-${fromPlatform}` && it.toId === `${toId}-${toPlatform}`)

        if (!target) {
            return DEFAULT_TRANSFER_INFO
        }
        return target
    },
    async getRailSystemTransferInfo({state, commit}, {railsystemCode}) {
        const transferInfo = state.transferInfoMap.get(railsystemCode)
        if (transferInfo) {
            return transferInfo
        }
        return fetchTransfers(railsystemCode).then(transferInfo => {
            commit('SET_TRANSFER_INFO', {railsystemCode, transferInfo})
            return transferInfo
        }).catch(err => {
            console.error(`Fetch transfer info error. railsystemCode:${railsystemCode} err:`, err)
        })
    },
    async getStation({state, commit}, {stationId}) {
        if (!stationId) {
            return Promise.reject(`stationId is undefined:${stationId}`)
        }
        const isFavourite = await this.dispatch('preference/isFavouriteStation', {stationId})
        let station = state.stations.get(stationId)
        if (!station) {
            return new Promise((resolve, reject) => {
                fetchStation(stationId).then(station => {
                    commit('SET_STATION', {station})
                    station.isFavourite = isFavourite
                    resolve(station)
                }).catch(err => {
                    reject(err)
                })
            })
        }
        if (!station) {
            return Promise.reject('Get station err stationId:' + stationId)
        }
        station.isFavourite = isFavourite
        return station
    },
    async getStationByIds({dispatch, state, commit}, {stationIds}) {
        const promises = []
        for (const stationId of stationIds) {
            const promise = dispatch('getStation', {stationId})
            promises.push(promise)
        }
        return await Promise.all(promises)
    },
    async getAllStations({state, commit}) {
        const currentRailSystem = state.currentRailSystem
        if (currentRailSystem.stations) {
            return currentRailSystem.stations
        } else {
            return fetchStations(currentRailSystem.code).then(stations => {
                currentRailSystem.stations = stations
                commit('SET_RAILSYSTEM', {currentRailSystem})
                return stations
            })
        }
    },
    async getLine({state, commit}, {lineId}) {
        if (state.lines.has(lineId)) {
            const _line = state.lines.get(lineId)
            if (_line.stations instanceof Array) {
                return _line
            } else {
                _line.stations = await this.getStationsByLine({state, commit}, {lineId})
                return _line
            }
        } else {
            const _line = JSON.parse(localStorage.getItem('line:' + lineId))
            if (_line) {
                commit('SET_LINE', {_line})
                return _line
            }
            return new Promise((resolve, reject) => {
                fetchLine(lineId).then(line => {
                    commit('SET_LINE', {line})
                    resolve(line)
                }).catch(err => {
                    reject(err)
                })
            })

        }
    },
    async getRailsystemByLineId({state, commit}, {lineId}) {
        const line = await this.dispatch("railsystem/getLine", {lineId})
        if (!line) {
            return Promise.reject('Line not found, lineId:' + lineId)
        }
        return this.dispatch("railsystem/getRailSystem", {code: line.railsystemCode})
    },
    async getStationsByLine({state, commit}, {lineId}) {
        if (state.lines.has(lineId) && state.lines.get(lineId).stations) {
            return toRaw(state.lines.get(lineId).stations)
        }
        //TODO 从接口获取车站
        const _stations = []
        commit('SET_LINE_STATIONS', {lineId, stations: _stations})
        return _stations
    },
    async getRailSystems({state, commit, getters}) {
        return Array.from(toRaw(state.railSystems).values())
    },
    /**
     * 获取线网的所有线路信息
     * @param {String} railsystemCode
     * @returns {Promise<Array[Object]>}
     * @param payload
     */
    async getRailSystemLines({state, commit, getters}, payload) {
        let railsystem
        let railsystemCode = payload && payload.railsystemCode
        if (!railsystemCode || railsystemCode === state.currentRailSystem.code) {
            railsystem = state.currentRailSystem
        } else {
            railsystem = await this.dispatch('railsystem/getRailSystem', {code: railsystemCode})
        }
        if (railsystem.lines) {
            return Promise.resolve(railsystem.lines)
        } else {
            return new Promise((resolve, reject) => {
                fetchLines(railsystem.code).then(lines => {
                    commit('SET_RAIL_SYSTEM_LINES', {railsystemCode: railsystem.code, lines})
                    lines.forEach(it => {
                        commit('SET_LINE', {line: it})
                    })
                    resolve(lines)
                }).catch(err => {
                    reject(err)
                })
            })
        }
    },
}

const getters = {
    currentRailSystem: state => state.currentRailSystem,
    lines: state => state.lines,
    railsystemGetter: state => (code) => state.railSystems.get(code)
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};

