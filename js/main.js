import {fetchStationTrainInfo} from './api.js'

const app = new Vue({
    el: '#app',
    data: {
        inputString: "",
        station: {
            id: 13,
            name: "新街口",
            lines: []
        },
        selectedLine: {},
        trainInfoList: [],
        trainInfoMap: new Map,
        info: "",
        updateTime: "----"
    },
    methods: {
        calcTrainInfoAttr() {
            if (this.trainInfoList.length === 0) return
            this.trainInfoList.forEach(e => {
                const arrTime = moment(`${e.date} ${e.arrTime.time}`).add(e.arrTime.dayOffset, 'd')
                const depTime = moment(`${e.date} ${e.depTime.time}`).add(e.depTime.dayOffset, 'd')
                const now = moment()
                let secArr = arrTime.diff(now, 's')
                let secDep = depTime.diff(now, 's')
                if (secArr > 15) {
                    e.status = `${Math.ceil(secArr / 60.0)}分钟`
                } else if (secArr > 0) {
                    e.status = "即将到达"
                } else if (secDep >= 0) {
                    e.status = "车已到达"
                } else {
                    e.status = "正在离开"
                }

                if (depTime.second() > 30) {
                    e.depShowTime = depTime.add(1, 's').format('HH:mm')
                } else {
                    e.depShowTime = depTime.format('HH:mm')
                }
            })
        },
        changeLine(line) {
            this.selectedLine = line
        },
        handleInput() {
            console.log(this.inputString)
        },
        handleSearch() {
            if (this.inputString === "") return
            let station = this.parseStation(this.inputString)
            if (station == null) {
                this.info = "无数据"
                return
            }
            this.selectedLine = null
            this.station = station
            this.selectedLine = this.station.lines[0]
            console.log(this.selectedLine)
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
            this.info = "少女祈祷中..."
            return fetchStationTrainInfo(stationId, lineId).then(e => {
                this.updateTime = moment().format("YYYY年MM月DD日 HH:mm")
                this.info = ""
                return e
            })
        },
        getLineData(lineCode) {
            return lineData[lineCode]
        },
        getStationRawString(keyWord) {
            let pattern = new RegExp(`(?<=.*?@)[^@]+${keyWord}.*?(?=&)`, "gi")
            let match = stationNames.match(pattern)
            return match == null ? null : match[0]
        },
        async getStationTrainInfo(stationId, lineId) {
            if (this.trainInfoMap.has(lineId)) {
                return this.trainInfoMap.get(lineId)
            }
            let data = await this.fetchStationTrainInfo(stationId, lineId)
            if (data != null) {
                this.trainInfoMap.set(lineId, data)
                return data
            }
            return []
        },
        parseStation(stationName) {
            if (stationName === undefined) return
            const stationRawString = this.getStationRawString(stationName)
            if (stationRawString == null) {
                this.info = "暂无数据"
                this.inputString = ""
                alert("暂无数据")
                return
            }
            let split = stationRawString.split(',')
            return {
                id: split[0],
                name: split[1],
                foreignName: split[2],
                code: split[3],
                lines: split.slice(4).map(e => this.getLineData(e))
            }
        },
        updateTrainInfo() {
            console.log("更新数据中")
            if (this.station === null || this.selectedLine == null) return
            this.fetchStationTrainInfo(this.station.id, this.selectedLine.id).then(r =>
                this.trainInfoMap.set(this.selectedLine, r))
        }
    },
    created() {
        this.init()
        setInterval(this.calcTrainInfoAttr, 5000)
        setInterval(this.updateTrainInfo, 60000)
    },
    watch: {
        station: function (val) {
            this.initTrainInfo()
            let strings = location.href.split('#');
            strings[1] = val.name
            location.href = encodeURI(`${strings[0]}#${strings[1]}`)
        },
        selectedLine(val) {
            if (val == null) return
            this.getStationTrainInfo(this.station.id, val.id).then(e => {
                this.trainInfoList = e
                this.calcTrainInfoAttr()
            })
        }
    }
})