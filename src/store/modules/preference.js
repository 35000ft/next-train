import {reactive, toRaw} from "vue";
import {date2StringWithTimezone, isAfterNow} from "src/utils/time-utils";
import {arr2Map} from "src/utils/array-utils";
import {isNumber} from "src/utils/string-utils";

const LOCAL_STORAGE_KEYS = {
    CURRENT_STATION: 'currentStation',
    CURRENT_RAILSYSTEM: 'currentRailSystem',
    HISTORY_STATION_LIST: 'historyStationList',
    FOCUS_TRAINS: 'focusTrains',
    FAVOURITE_STATIONS: 'favouriteStations',
}
const state = {
    currentLanguage: 'en',
    historyStations: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.HISTORY_STATION_LIST)) || [],
    //TODO
    currentStation: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_STATION)) || {},
    focusTrains: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.FOCUS_TRAINS)) || [],
    favouriteStations: reactive(arr2Map((JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.FAVOURITE_STATIONS)) || [])))
}


const mutations = {
    SET_LANGUAGE(state, language) {
        state.currentLanguage = language;
    },
    SET_CURRENT_STATION(state, station) {
        if (!station) return
        state.currentStation = station;
        localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_STATION, JSON.stringify(station))
    },
    SET_CURRENT_RAIL_SYSTEM(state, railsystem) {
        if (!railsystem) return
        state.currentRailSystem = railsystem;
        localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_RAILSYSTEM, JSON.stringify(railsystem))
    },
    ADD_HISTORY_STATION(state, {station}) {
        let historyStations = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.HISTORY_STATION_LIST))
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
        localStorage.setItem(LOCAL_STORAGE_KEYS.HISTORY_STATION_LIST, JSON.stringify(historyStations))
    },
    ADD_FOCUS_TRAIN(state, {train}) {
        const focusTrains = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.FOCUS_TRAINS)) || []
        if (focusTrains.findIndex(it => it.id === train.id) !== -1) {
            return
        }
        focusTrains.push(train)
        state.focusTrains = focusTrains
        localStorage.setItem(LOCAL_STORAGE_KEYS.FOCUS_TRAINS, JSON.stringify(focusTrains))
    },
    FAVOUR_STATION(state, {stationId}) {
        if (!isNumber(stationId)) {
            return
        }
        let favouriteStations = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.FAVOURITE_STATIONS)) || []
        const favouriteStationSet = new Set(favouriteStations)
        let isFavourite
        if (favouriteStationSet.has(stationId)) {
            favouriteStationSet.delete(stationId)
            isFavourite = false
        } else {
            favouriteStationSet.add(stationId)
            isFavourite = true
        }
        favouriteStations = Array.from(favouriteStationSet.values())
        localStorage.setItem(LOCAL_STORAGE_KEYS.FAVOURITE_STATIONS, JSON.stringify(favouriteStations))
        state.favouriteStations = arr2Map(favouriteStations)
        return isFavourite
    },
    SET_FOCUS_TRAINS(state, trains) {
        state.focusTrains = trains
        localStorage.setItem(LOCAL_STORAGE_KEYS.FOCUS_TRAINS, JSON.stringify(trains))
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
        commit('ADD_HISTORY_STATION', {station})
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
        commit('ADD_FOCUS_TRAIN', {train: _t})
    },
    isFavouriteStation({commit}, {stationId}) {
        if (!stationId) return false
        return Boolean(state.favouriteStations.has(stationId))
    },
    async favourStation({commit}, stationId) {
        commit('FAVOUR_STATION', {stationId});
        return this.dispatch('preference/isFavouriteStation', {stationId})
    },
    async getAllFavouriteStations({commit, state}) {
        return state.favouriteStations || new Map()
    }
}

const getters = {
    currentLanguage: (state) => state.currentLanguage,
    favouriteStations: (state) => state.favouriteStations || new Map(),
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
