import {constants} from "./constants.js";
import {fetchStationTrainInfo} from './api.js'
import {formatFromNow} from './time-formatter.js'
import {toMinutesOfDay} from './mytime.js'
import {getStationById, getStationByKeyword} from "./station-data.js";
import {getLineStation, LINES} from "./line-data.js";

const app = new Vue({
    el: '#app',
    data: {
        inputString: "",
        station: {
            id: null,
            name: constants.DEFAULT_STATION,
            lines: []
        },
        selectedLine: {},
        trainInfoList: [],
        trainInfoMap: new Map(),
        isStarStation: false,
        info: "",
        updateTime: null,
        updateTimeString: "----",
        searchHint: []
    },
    methods: {
        addStarStation(stationId, start, end) {
            if (start === '' || end === '') {
                alert('时间不能为空')
                return
            }
            if (end === start) {
                alert('开始时间不能等于结束时间')
                return
            }
            start = toMinutesOfDay(start)
            end = toMinutesOfDay(end)
            const obj = JSON.parse(localStorage.getItem("DefaultStationList"))
            let starStationMap = obj == null ? new Map() : new Map(Object.entries(obj))

            const isCrossDay = end < start
            const current = Array.from(starStationMap).filter(e => {
                if (e.end < e.start) {
                    if (isCrossDay) return true
                    else return end >= e.start || start <= e.end
                } else {
                    if (isCrossDay) return end >= e.start || start <= e.end
                    else return start <= e.start && end >= e.end //包含
                        || end >= e.start
                        || start <= e.end
                }
            })
            if (current.length > 0) {
                alert(`该时间段已存在收藏车站，不能收藏本车站`)
                return
            }
            starStationMap.set(stationId.toString(), {
                stationId: stationId,
                start: start,
                end: end
            })
            localStorage.setItem("DefaultStationList", JSON.stringify(Object.fromEntries(starStationMap.entries())))
            this.$refs['closeFavourStationBtn'].click()
            this.isStarStation = this.calcIsStarStation(this.station.id)
        },
        addHistoryStation(station) {
            let historyStationList = JSON.parse(localStorage.getItem("HistoryStationList"))
            if (historyStationList == null) historyStationList = new Set()
            if (historyStationList.length >= 10) {
                historyStationList = historyStationList.slice(1, 10)
            }
            historyStationList = new Set(historyStationList)
            if (historyStationList.has(station)) {
                historyStationList.delete(station)
            }
            historyStationList.add(station)
            localStorage.setItem("HistoryStationList", JSON.stringify(Array.from(historyStationList)))
        },
        calcCurrentDefaultStation(urlStationName) {
            if (urlStationName === undefined) urlStationName = constants.DEFAULT_STATION

            const obj = JSON.parse(localStorage.getItem("DefaultStationList"));
            if (obj == null) {
                return this.parseStation(urlStationName)
            }
            let array = Array.from(Object.values(obj))
            const now = moment()
            let minutes = now.hour() * 60 + now.minute()
            const defaultStation = array.filter(e => {
                if (e.end < e.start) {
                    return minutes >= e.start || minutes <= e.end
                } else {
                    return minutes >= e.start && minutes <= e.end
                }
            })[0]

            if (defaultStation === undefined) {
                return this.parseStation(urlStationName)
            }
            return this.parseStation(defaultStation.stationId)
        },
        calcIsStarStation(stationId) {
            const obj = JSON.parse(localStorage.getItem("DefaultStationList"))
            if (obj == null) return false
            return !(obj[stationId] === undefined)
        },
        calcTrainInfoAttr(trainInfoList) {
            if (trainInfoList.length === 0) return []
            trainInfoList.forEach(e => {
                const arrTime = moment(e.arrTime)
                const depTime = moment(e.depTime)
                const now = moment()
                e['onService'] = true

                //格式化"状态"
                let secArr = arrTime.diff(now, 's')
                let secDep = depTime.diff(now, 's')
                if (secArr > 15) {
                    e['status'] = formatFromNow(arrTime, 60, 'minutes', 'HH:ss')
                } else if (secArr > 0) {
                    e['status'] = constants.TRAIN_STATUS_ARRIVE_SOON
                } else if (secDep >= 0) {
                    e['status'] = constants.TRAIN_STATUS_ARRIVED
                } else {
                    e['status'] = constants.TRAIN_STATUS_LEAVING
                    e['onService'] = false
                }
                //格式化"发车时间"
                e['depShowTime'] = depTime.format('HH:mm')
            })
            return trainInfoList
        },
        calcUpdateTimeString() {
            if (this.updateTime == null) {
                return constants.UPDATE_ERROR_HINT
            }
            this.updateTimeString = formatFromNow(this.updateTime, 60, 'minutes', 'HH:mm')
        },
        closeSearchHint() {
            this.searchHint = []
        },
        changeStation(station, line) {
            this.searchHint = []
            if (station == null || station === this.station) return
            this.selectedLine = null
            this.station = station

            if (line === undefined) {
                this.selectedLine = this.station.lines[0]
            } else {
                this.selectedLine = line
            }
        },
        delStarStation(stationId) {
            const obj = JSON.parse(localStorage.getItem("DefaultStationList"))
            if (obj == null) return
            let starStationMap = new Map(Object.entries(obj))
            starStationMap.delete(stationId.toString())
            localStorage.setItem("DefaultStationList", JSON.stringify(Object.fromEntries(starStationMap.entries())))
            this.isStarStation = false
        },
        handleSearch() {
            let station = this.searchHint[0]
            if (station === undefined) return
            this.changeStation(station)
        },
        handleSearchBlur() {
            setTimeout(() => this.closeSearchHint(), 100)
        },
        init() {
            this.initDefaultStation()
            this.selectedLine = this.station.lines[0]
        },
        initDefaultStation() {
            const url = decodeURI(location.href)
            const stationName = url.split("#")[1]
            this.station = this.calcCurrentDefaultStation(stationName)
        },
        initTrainInfo() {
            this.trainInfoMap.clear()
            this.trainInfoList = []
        },
        async fetchStationTrainInfo(stationId, lineId) {
            this.info = constants.UPDATING_TRAIN_INFO_HINT
            return fetchStationTrainInfo(stationId, lineId).then(e => {
                this.info = ""
                if (e == null) {
                    this.updateTime = null
                    return []
                }
                this.updateTime = moment()
                return e
            })
        },
        getHistoryStation() {
            let historyStationList = JSON.parse(localStorage.getItem("HistoryStationList"))
            if (historyStationList == null) return []
            return historyStationList.reverse().map(e => this.parseStation(e))
        },
        getLineData(lineCode) {
            return LINES[lineCode]
        },
        async getStationTrainInfo(stationId, lineId) {
            if (this.trainInfoMap.has(lineId)) {
                let result = this.calcTrainInfoAttr(this.trainInfoMap.get(lineId))
                if (result == null) return []
                result = result.filter(e => e.onService === true)
                if (result.length > constants.MIN_TRAIN_INFO) return result
            }
            console.log(`${moment()}: fetching train info`)
            let data = await this.fetchStationTrainInfo(stationId, lineId)
            this.trainInfoMap.set(lineId, data)
            return data
        },
        parseStation(stationName) {
            if (stationName === undefined) return null
            return getStationByKeyword(stationName)[0]
        },
        showSearchHint(keyword) {
            if (keyword === "") {
                this.searchHint = this.getHistoryStation()
                return
            }
            const searchByLine = keyword.match(new RegExp('S[0-9]|[0-9]+(?=号线|hx)' +
                '|(?<=line\s*)S[0-9]|[0-9]+', 'i'))
            if (searchByLine != null) {
                const lineCode = searchByLine[0].toUpperCase()
                this.searchHint = getLineStation(lineCode).map(item => getStationById(item))
                return
            }
            this.searchHint = getStationByKeyword(keyword)
                .sort((a, b) => a.name.localeCompare(b.name, "zh"))
        },
        updateTrainInfo() {
            console.log(`${moment()}: update train info`)
            this.calcUpdateTimeString()
            if (this.station === null || this.selectedLine == null) return
            this.getStationTrainInfo(this.station.id, this.selectedLine.id).then(e => this.trainInfoList = e)
        }
    },
    created() {
        this.init()
        setInterval(() => this.trainInfoList = this.calcTrainInfoAttr(this.trainInfoList), 5000)
        setInterval(this.updateTrainInfo, 30000)
    },
    watch: {
        inputString(val) {
            this.showSearchHint(val)
        },
        station(val) {
            this.initTrainInfo()
            this.addHistoryStation(val.name)
            let strings = location.href.split('#');
            strings[1] = val.name
            location.href = encodeURI(`${strings[0]}#${strings[1]}`)
            this.isStarStation = this.calcIsStarStation(this.station.id)
        },
        selectedLine(val) {
            if (val == null) return
            this.trainInfoList = []
            this.getStationTrainInfo(this.station.id, val.id).then(e => {
                this.trainInfoList = this.calcTrainInfoAttr(e)
            })
        },
        updateTime(val) {
            this.calcUpdateTimeString()
        }
    }
})