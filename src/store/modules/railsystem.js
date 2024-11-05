//线网，线路，车站数据

import {toRaw} from "vue";

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
const lines = [{
  id: 1,
  name: "1号线",
  code: "L1",
  color: "#009ACE"
}, {
  name: "3号线",
  code: "L3",
  color: "#009A44"
},]

const stations = [{
  id: 2132,
  name: "南京站",
  secName: "Nanjing Railway Station",
  code: "NJS",
  lines: [{
    name: "1号线",
    secName: "Line 1",
    code: "L1",
    color: "#009ACE"
  }, {
    name: "3号线",
    secName: "Line 3",
    code: "L3",
    color: "#009A44"
  },]
}, {
  id: 2131,
  name: "新模范马路",
  secName: "XINMOFANGMALU",
  lines: [{
    name: "1号线",
    secName: "Line 1",
    code: "L1",
    color: "#009ACE"
  }]
}, {
  id: 2130,
  name: "玄武门",
  secName: "XUANWUMEN",
  lines: [{
    name: "1号线",
    secName: "Line 1",
    code: "L1",
    color: "#009ACE"
  }]
}]

const state = {
  currentRailSystem: railSystems['NJMTR'],
  currentStation: stations[0],
  railSystems: new Map(Object.entries(railSystems)),
  stations: new Map(),
  lines: new Map(),
}

const mutations = {
  SET_CURRENT_RAIL_SYSTEM(state, railsystem) {
    state.currentRailSystem = railsystem;
    localStorage.setItem('currentRailSystem', JSON.stringify(railsystem))
  },
  SET_CURRENT_STATION(state, station) {
    state.stations = station;
    localStorage.setItem('currentStation', JSON.stringify(station))
  },
  SET_RAIL_SYSTEM_LINES(state, railsystemCode, lines) {
    const railsystem = state.railSystems.get(railsystemCode)
    if (!railsystemCode) {
      console.warn(`Set railsystem lines err, railsystem:${railsystemCode} dones exist`)
      return
    }
    if (lines && lines instanceof Array) {
      railsystem['lines'] = lines
      state.railSystems.set(railsystemCode, railsystem)
      console.log('Set railsystem lines OK, railsystem:', state.railSystems.get(railsystemCode))
    }
  },
  SET_LINE(state, line) {
    if (line && line.id) {
      state.lines.set(line.id, line)
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
    return Promise.resolve(state.railSystems.get(stationId))
  },
  async getLine({state, commit}, lineId) {
    if (state.lines.has(lineId)) {
      return Promise.resolve(toRaw(state.lines.get(lineId)))
    }
    //TODO
    // mutations.SET_LINE(state, line)
  },
  async getRailSystems({state, commit, getters}) {
    const lang = getters['language/currentLanguage']
    return Promise.resolve(Array.from(toRaw(state.railSystems).values()))
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
      // return Promise.resolve(toRaw(railsystem.lines))
    }
  },

  setCurrentRailSystem({commit}, railSystem) {
    commit('SET_CURRENT_RAIL_SYSTEM', railSystem)
  }
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

