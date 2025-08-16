import {reactive, toRaw} from "vue";
import {isEqual} from "lodash";
import {getNowByTimezone} from "src/utils/time-utils";
import {generateUUID} from "src/utils/crypto_utils";

const LOCAL_STORAGE_KEYS = {
    METRO_GO_CONFIG: 'MetroGoConfig',
}

const state = {
    shownStationId: null,
    overlayStack: reactive([]),
    // 相对当前时间的偏移秒数
    timeOffsetSeconds: 0,
    shownTrainInfo: null,
    metroGoViewConfig: null,
    shownLineRealtime: null,
    solutionOverviewParams: null,
    bottomModalStack: reactive([]),
    usedSolution: null,
    shownSolution: null,
    showLeftDrawer: false,
    appVersion: null,
};
const mutations = {
    SET_SHOWN_TRAININFO(state, {trainInfo}) {
        state.shownTrainInfo = trainInfo
    },
    SET_APP_VERSION(state, {appVersion}) {
        state.appVersion = appVersion
    },
    SET_SHOWN_SOLUTION(state, {solution}) {
        state.shownSolution = solution
    },
    SET_SHOWN_LINE_REALTIME(state, {lineId}) {
        state.shownLineRealtime = lineId
    },
    SET_SHOWN_STATION_ID(state, {stationId}) {
        state.shownStationId = stationId
    },
    PUSH_OVERLAY(state, {component}) {
        if (!component) return
        component.id = component.componentName + '-' + generateUUID()
        if (!component?.uri) {
            component.uri = window.location.hash.substring(1)
        }
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
    PUSH_BOTTOM(state, {id}) {
        state.bottomModalStack.push(id)
    },
    POP_BOTTOM(state, {id}) {
        if (state.bottomModalStack.length > 0) {
            const top = state.bottomModalStack.slice(-1)[0]
            if (top === id) {
                state.bottomModalStack.splice(state.bottomModalStack.length - 1, 1)
            }
        }
    },
    SET_METRO_GO_CONFIG(state, config) {
        state.metroGoViewConfig = config
        const value = JSON.stringify(config)
        if (value) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.METRO_GO_CONFIG, value)
        }
    },
    SHOW_SOLUTION_OVERVIEW(state, params) {
        state.solutionOverviewParams = params
    },
    SET_USING_SOLUTION(state, solution) {
        state.usedSolution = solution
    },
    SET_SHOW_LEFT_DRAWER(state, isShow) {
        if (typeof isShow === "boolean") {
            state.showLeftDrawer = isShow
        } else {
            state.showLeftDrawer = !state.showLeftDrawer
        }
    }
};

const actions = {
    showStationRealtimeModal({commit, state}, {stationId}) {
        commit('SET_SHOWN_STATION_ID', {stationId})
    },
    closeStationRealtimeModal({commit, state}) {
        commit('SET_SHOWN_STATION_ID', {stationId: null})
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
            commit('SET_METRO_GO_CONFIG', config)
            return config
        } else {
            const currentStation = this.getters['preference/currentStation']
            let initConfig
            if (!currentStation) {
                initConfig = {
                    from: null,
                    to: null,
                    depTime: null,
                }
            } else {
                initConfig = {
                    from: currentStation.id,
                    to: null,
                    depTime: null,
                }
            }
            commit('SET_METRO_GO_CONFIG', initConfig)
            return initConfig
        }
    }
};

const getters = {
    shownStationId: state => state.shownStationId,
    topOverlayComponent: state => state.overlayStack.slice(-1)[0],
    topBottomComponent: state => state.bottomModalStack.slice(-1)[0],
    overlayComponentStack: state => state.overlayStack,
    getNowTime: state => (timezone) => getNowByTimezone(timezone).add(state.timeOffsetSeconds, "seconds"),
    shownTrainInfo: state => {
        return {...state.shownTrainInfo}
    },
    shownLineRealtime: state => state.shownLineRealtime,
    solutionOverviewParams: state => state.solutionOverviewParams,
    usedSolution: state => state.usedSolution,
    shownSolution: state => state.shownSolution,
    showLeftDrawer: state => state.showLeftDrawer,
    appVersion: state => state.appVersion,
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};
