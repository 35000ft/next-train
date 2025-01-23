import {reactive, toRaw} from "vue";
import {isEqual} from "lodash";
import {getNowByTimezone} from "src/utils/time-utils";
import {generateUUID} from "src/utils/crypto_utils";
import {LocalStorage} from "quasar";

const LOCAL_STORAGE_KEYS = {
    METRO_GO_CONFIG: 'MetroGoConfig',
}
const state = {
    shownStationId: reactive(null),
    overlayStack: reactive([]),
    // 相对当前时间的偏移秒数
    timeOffsetSeconds: 0,
    shownTrainInfo: reactive(null),
    metroGoViewConfig: null
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
                state.overlayStack.splice(state.overlayStack.length - 1, 1)
            }
        }
    },
    SET_METRO_CONFIG(state, config) {
        state.metroGoViewConfig = config
        const value = JSON.stringify(config)
        console.log('vas json', value)
        if (value) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.METRO_GO_CONFIG, value)
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
    popOverlay({commit, state}, {id}) {
        commit('POP_OVERLAY', {id})
    },
    getMetroGoViewConfig({commit, state}) {
        if (state.metroGoViewConfig) {
            return state.metroGoViewConfig
        }
        const item = localStorage.getItem(LOCAL_STORAGE_KEYS.METRO_GO_CONFIG);
        if (item) {
            const config = JSON.parse(item)
            commit('SET_METRO_CONFIG', config)
            return config
        } else {
            const currentStation = this.getters['preference/currentStation']
            if (!currentStation) {
                const initConfig = {
                    from: null,
                    to: null,
                    depTime: null,
                }
                commit('SET_METRO_CONFIG', initConfig)
                return initConfig
            }
        }
    }
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
