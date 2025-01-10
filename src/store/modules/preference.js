import {reactive, toRaw} from "vue";
import {
    checkIsInNumberLine,
    checkNumberLineConflictEle,
    date2StringWithTimezone, getOffsetMinSinceMonday,
    isAfterNow,
    parseTimeRule2NumberLine
} from "src/utils/time-utils";
import {arr2Map} from "src/utils/array-utils";
import {isNumber} from "src/utils/string-utils";
import {fetchStation} from "src/apis/railsystem";

const LOCAL_STORAGE_KEYS = {
    CURRENT_STATION: 'currentStation',
    CURRENT_RAILSYSTEM: 'currentRailSystem',
    HISTORY_STATION_LIST: 'historyStationList',
    FOCUS_TRAINS: 'focusTrains',
    FAVOURITE_STATIONS: 'favouriteStations',
    FAVOURITE_RULES: 'favouriteRules',
}

//TODO 存在bug 在migrateFavourStationFromV1未完成前用户收藏favIds中的车站会导致重复收藏
function migrateFavourStationFromV1() {
    const json = localStorage.getItem('DefaultStationList')
    if (json) {
        const favIds = Object.keys(JSON.parse(json))
        const favouriteStations = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.FAVOURITE_STATIONS)) || []
        const favMap = arr2Map(favouriteStations, 'id') || new Map()
        const promises = []
        for (const id of favIds) {
            if (favMap.has(id)) continue
            promises.push(fetchStation(id))
        }
        promises.forEach(it => it.then(station => {
            if (station) {
                favouriteStations.push(station)
            }
        }))
        Promise.all(promises).then(_ => {
            console.log('Migrate fav stations done', favouriteStations)
            localStorage.setItem(LOCAL_STORAGE_KEYS.FAVOURITE_STATIONS, JSON.stringify(favouriteStations))
        })
    }
}

migrateFavourStationFromV1()
const LOCAL_STORAGE_CUR_STATION = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_STATION)) || null

const state = {
    historyStations: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.HISTORY_STATION_LIST)) || [],
    currentStation: LOCAL_STORAGE_CUR_STATION,
    focusTrains: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.FOCUS_TRAINS)) || [],
    favouriteStations: reactive(arr2Map((JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.FAVOURITE_STATIONS)) || []), 'id')),
    favouriteRules: reactive(new Map(Object.entries(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.FAVOURITE_RULES)) || {}))),
}

const mutations = {
    SAVE_CUR_FAV_STATION_RULES(state) {
        console.log('save fav cur rules')
        localStorage.setItem(LOCAL_STORAGE_KEYS.FAVOURITE_RULES, JSON.stringify(Object.fromEntries(state.favouriteRules)))
    },
    SET_CURRENT_STATION(state, {station}) {
        if (!station) return
        state.currentStation = station;
        console.log('set cur station ok', station)
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
        const maxHistoryAmount = 10
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
    ADD_FOCUS_TRAIN(state, {train, isDelete = false}) {
        const focusTrains = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.FOCUS_TRAINS)) || []
        const existedIndex = focusTrains.findIndex(it => it.id === train.id && it.station.id === train.station.id);
        if (existedIndex !== -1) {
            if (isDelete) {
                focusTrains.splice(existedIndex, 1)
            } else {
                return
            }
        } else {
            focusTrains.push(train)
        }
        state.focusTrains = focusTrains
        localStorage.setItem(LOCAL_STORAGE_KEYS.FOCUS_TRAINS, JSON.stringify(focusTrains))
    },
    FAVOUR_STATION(state, {station, isFav}) {
        if (!isNumber(station.id)) throw new Error("station id should be number")
        let favouriteStations = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.FAVOURITE_STATIONS)) || []
        const favouriteStationMap = arr2Map(favouriteStations, 'id')
        let isFavourite
        if (typeof isFav === "boolean") {
            isFavourite = isFav
        } else {
            if (favouriteStationMap.has(station.id)) {
                favouriteStationMap.delete(station.id)
                isFavourite = false
            } else {
                isFavourite = true
            }
        }
        if (isFavourite) {
            favouriteStationMap.set(station.id, station)
        }
        favouriteStations = Array.from(favouriteStationMap.values())
        localStorage.setItem(LOCAL_STORAGE_KEYS.FAVOURITE_STATIONS, JSON.stringify(favouriteStations))
        state.favouriteStations = favouriteStationMap
        return isFavourite
    },
    SET_FOCUS_TRAINS(state, trains) {
        state.focusTrains = trains
        localStorage.setItem(LOCAL_STORAGE_KEYS.FOCUS_TRAINS, JSON.stringify(trains))
    },
    ADD_FAVOUR_STATION_RULE(state, {station, fromTime, toTime, period}) {
        const _list = state.favouriteRules.get(station.railsystemCode) || []
        _list.push({
            id: new Date().getTime(),
            stationId: station.id,
            fromTime,
            toTime,
            period,
            use: true
        })
        state.favouriteRules.set(station.railsystemCode, _list)
        this.commit('preference/FAVOUR_STATION', {station, isFav: true})
        const key = LOCAL_STORAGE_KEYS.FAVOURITE_RULES
        localStorage.setItem(key, JSON.stringify(Object.fromEntries(state.favouriteRules)))
    },
    DELETE_FAVOUR_STATION_RULE(state, {rule}) {
        if (rule && rule.id) {
            for (const railsystem of state.favouriteRules.keys()) {
                const rules = state.favouriteRules.get(railsystem)
                if (!(rules instanceof Array)) {
                    continue
                }
                const index = rules.findIndex(it => it.id === rule.id)
                if (index !== 1) {
                    rules.splice(index, 1)
                    state.favouriteRules.set(railsystem, rules)
                    localStorage.setItem(LOCAL_STORAGE_KEYS.FAVOURITE_RULES, JSON.stringify(Object.fromEntries(state.favouriteRules)))
                    break
                }
            }
        }
    }

};

