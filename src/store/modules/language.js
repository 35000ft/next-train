// store/modules/language.js
import {getUserDefaultLanguage} from "boot/i18n";

const state = {
  currentLanguage: getUserDefaultLanguage() || 'en', // 默认语言，可以根据需求更改
};

const mutations = {
  SET_LANGUAGE(state, language) {
    console.log('language change', language)
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
