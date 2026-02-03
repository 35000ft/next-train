import {reactive, toRaw} from "vue";
import LRUCache from "src/utils/LRU";
import {
    fetchDrawLineTemplate,
    fetchGraph,
    fetchLine,
    fetchLines,
    fetchRailsystem,
    fetchShowLineCanvasConfig,
    fetchStation,
    fetchRailsystemStations,
    fetchTransfers,
    listRailsystem
} from "src/apis/railsystem";
import {toI18NameObject} from "src/utils/common_utils";

const LOCAL_STORAGE_KEYS = {
    CURRENT_RAILSYSTEM: 'CURRENT_RAILSYSTEM',
    CURRENT_STATION: 'currentStation',
}
const defaultRailSystems = {
    abbrName: '南京',
    code: 'NJMTR',
    lang: 'zh-hans',
    fullname: '南京地铁',
    timezone: '+08:00',
    ownerId: 1,
    defaultStationId: "13"
}
const currentRailsystem = (function () {
    let currentRailsystem = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_RAILSYSTEM)
    if (!currentRailsystem) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_RAILSYSTEM, JSON.stringify(defaultRailSystems))
        return defaultRailSystems
    }
    currentRailsystem = JSON.parse(currentRailsystem)
    if (typeof currentRailsystem?.extra === "string") {
        localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_RAILSYSTEM, JSON.stringify(defaultRailSystems))
        localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_STATION)
        return defaultRailSystems
    }
    return currentRailsystem
})()

const publicPath = process.env.PUBLIC_URL || '/';
const onChangeRailsystem = async (railsystem) => {
    const realtimeScriptUrl = railsystem?.extra?.realtimeScriptUrl
    if (railsystem?.extra?.isThirdParty && realtimeScriptUrl) {
        const scriptNodeName = 'third_realtime_script'
        const existedScript = document.querySelector(`script[data-node-name="${scriptNodeName}"]`)
        if (existedScript) {
            document.head.removeChild(existedScript)
        }
        const scriptUrl = `${publicPath}${realtimeScriptUrl}`
        const script = document.createElement('script');
        script.setAttribute('data-node-name', scriptNodeName)
        script.src = scriptUrl;
        script.onerror = () => {
            reject(new Error(`Failed to load script: ${scriptUrl}`));
            document.head.removeChild(script);
        };
        document.head.appendChild(script);
    }
}
onChangeRailsystem(currentRailsystem).then(_ => _)
const state = {
    currentRailSystem: currentRailsystem,
    railSystems: reactive(new Map([[currentRailsystem.code, currentRailsystem]])),
    stations: reactive(new LRUCache(100)),
    lines: reactive(new LRUCache(50)),
    transferInfoMap: reactive(new LRUCache(5)),
    showLineDrawConfigMap: reactive(new LRUCache(5)),
}

const mutations = {
    SET_RAIL_SYSTEM_LINES(state, {railsystemCode, lines}) {
        const railsystem = state.railSystems.get(railsystemCode)
        if (!railsystem || !railsystemCode) {
            console.warn(`Set railsystem lines err, railsystem:${railsystemCode} does not exist`)
            return
        }
        if (lines && lines instanceof Array) {
            railsystem['lines'] = lines
            state.railSystems.set(railsystemCode, railsystem)
        }
    },
    SET_RAIL_SYSTEM_STATIONS(state, {railsystemCode, stations}) {
        const railsystem = state.railSystems.get(railsystemCode)
        if (!railsystem || !railsystemCode) {
            console.warn(`Set railsystem stations err, railsystem:${railsystemCode} does not exist`)
            return
        }
        if (stations && stations instanceof Array) {
            railsystem['stations'] = stations
            state.railSystems.set(railsystemCode, railsystem)
        }
    },
    SET_LINE(state, {line}) {
        if (!!(line && line.id)) {
            state.lines.set(line.id, line)
        }
    },
    SET_RAILSYSTEM(state, {railsystem}) {
        if (railsystem && railsystem.code) {
            state.railSystems.set(railsystem.id, railsystem)
        }
    },
    SET_CURRENT_RAILSYSTEM(state, {railsystem}) {
        state.currentRailSystem = null
        state.currentRailSystem = railsystem
        onChangeRailsystem(railsystem).then(_ => _)
        localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_RAILSYSTEM, JSON.stringify(railsystem))
    },
    SET_STATION(state, {station}) {
        if (station && station.id) {
            state.stations.set(station.id, station)
        }
    },
    SET_TRANSFER_INFO(state, {railsystemCode, transferInfo}) {
        state.transferInfoMap.set(railsystemCode, transferInfo)
    },
    SET_SHOW_LINE_CANVAS_CONFIG(state, {railsystemCode, config}) {
        if (railsystemCode && config) {
            state.showLineDrawConfigMap.set(railsystemCode, config)
        }
    }
}

