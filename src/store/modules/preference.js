const state = {};

const mutations = {
  SET_LANGUAGE(state, language) {
    state.currentLanguage = language;
  },
};

const actions = {
  setLanguage({commit}, language) {
    commit('SET_LANGUAGE', language);
  },
};

const getters = {
  currentLanguage: (state) => state.currentLanguage,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