const actions = {
    checkIsFavRulesConflict({state}, {station, fromTime, toTime, period, id}) {
        const newNumberLine = parseTimeRule2NumberLine({fromTime, toTime, period})
        const ruleList = state.favouriteRules.get(station.railsystemCode) || []
        for (let favouriteRule of ruleList) {
            if (!favouriteRule.use) continue
            if (id && favouriteRule.id === id) continue
            const curNumberLine = parseTimeRule2NumberLine(favouriteRule)
            curNumberLine.push(...newNumberLine)
            if (checkNumberLineConflictEle(curNumberLine)) {
                return favouriteRule
            }
        }
        return false
    },
    async addFavourStationRule({state, commit}, {station, fromTime, toTime, period}) {
        const conflictRule = await this.dispatch('checkIsFavRulesConflict', {station, fromTime, toTime, period})
        if (conflictRule) {
            return Promise.reject(conflictRule)
        }
        commit('ADD_FAVOUR_STATION_RULE', {station, fromTime, toTime, period})
        return Promise.resolve()
    },
    setCurrentRailSystem({commit}, railSystem) {
        commit('SET_CURRENT_RAIL_SYSTEM', railSystem)
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
            trainDate: train.trainDate,
            terminal: train.terminal,
            station: toRaw(station),
        }
        commit('ADD_FOCUS_TRAIN', {train: _t})
    },
    cancelFocusTrain({commit, state}, {train}) {
        commit('ADD_FOCUS_TRAIN', {train: train, isDelete: true})
    },
    isFavouriteStation({commit, state}, {stationId}) {
        if (!stationId) return false
        return Boolean(state.favouriteStations.has(stationId))
    },
    async favourStation({commit}, {station}) {
        commit('FAVOUR_STATION', {station});
        return this.dispatch('preference/isFavouriteStation', {stationId: station.id})
    },
    async getAllFavouriteStations({commit, state}) {
        return state.favouriteStations || new Map()
    },
    async getRuleFavourStation({state, rootGetters, dispatch}) {
        const currentSystem = rootGetters['railsystem/currentRailSystem']
        const ruleList = state.favouriteRules.get(currentSystem.code);
        if (!(ruleList instanceof Array) || ruleList.length === 0) {
            return null
        }
        const offsetMins = getOffsetMinSinceMonday(currentSystem.timezone)
        for (let favouriteRule of ruleList) {
            if (!favouriteRule.use) continue
            const curNumberLine = parseTimeRule2NumberLine(favouriteRule)
            if (checkIsInNumberLine(curNumberLine, offsetMins)) {
                if (favouriteRule.stationId) {
                    console.log('Use fav station rule:', favouriteRule)
                    return this.dispatch('railsystem/getStation', {stationId: favouriteRule.stationId})
                }
            }
        }
        return null
    },
}

const getters = {
    favouriteStations: (state) => state.favouriteStations || new Map(),
    historyStations: (state) => state.historyStations,
    currentStation: (state) => state.currentStation,
    focusTrains: (state) => {
        const trains = state.focusTrains.filter(it => isAfterNow(it.dep))
        mutations.SET_FOCUS_TRAINS(state, trains)
        return trains
    },
    curFavouriteRule: state => (railsystem) => state.favouriteRules.get(railsystem) || []
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};