const actions = {
    async getRailSystem({state, commit}, {code}) {
        const r = state.railSystems.get(code)
        if (!r) {
            return fetchRailsystem(code).then(railsystem => {
                commit('SET_RAILSYSTEM', {railsystem})
                return railsystem
            })
        } else {
            return r
        }
    },
    async getRailSystemGraph({state, commit}, {code}) {
        return fetchGraph(code)
    },
    async getTransferInfo({state, commit}, {fromId, fromPlatform, toId, toPlatform, fromMainId}) {
        const DEFAULT_TRANSFER_INFO = {
            needTime: 30,
            distance: 5,
            category: 'SAME_PLTF'
        }
        if (fromId === toId && fromPlatform === toPlatform) {
            return DEFAULT_TRANSFER_INFO
        }
        const fromStation = await this.dispatch('railsystem/getStation', {stationId: fromMainId})
        const transferInfo = await this.dispatch('railsystem/getRailSystemTransferInfo', {railsystemCode: fromStation.railsystemCode})
        const stationTransferInfo = transferInfo.filter(it => it.mainStationId.toString() === fromMainId)
            .filter(it => it.fromId.startsWith(fromId))
        if (!toPlatform) {
            const temp = stationTransferInfo.filter(it => it.toId.startsWith(toId))
            if (temp.length === 0) {
                return DEFAULT_TRANSFER_INFO
            } else {
                return temp.sort((o1, o2) => o1.needTime - o2.needTime)[0]
            }
        }
        const target = stationTransferInfo.find(it => it.fromId === fromId && it.toId === toId)
            || stationTransferInfo.find(it => it.fromId === fromId && it.toId === `${toId}-${toPlatform}`)
            || stationTransferInfo.find(it => it.fromId === `${fromId}-${fromPlatform}` && it.toId === toId)
            || stationTransferInfo.find(it => it.fromId === `${fromId}-${fromPlatform}` && it.toId === toId)
            || stationTransferInfo.find(it => it.fromId === `${fromId}-${fromPlatform}` && it.toId === `${toId}-${toPlatform}`)

        if (!target) {
            return DEFAULT_TRANSFER_INFO
        }
        return target
    },
    async getRailSystemTransferInfo({state, commit}, {railsystemCode}) {
        const transferInfo = state.transferInfoMap.get(railsystemCode)
        if (transferInfo) {
            return transferInfo
        }
        return fetchTransfers(railsystemCode).then(transferInfo => {
            commit('SET_TRANSFER_INFO', {railsystemCode, transferInfo})
            return transferInfo
        }).catch(err => {
            console.error(`Fetch transfer info error. railsystemCode:${railsystemCode} err:`, err)
        })
    },
    async getStation({state, commit, rootGetters}, {stationId, latest = false}) {
        if (!stationId) {
            return Promise.reject(`stationId is undefined:${stationId}`)
        }
        const isFavourite = await this.dispatch('preference/isFavouriteStation', {stationId})
        let station = state.stations.get(stationId)
        if (!station || latest) {
            return new Promise((resolve, reject) => {
                fetchStation(stationId).then(station => {
                    station.isFavourite = isFavourite
                    const currentLanguage = rootGetters['language/currentLanguage']
                    station = toI18NameObject(station, station?.language, currentLanguage)
                    if (station?.lines) {
                        station.lines = station.lines.map(it => toI18NameObject(it, it?.language, currentLanguage))
                    }
                    commit('SET_STATION', {station})
                    resolve(station)
                }).catch(err => {
                    reject(err)
                })
            })
        }
        if (!station) {
            return Promise.reject('Get station err stationId:' + stationId)
        }
        station.isFavourite = isFavourite
        return station
    },
    async getStationByIds({dispatch, state, commit}, {stationIds}) {
        const promises = []
        for (const stationId of stationIds) {
            const promise = dispatch('getStation', {stationId})
            promises.push(promise)
        }
        return await Promise.all(promises)
    },
    async getRailsystemStations({state, commit, rootGetters}, {railsystemCode, latest = false}) {
        if (!railsystemCode) {
            railsystemCode = state.currentRailSystem.code
        }
        const r = state.railSystems.get(railsystemCode);
        if (r && r?.stations && !latest) {
            return Promise.resolve(r.stations)
        }
        let d = await fetchRailsystemStations(railsystemCode, latest)
        const currentLanguage = rootGetters['language/currentLanguage']
        d = d.map(it => toI18NameObject(it, it?.language, currentLanguage))
        commit('SET_RAIL_SYSTEM_STATIONS', {railsystemCode, stations: d})
        return d
    },
    async getLine({state, commit, rootGetters}, {lineId, latest = false}) {
        if (state.lines.has(lineId)) {
            const _line = state.lines.get(lineId)
            if (_line && _line.stations instanceof Array) {
                return _line
            }
        }
        return new Promise((resolve, reject) => {
            fetchLine(lineId, latest).then(line => {
                const currentLanguage = rootGetters['language/currentLanguage']
                line.stations = line.stations.map(it => toI18NameObject(it, it?.language, currentLanguage))
                line = toI18NameObject(line, line?.language, currentLanguage)
                commit('SET_LINE', {line})
                resolve(line)
            }).catch(err => {
                reject(err)
            })
        })

    },
    async getRailsystemByLineId({state, commit}, {lineId}) {
        const line = await this.dispatch("railsystem/getLine", {lineId})
        if (!line) {
            return Promise.reject('Line not found, lineId:' + lineId)
        }
        return this.dispatch("railsystem/getRailSystem", {code: line.railsystemCode})
    },
    async getStationsByLine({state, commit}, {lineId}) {
        if (state.lines.has(lineId) && state.lines.get(lineId).stations) {
            return state.lines.get(lineId).stations
        }
        const line = await this.dispatch('railsystem/getLine', {lineId})
        return line.stations
    },
    async getRailSystems({state, commit}) {
        if (state.railSystems && state.railSystems.length > 1) {
            return Array.from(toRaw(state.railSystems).values())
        }
        try {
            const railSystems = await listRailsystem()
            railSystems.forEach(it => commit('SET_RAILSYSTEM', {railsystem: it}))
            return railSystems
        } catch (e) {
            console.warn('Fail to get railsystem list', e)
            return Promise.reject('获取线网列表失败')
        }
    },
    /**
     * 获取线网的所有线路信息
     * @param {String} railsystemCode
     * @returns {Promise<Array[Object]>}
     * @param payload
     */
    async getRailsystemLines({state, commit, getters, rootGetters}, payload) {
        let railsystem
        let railsystemCode = payload && payload.railsystemCode
        if (!railsystemCode || railsystemCode === state.currentRailSystem.code) {
            railsystem = state.currentRailSystem
        } else {
            railsystem = await this.dispatch('railsystem/getRailSystem', {code: railsystemCode})
        }
        if (railsystem.lines) {
            return Promise.resolve(railsystem.lines)
        } else {
            return new Promise((resolve, reject) => {
                const currentLanguage = rootGetters['language/currentLanguage']
                fetchLines(railsystem.code, payload?.latest).then(lines => {
                    lines = lines.map(it => toI18NameObject(it, it?.language, currentLanguage))
                    commit('SET_RAIL_SYSTEM_LINES', {railsystemCode: railsystem.code, lines})
                    resolve(lines)
                }).catch(err => {
                    reject(err)
                })
            })
        }
    },

    async getShowLineCanvasConfig({state, commit, getters}, {railsystemCode}) {
        const temp = state.showLineDrawConfigMap.get(railsystemCode)
        if (temp) {
            return temp
        }
        return fetchShowLineCanvasConfig(railsystemCode).then(config => {
            commit('SET_SHOW_LINE_CANVAS_CONFIG', {railsystemCode, config})
            return config
        })
    },
    async getLineCanvasConfig({state, commit, getters}, {lineId}) {
        return fetchDrawLineTemplate(lineId).then(template => {
            return template
        })
    },
    async queryStationByName({state, commit}, {stationName}) {
        const stations = await this.dispatch("railsystem/getRailsystemStations")
        const filteredStations = stations.filter(it => it.name === stationName)
        if (filteredStations.length > 0) {
            return filteredStations[0]
        }
        return Promise.reject(`No station named ${stationName}`)
    },
    async matchStationByNames({state, commit}, {names, railsystemCode}) {
        const stations = await this.dispatch("railsystem/getRailsystemStations", {railsystemCode, latest: true})
        const nameMap = new Map()
        for (const name of names) {
            const filtered = stations.filter(it => it.name === name || it.enName === name || it.code === name)
            if (filtered?.length > 0) {
                nameMap.set(name, filtered[0])
            } else {
                nameMap.set(name, {name: name, railsystemCode: railsystemCode, isNew: true})
            }
        }
        return nameMap
    },
    async changeRailsystem({state, commit}, {railsystemCode}) {
        const railsystem = await this.dispatch('railsystem/getRailSystem', {code: railsystemCode})
        if (railsystem) {
            commit('SET_CURRENT_RAILSYSTEM', {railsystem})
            return Promise.resolve(railsystem)
        }
        return Promise.reject()
    }
}

const getters = {
    currentRailSystem: state => ({...state.currentRailSystem}),
    lines: state => state.lines,
    railsystemGetter: state => (code) => state.railSystems.get(code),
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};

