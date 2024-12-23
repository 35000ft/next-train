import {reactive, toRaw} from "vue";
import {isEqual} from "lodash";


const state = {
    shownStationId: reactive(null),
    overlayStack: reactive([]),
    isOverlayRendered: false,
};

const mutations = {
    SET_SHOWN_STATION_ID(state, {stationId}) {
        state.shownStationId = stationId
    },
    PUSH_OVERLAY(state, {component}) {
        if (state.overlayStack.length > 0) {
            const top = toRaw(state.overlayStack.slice(-1)[0])
            if (top.componentName === component.componentName) {
                if (!isEqual(top.params, component.params)) {
                    state.overlayStack.push(component)
                }
            } else {
                state.overlayStack.push(component)
            }
        } else {
            state.overlayStack.push(component)
        }
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
    },
    SET_OVERLAY_RENDERED(state, {isRendered}) {
        state.isOverlayRendered = isRendered
    },
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
        console.log('popOverlay', payload)
        const componentName = payload && payload.componentName || null
        commit('POP_OVERLAY', {componentName: componentName})
    },
    setIsOverlayRendered({commit, state}) {
        commit('SET_OVERLAY_RENDERED', {isRendered: true})
    }
};

const getters = {
    shownStationId: state => state.shownStationId,
    topOverlayComponent: state => state.overlayStack.slice(-1)[0],
    isOverlayRendered: state => state.isOverlayRendered,
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};
