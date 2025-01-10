import {reactive, toRaw} from "vue";
import {isEqual} from "lodash";
import {getNowByTimezone} from "src/utils/time-utils";
import {generateUUID} from "src/utils/crypto_utils";


const state = {
    shownStationId: reactive(null),
    overlayStack: reactive([]),
    // 相对当前时间的偏移秒数
    timeOffsetSeconds: 0,
    shownTrainInfo: reactive(null),
};
const mutations = {
    SET_SHOWN_TRAININFO(state, {trainInfo}) {
        state.shownTrainInfo = trainInfo
    },
    SET_SHOWN_STATION_ID(state, {stationId}) {
        state.shownStationId = stationId
    },
    PUSH_OVERLAY(state, {component}) {
        if (!component) return
        component.id = component.componentName + '-' + generateUUID()
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
    POP_OVERLAY(state, {id}) {
        if (state.overlayStack.length > 0) {
            const top = state.overlayStack.slice(-1)[0]
            if (top.id === id) {
                console.log('pop overlay, component id:', id)
                state.overlayStack.splice(state.overlayStack.length - 1, 1)
            }
        }
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
    popOverlay({commit, state}, {id}) {
        commit('POP_OVERLAY', {id})
    },

};

const getters = {
    shownStationId: state => state.shownStationId,
    topOverlayComponent: state => state.overlayStack.slice(-1)[0],
    overlayComponentStack: state => state.overlayStack,
    getNowTime: state => (timezone) => getNowByTimezone(timezone).add(state.timeOffsetSeconds, "seconds"),
    shownTrainInfo: state => {
        return {...state.shownTrainInfo}
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};
