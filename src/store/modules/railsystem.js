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


const state = {
  currentRailSystem: railSystems['NJMTR'],
  railSystems: new Map(Object.entries(railSystems)),
  stations: null,
  lines: null,
}

const mutations = {
  SET_CURRENT_RAIL_SYSTEM(state, railsystem) {
    state.currentRailSystem = railsystem;
    localStorage.setItem('currentRailSystem', JSON.stringify(railsystem))
  },
}

const actions = {
  getRailSystem({state, commit}, code) {
    return state.railSystems.get(code)
  },
  async getRailSystems({state, commit, getters}) {
    const lang = getters['language/currentLanguage']
    return Promise.resolve(Array.from(toRaw(state.railSystems).values()))
  },
  setCurrentRailSystem({commit}, railSystem) {
    commit('SET_CURRENT_RAIL_SYSTEM', railSystem)
  }
}

const getters = {
  currentRailSystem: state => state.currentRailSystem
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};

