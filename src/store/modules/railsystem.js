//线网，线路，车站数据

import {reactive, toRaw} from "vue";
import LRUCache from "src/utils/LRU";

const railSystems = {
    'NJMTR': {
        name: '南京',
        code: 'NJMTR',
        lang: 'cn',
        fullname: '南京地铁',
        timezone: '+0800',
        defaultStationId: "8"
    },
    'GZMTR': {
        name: '广州',
        code: 'GZMTR',
        lang: 'cn',
        fullname: '广州地铁',
        timezone: '+0800',
        defaultStationId: "10"
    }
}
const stations = [{
    id: "8",
    name: "南京站",
    code: "NJS",
    timezone: '+0800',
    railsystem: '南京地铁',
    lines: [{
        id: '1',
        name: "1号线",
        code: "L1",
        color: "#009ACE"
    }, {
        id: '3',
        name: "3号线",
        code: "L3",
        color: "#009A44"
    }, {
        id: '4',
        name: "4号线",
        code: "L4",
        color: "#7D55C7"
    }]
}, {
    id: "9",
    name: "新模范马路",
    timezone: '+0800',
    railsystem: '南京地铁',
    lines: [{
        id: '1',
        name: "1号线",
        code: "L1",
        color: "#009ACE"
    }]
}, {
    id: "10",
    name: "玄武门",
    timezone: '+0800',
    railsystem: '南京地铁',
    lines: [{
        id: '1',
        name: "1号线",
        code: "L1",
        color: "#009ACE"
    }]
}, {
    id: "11",
    name: "鼓楼",
    timezone: '+0800',
    railsystem: '南京地铁',
    lines: [{
        id: '1',
        name: "1号线",
        code: "L1",
        color: "#009ACE"
    }, {
        id: '4',
        name: "4号线",
        code: "L4",
        color: "#7D55C7"
    }
    ]
}
]
const lines = [{
    id: "1",
    name: "1号线",
    code: "L1",
    color: "#009ACE",
    stations
}, {
    id: "3",
    name: "3号线",
    code: "L3",
    color: "#009A44",
    stations
}, {
    id: "4",
    name: "4号线",
    code: "L4",
    color: "#7D55C7",
    stations
},]


const state = {
    currentRailSystem: railSystems['NJMTR'],
    railSystems: reactive(new Map(Object.entries(railSystems))),
    stations: reactive(new LRUCache(200)),
    lines: reactive(new LRUCache(100)),
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
        }
    },
}

const actions = {
    async getRailSystem({state, commit}, code) {
        return state.railSystems.get(code)
    },
    async getStation({state, commit}, stationId) {
        // TODO
        if (!stationId) {
            return Promise.reject(`stationId is undefined:${stationId}`)
        }
        const isFavourite = await this.dispatch('preference/isFavouriteStation', {stationId})
        console.log('is getStation', isFavourite, stationId)
        let station = state.stations.get(stationId)
        if (!station) {
            station = stations.find(it => it.id === stationId)
            if (station) {
                commit('SET_STATION', {station})
            }
        }
        station.isFavourite = isFavourite
        return station
    },
    async getAllStations({state, commit, getters}) {
        const currentRailSystem = state.currentRailSystem
        //TODO
        const favouriteStations = getters['preference/favouriteStations']
        if (currentRailSystem.stations) {
            return toRaw(currentRailSystem.stations)
        } else {
            currentRailSystem.stations = stations
            commit('SET_RAILSYSTEM', {currentRailSystem})
            return stations
        }
    },
    async getLine({state, commit}, lineId) {
        if (state.lines.has(lineId)) {
            const _line = state.lines.get(lineId)
            if (_line.stations instanceof Array) {
                return _line
            } else {
                _line.stations = await this.getStationsByLine({state, commit}, lineId)
                return _line
            }
        } else {
            //TODO
            commit('SET_LINE', {line: lines[2]})
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(lines[2])
                }, 1500)
            })
        }
    },
    async getStationsByLine({state, commit}, lineId) {
        if (state.lines.has(lineId) && state.lines.get(lineId).stations) {
            return toRaw(state.lines.get(lineId).stations)
        }
        //TODO 从接口获取车站
        const _stations = stations
        commit('SET_LINE_STATIONS', {lineId, stations: _stations})
        return _stations
    },
    async getRailSystems({state, commit, getters}) {
        const lang = getters['language/currentLanguage']
        return Array.from(toRaw(state.railSystems).values())
    },
    /**
     * 获取线网的所有线路信息
     * @param {String} railsystemCode
     * @returns {Promise<Array[Object]>}
     */
    async getRailSystemLines({state, commit, getters}, railsystemCode) {
        let railsystem
        if (!railsystemCode || railsystemCode === getters.currentRailSystem.code) {
            railsystem = getters.currentRailSystem
        } else {
            railsystem = await this.dispatch('railsystem/getRailSystem', railsystemCode)
        }
        if (railsystem.lines) {
            return Promise.resolve(toRaw(railsystem.lines))
        } else {
            //TODO 从接口获取
            commit('SET_RAIL_SYSTEM_LINES', {railsystemCode: railsystem.code, lines})
            return lines
        }
    },
    async getCurrentDefaultStation({commit}) {
        return
    }
}

const getters = {
    currentRailSystem: state => state.currentRailSystem,
    lines: state => state.lines
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};

