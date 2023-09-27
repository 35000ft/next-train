import {constants} from "./constants.js";
import {fetchStationTrainInfo} from './api.js'
import {formatFromNow} from './time-formatter.js'
import {EXTRACT_LINE_REGEX, SEARCH_STATION_BY_LINE_REGEX, SEARCH_STATION_REGEX} from './regex-patterns.js'

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
        trainInfoMap: new Map,
        info: "",
        updateTime: null,
        updateTimeString: "----",
        searchHint: []
    },
    methods: {
        calcTrainInfoAttr(trainInfoList) {
            if (trainInfoList.length === 0) return []
            trainInfoList.forEach(e => {
                const arrTime = moment(`${e.date} ${e.arrTime.time}`).add(e.arrTime.dayOffset, 'd')
                const depTime = moment(`${e.date} ${e.depTime.time}`).add(e.depTime.dayOffset, 'd')
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
        changeLine(line) {
            this.selectedLine = line
        },
        changeStation(station) {
            this.searchHint = []
            if (station == null || station === this.station) return
            this.selectedLine = null
            this.station = station
            this.selectedLine = this.station.lines[0]
        },
        handleSearch() {
            let station = this.searchHint[0]
            if (station === undefined) return
            this.changeStation(station)
        },
        init() {
            const url = decodeURI(location.href)
            const stationName = url.split("#")[1]
            const station = this.parseStation(stationName)
            if (station != null) {
                this.station = station
            } else {
                this.station = this.parseStation(this.station.name)
            }
            this.selectedLine = this.station.lines[0]
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
        getLineData(lineCode) {
            return lineData[lineCode]
        },
        getMatchedStation(keyWord) {
            if (keyWord == null || keyWord === "") return null
            const line = EXTRACT_LINE_REGEX(keyWord)
            let pattern
            if (line != null) {
                pattern = SEARCH_STATION_BY_LINE_REGEX(line)
            } else {
                pattern = SEARCH_STATION_REGEX(keyWord)
            }
            return stationNames.match(pattern)
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
            const stationRawString = this.getMatchedStation(stationName)[0]
            if (stationRawString == null) {
                this.info = "暂无数据"
                this.inputString = ""
                return null
            }
            return this.toStation(stationRawString)
        },
        showSearchHint(keyWord) {
            if (keyWord === "") {
                this.searchHint = []
                return
            }
            let matchedStationList = this.getMatchedStation(this.inputString);
            if (matchedStationList == null) {
                this.searchHint = []
                return
            }
            this.searchHint = matchedStationList.map(e => this.toStation(e))
        },
        toStation(row) {
            let split = row.split(',')
            return {
                id: split[0],
                name: split[1],
                foreignName: split[2],
                code: split[3],
                lines: split.slice(4).map(e => this.getLineData(e))
            }
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
        station: function (val) {
            this.initTrainInfo()
            let strings = location.href.split('#');
            strings[1] = val.name
            location.href = encodeURI(`${strings[0]}#${strings[1]}`)
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