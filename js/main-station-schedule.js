import {fetchStationSchedule} from './api.js'
import {SEARCH_STATION_REGEX} from './regex-patterns.js'

const app = new Vue({
    el: '#app',
    data: {
        station: {},
        line: {},
        stationSchedule: null,
        updateTime: "获取时刻表失败",
        hourDataList: [],
        imgUrl: null
    },
    methods: {
        init() {
            const url = decodeURI(location.href)
            const params = url.split("#")[1].split('/')
            const station = this.parseStation(params[0])
            if (station == null) {
                this.station = {
                    name: "暂无数据"
                }
                this.line = {
                    name: "No Data"
                }
                return
            }
            this.station = station
            if (params[1] === undefined) {
                this.line = this.station.lines[0]
            } else {
                this.line = this.getLineData(params[1])
            }
            this.fetchStationSchedule(this.station.id, this.line.id)
        },
        fetchStationSchedule(stationId, lineId) {
            fetchStationSchedule(stationId, lineId).then(e => {
                if (e == null) {
                    this.hourDataList = [{
                        hour: "N/A",
                        minuteDataList: [{
                            minute: "无数据",
                            terminal: "No Data"
                        }]
                    }]
                    return
                }
                this.updateTime = e.updateTime
                this.hourDataList = e.hourDataList
            })
        },
        getLineData(lineCode) {
            return lineData[lineCode]
        },
        parseStation(stationName) {
            if (stationName === undefined) return null
            const stationRawString = this.getMatchedStation(stationName)[0]
            if (stationRawString == null) {
                return null
            }
            return this.toStation(stationRawString)
        },
        getMatchedStation(keyWord) {
            if (keyWord == null || keyWord === "") return null
            const pattern = SEARCH_STATION_REGEX(keyWord)
            return stationNames.match(pattern)
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
        saveAsImg() {
            console.log("saving schedule as image")
            domtoimage.toPng(this.$refs['station-schedule-wrapper'])
                .then(dataUrl => {
                    let a = document.createElement('a')
                    a.href = dataUrl
                    a.download = `${this.station.name} - ${this.line.name} 时刻表`
                    a.click()
                })
                .catch(error => {
                    console.error(error)
                })
        }

    },
    created() {
        this.init()
    }
})