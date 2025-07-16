import {reactive, toRaw} from "vue";
import LRUCache from "src/utils/LRU";
import {
    fetchDrawLineTemplate,
    fetchGraph,
    fetchLine,
    fetchLines, fetchRailsystem,
    fetchShowLineCanvasConfig,
    fetchStation,
    fetchStations,
    fetchTransfers
} from "src/apis/railsystem";

const LOCAL_STORAGE_KEYS = {
    CURRENT_RAILSYSTEM: 'RAILSYSTEM_CODE',
}
const railSystems = {
    'NJMTR': {
        name: '南京',
        city: '南京',
        code: 'NJMTR',
        lang: 'zh-hans',
        fullname: '南京地铁',
        timezone: '+08:00',
        ownerId: 1,
        defaultStationId: "13"
    },
    'HKMTR': {
        name: '香港',
        city: '香港',
        code: 'HKMTR',
        lang: 'zh-hant',
        fullname: '香港地铁',
        timezone: '+08:00',
        ownerId: 0,
        defaultStationId: "2676"
    },
    'NUIST-BUS': {
        name: '信大小公交',
        city: '南京',
        code: 'NUIST-BUS',
        lang: 'zh-hans',
        fullname: '南信大校园小公交',
        timezone: '+08:00',
        ownerId: 0,
        defaultStationId: "2773"
    },
}
const defaultSystemCode = (function () {
    const storageCode = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_RAILSYSTEM)
    if (storageCode && railSystems[storageCode]) {
        return storageCode
    }
    const langMap = {
        'zh-HK': 'HKMTR'
    }
    if (langMap[navigator.language]) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_RAILSYSTEM, langMap[navigator.language])
        return langMap[navigator.language]
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_RAILSYSTEM, 'NJMTR')
    return 'NJMTR'
})()

const publicPath = process.env.PUBLIC_URL || '/';
const onChangeRailsystem = async (railsystem) => {
    if (railsystem?.ownerId === 0) {
        const scriptNodeName = 'third_realtime_script'
        const existedScript = document.querySelector(`script[data-node-name="${scriptNodeName}"]`)
        if (existedScript) {
            document.head.removeChild(existedScript)
        }
        const scriptUrl = `${publicPath}third_realtime_scripts/${railsystem.code}.js`
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
onChangeRailsystem(railSystems[defaultSystemCode]).then(_ => _)

const state = {
    currentRailSystem: railSystems[defaultSystemCode],
    railSystems: reactive(new Map(Object.entries(railSystems))),
    stations: reactive(new LRUCache(100)),
    lines: reactive(new LRUCache(50)),
    transferInfoMap: reactive(new LRUCache(5)),
    showLineDrawConfigMap: reactive(new LRUCache(5)),
}

const mutations = {
    SET_RAIL_SYSTEM_LINES(state, {railsystemCode, lines}) {
        const railsystem = state.railSystems.get(railsystemCode)
        if (!railsystemCode) {
            console.warn(`Set railsystem lines err, railsystem:${railsystemCode} dones exist`)
            return
        }
        if (lines && lines instanceof Array) {
            railsystem['lines'] = lines
            state.railSystems.set(railsystemCode, railsystem)
            state.lines.batchSet(lines, (v) => v['id'])
            console.log('Set railsystem lines OK, railsystem:', state.railSystems.get(railsystemCode))
        }
    },
    SET_LINE(state, {line}) {
        if (line && line.id) {
            state.lines.set(line.id, line)
        }
    },
    SET_RAILSYSTEM(state, {railsystem}) {
        if (railsystem && railsystem.code) {
            state.railSystems.set(railsystem.id, railsystem)
        }
    },
    SET_CURRENT_RAILSYSTEM(state, {code}) {
        if (railSystems[code]) {
            state.currentRailSystem = railSystems[code]
            onChangeRailsystem(railSystems[code]).then(_ => _)
            localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_RAILSYSTEM, code)
        }
    },
    SET_LINE_STATIONS(state, {lineId, stations}) {
        if (state.lines.has(lineId)) {
            state.lines.get(lineId).stations = stations
            state.stations.batchSet(stations, (v) => v.id)
        }
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
    async getStation({state, commit}, {stationId}) {
        if (!stationId) {
            return Promise.reject(`stationId is undefined:${stationId}`)
        }
        const isFavourite = await this.dispatch('preference/isFavouriteStation', {stationId})
        let station = state.stations.get(stationId)
        if (!station) {
            return new Promise((resolve, reject) => {
                fetchStation(stationId).then(station => {
                    commit('SET_STATION', {station})
                    station.isFavourite = isFavourite
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
    async getAllStations({state, commit}) {
        const currentRailSystem = state.currentRailSystem
        if (currentRailSystem.stations) {
            return currentRailSystem.stations
        } else {
            return fetchStations(currentRailSystem.code).then(stations => {
                currentRailSystem.stations = stations
                commit('SET_RAILSYSTEM', {railsystem: currentRailSystem})
                return stations
            })
        }
    },
    async getLine({state, commit}, {lineId}) {
        if (state.lines.has(lineId)) {
            const _line = state.lines.get(lineId)
            if (_line.stations instanceof Array) {
                return _line
            } else {
                _line.stations = await this.getStationsByLine({state, commit}, {lineId})
                return _line
            }
        } else {
            return new Promise((resolve, reject) => {
                fetchLine(lineId).then(line => {
                    commit('SET_LINE', {line})
                    resolve(line)
                }).catch(err => {
                    reject(err)
                })
            })

        }
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
            return toRaw(state.lines.get(lineId).stations)
        }
        //TODO 从接口获取车站
        const _stations = []
        commit('SET_LINE_STATIONS', {lineId, stations: _stations})
        return _stations
    },
    async getRailSystems({state, commit, getters}) {
        return Array.from(toRaw(state.railSystems).values())
    },
    /**
     * 获取线网的所有线路信息
     * @param {String} railsystemCode
     * @returns {Promise<Array[Object]>}
     * @param payload
     */
    async getRailSystemLines({state, commit, getters}, payload) {
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
                fetchLines(railsystem.code).then(lines => {
                    commit('SET_RAIL_SYSTEM_LINES', {railsystemCode: railsystem.code, lines})
                    lines.forEach(it => {
                        commit('SET_LINE', {line: it})
                    })
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
        const stations = await this.dispatch("railsystem/getAllStations")
        const filteredStations = stations.filter(it => it.name === stationName)
        if (filteredStations.length > 0) {
            return filteredStations[0]
        }
        return Promise.reject(`No station named ${stationName}`)
    }
}

const getters = {
    currentRailSystem: state => state.currentRailSystem,
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

