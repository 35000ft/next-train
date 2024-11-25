import {reactive} from "vue";

const state = {
    shownStationId: reactive(null),
};

const mutations = {
    SET_SHOWN_STATION_ID(state, stationId) {
        state.shownStationId = stationId
    }
};

const actions = {
    showStationRealtimeModal({commit, state}, {stationId}) {
        mutations.SET_SHOWN_STATION_ID(state, stationId)
    },
    closeStationRealtimeModal({commit, state}) {
        mutations.SET_SHOWN_STATION_ID(state, null)
    }
};

const getters = {
    shownStationId: state => state.shownStationId,
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};
