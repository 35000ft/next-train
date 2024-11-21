import {toRaw} from "vue";
import {date2StringWithTimezone, isAfterNow} from "src/utils/time-utils";

const state = {
    currentLanguage: 'en',
    historyStations: JSON.parse(localStorage.getItem('historyStationList')) || [],
    //TODO
    currentStation: JSON.parse(localStorage.getItem('currentStation')) || {},
    focusTrains: JSON.parse(localStorage.getItem('focusTrains')) || []
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
    ADD_HISTORY_STATION(state, station) {
        const key = 'historyStationList'
        let historyStations = JSON.parse(localStorage.getItem(key))
        if (historyStations == null) historyStations = []
        const maxHistoryAmount = 20
        if (historyStations.length >= maxHistoryAmount) {
            historyStations = historyStations.slice(1, maxHistoryAmount)
        }
        const existedIndex = historyStations.findIndex(it => it.id === station.id)
        if (existedIndex !== -1) {
            historyStations.splice(existedIndex, 1)
        }
        historyStations = [station, ...historyStations]
        state.historyStations = historyStations
        localStorage.setItem(key, JSON.stringify(historyStations))
    },
    ADD_FOCUS_TRAIN(state, train) {
        const key = 'focusTrains'
        const focusTrains = JSON.parse(localStorage.getItem(key)) || []
        if (focusTrains.findIndex(it => it.id === train.id) !== -1) {
            return
        }
        focusTrains.push(train)
        state.focusTrains = focusTrains
        localStorage.setItem(key, JSON.stringify(focusTrains))
    },
    SET_FOCUS_TRAINS(state, trains) {
        state.focusTrains = trains
        localStorage.setItem('focusTrains', JSON.stringify(trains))
    }

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
    },
    addHistoryStation({commit, state}, station) {
        if (!station || !station.id) {
            return Promise.reject('station or station.id can not be undefined!')
        }
        mutations.ADD_HISTORY_STATION(state, station)
        return Promise.resolve()
    },
    addFocusTrain({commit, state}, {train, station}) {
        const _t = {
            id: train.id,
            trainNo: train.trainNo,
            category: train.category,
            dep: date2StringWithTimezone(train.dep),
            arr: date2StringWithTimezone(train.arr),
            terminal: train.terminal,
            station: toRaw(station)
        }
        mutations.ADD_FOCUS_TRAIN(state, _t)
    },
}

const getters = {
    currentLanguage: (state) => state.currentLanguage,
    historyStations: (state) => state.historyStations,
    currentStation: (state) => state.currentStation,
    focusTrains: (state) => {
        const trains = state.focusTrains.filter(it => isAfterNow(it.dep))
        mutations.SET_FOCUS_TRAINS(state, trains)
        return trains
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};
