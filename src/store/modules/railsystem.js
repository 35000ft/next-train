//线网，线路，车站数据

const railSystems = {
  'NJMTR': {
    name: '南京',
    code: 'NJMTR',
    lang: 'cn',
    fullname: '南京地铁',
  },
  'GZMTR': {
    name: '广州',
    code: 'GZMTR',
    lang: 'cn',
    fullname: '广州地铁',
  }
}


const state = {
  railSystems: new Map(Object.entries(railSystems)),
  stations: {},
  lines: {}
};

const mutations = {
  SET_RAIL_SYSTEM(state, language) {
    state.currentLanguage = language;
  },
}

const actions = {
  getRailSystem({state, commit}, code) {
    return state.railSystems.get(code)
  },
  async getRailSystems({state, commit}) {
    return Promise.resolve(state.railSystems.values())
  }
}

const getters = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};

