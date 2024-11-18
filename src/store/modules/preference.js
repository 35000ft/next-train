const state = {
    currentLanguage: 'en'
};

const mutations = {
    SET_LANGUAGE(state, language) {
        state.currentLanguage = language;
    },
    SET_CURRENT_STATION(state, station) {
        if (!station) return
        state.currentStation = station;
        localStorage.setItem('currentStation', JSON.stringify(station))
    },
    SET_CURRENT_RAIL_SYSTEM(state, railsystem) {
        if (!railsystem) return
        state.currentRailSystem = railsystem;
        localStorage.setItem('currentRailSystem', JSON.stringify(railsystem))
    },

};

const actions = {
    setLanguage({commit}, language) {
        commit('SET_LANGUAGE', language);
    },
    setCurrentRailSystem({commit}, railSystem) {
        commit('SET_CURRENT_RAIL_SYSTEM', railSystem)
    },
    setCurrentStation({commit}, station) {
        commit('SET_CURRENT_STATION', station)
    }
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
