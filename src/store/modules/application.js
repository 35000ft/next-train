import {reactive} from "vue";
import {useRouter} from "vue-router";


const state = {
    shownStationId: reactive(null),
    overlayStack: reactive([])
};

const mutations = {
    SET_SHOWN_STATION_ID(state, {stationId}) {
        state.shownStationId = stationId
    },
    PUSH_OVERLAY(state, {component}) {
        state.overlayStack.push(component)
    },
    POP_OVERLAY(state, {componentName}) {
        if (state.overlayStack.length > 0) {
            if (componentName) {
                if (state.overlayStack.slice(-1)[0].componentName !== componentName) {
                    return
                }
            }
            state.overlayStack.splice(state.overlayStack.length - 1, 1)
        }
    }
};

const actions = {
    showStationRealtimeModal({commit, state}, {stationId}) {
        commit('SET_SHOWN_STATION_ID', {stationId})
    },
    closeStationRealtimeModal({commit, state}) {
        mutations.SET_SHOWN_STATION_ID(state, {stationId: null})
    },
    pushOverlay({commit, state}, {component}) {
        if (component) {
            commit('PUSH_OVERLAY', {component})
        }
    },
    popOverlay({commit, state}, payload) {
        const componentName = payload && payload.componentName || null
        mutations.POP_OVERLAY(state, {componentName: componentName})
    }

};

const getters = {
    shownStationId: state => state.shownStationId,
    topOverlayComponent: state => state.overlayStack.slice(-1)[0]
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};
