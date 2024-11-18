//线网，线路，车站数据

import {toRaw} from "vue";
import LRUCache from "src/utils/LRU";

const railSystems = {
    'NJMTR': {
        name: '南京',
        code: 'NJMTR',
        lang: 'cn',
        fullname: '南京地铁',
        timezone: '+0800',
    },
    'GZMTR': {
        name: '广州',
        code: 'GZMTR',
        lang: 'cn',
        fullname: '广州地铁',
        timezone: '+0800',
    }
}
const stations = [{
    id: "2132",
    name: "南京站",
    code: "NJS",
    timezone: '+0800',
    railsystem: 'NJMTR',
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
    },]
}, {
    id: "2131",
    name: "新模范马路",
    timezone: '+0800',
    railsystem: 'NJMTR',
    lines: [{
        id: '1',
        name: "1号线",
        code: "L1",
        color: "#009ACE"
    }]
}, {
    id: "2130",
    name: "NAN JING ROAD",
    timezone: '+0800',
    railsystem: 'NJMTR',
    lines: [{
        id: '1',
        name: "1号线",
        code: "L1",
        color: "#009ACE"
    }]
}, {
    id: "98774",
    name: "鼓楼",
    timezone: '+0800',
    railsystem: 'NJMTR',
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
},]


const state = {
    currentRailSystem: railSystems['NJMTR'],
    currentStation: stations[0],
    railSystems: new Map(Object.entries(railSystems)),
    stations: new LRUCache(200),
    lines: new LRUCache(20),
}

const mutations = {

    SET_RAIL_SYSTEM_LINES(state, railsystemCode, lines) {
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
    SET_LINE(state, line) {
        if (line && line.id) {
            state.lines.set(line.id, line)
        }
    },
    SET_RAILSYSTEM(state, railsystem) {
        if (railsystem && railsystem.code) {
            state.railSystems.set(railsystem.id, railsystem)
        }
    },
    SET_LINE_STATIONS(state, lineId, stations) {
        if (state.lines.has(lineId)) {
            state.lines.get(lineId).stations = stations
            state.stations.batchSet(stations, (v) => v.id)
        }
    },
    SET_STATION(state, station) {
        if (station && station.id) {
            state.stations.set(station.id, station)
        }
    },
}

const actions = {
    async getRailSystem({state, commit}, code) {
        console.log('getRailSystem:', code)
        return state.railSystems.get(code)
    },
    async getStation({state, commit}, stationId) {
        // TODO
        let station = state.stations.get(stationId)
        if (!station) {
            station = stations.find(it => it.id === stationId)
            if (station) {
                mutations.SET_STATION(state, station)
            }
        }
        return station
    },
    async getAllStations({state, commit}) {
        const currentRailSystem = state.currentRailSystem
        //TODO
        if (currentRailSystem.stations) {
            return toRaw(currentRailSystem.stations)
        } else {
            currentRailSystem.stations = stations
            mutations.SET_RAILSYSTEM(state, currentRailSystem)
            return stations
        }
    },
    async getLine({state, commit}, lineId) {
        if (state.lines.has(lineId)) {
            const _line = state.lines.get(lineId)
            if (_line.stations instanceof Array) {
                return toRaw(_line)
            } else {
                _line.stations = await this.getStationsByLine({state, commit}, lineId)
                return _line
            }
        }
        return Promise.reject(`No such line, lineId:${lineId}`)
        //TODO
        // mutations.SET_LINE(state, line)
    },
    async getStationsByLine({state, commit}, lineId) {
        if (state.lines.has(lineId) && state.lines.get(lineId).stations) {
            return toRaw(state.lines.get(lineId).stations)
        }
        //TODO 从接口获取车站
        const _stations = stations
        mutations.SET_LINE_STATIONS(state, lineId, _stations)
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
            mutations.SET_RAIL_SYSTEM_LINES(state, railsystem.code, lines)
            return lines
            // return Promise.resolve(toRaw(railsystem.lines))
        }
    },
}

const getters = {
    currentRailSystem: state => state.currentRailSystem,
    currentStation: state => state.currentStation,
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};

