import {fetchStationSchedule} from '../../js/api.js'
import {getLineStation, LINES} from "../../js/line-data.js";
import {getStationById, getStationByKeyword} from "../../js/station-data.js";
import {TRAIN_LEVEL} from "../../js/train-level.js";

const app = new Vue({
    el: '#app',
    data: {
        station: {},
        line: {},
        date: moment(),
        schedule: null,
        updateTime: "",
        version: "",
        showVertical: false,
        otherTerminals: []
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
        mergeTerminal(terminal, directionSchedule) {
            let temp = Object.entries(directionSchedule)
                .map(item => item[1].map(item2 => [...item2, item[0]]))
                .reduce((item1, item2) => [...item1, ...item2])
                .map(item => this.toData(item, terminal.name))
                .reduce((acc, cur) => {
                    const hour = cur.hour.toString()
                    acc[hour] = acc[hour] ?? []
                    acc[hour].push(cur)
                    return acc
                }, {})
            return Object.entries(temp).map(item2 => {
                return {
                    hourStr: this.formatHour(item2[0]),
                    hour: parseInt(item2[0]),
                    dataList: item2[1]
                }
            })
        },
        fetchStationSchedule(stationId, lineId) {
            fetchStationSchedule(stationId, lineId).then(res => {
                if (res == null) return
                this.updateTime = res.updateTime
                this.version = res.version
                this.date = moment(res.date)
                const lineStation = getLineStation(this.line.code)
                this.schedule = new Map()
                const downTerminal = getStationById(lineStation.slice(-1)[0])
                const upTerminal = getStationById(lineStation[0])
                if (Object.keys(res.downSchedule).length !== 0) {
                    this.schedule.set(downTerminal.name, this.mergeTerminal(downTerminal, res.downSchedule))
                    this.otherTerminals.push(...Object.keys(res.downSchedule))
                }
                if (Object.keys(res.upSchedule).length !== 0) {
                    this.schedule.set(upTerminal.name, this.mergeTerminal(upTerminal, res.upSchedule))
                    this.otherTerminals.push(...Object.keys(res.upSchedule))
                }
                this.otherTerminals = this.otherTerminals.filter(item =>
                    item !== downTerminal.name && item !== upTerminal.name)
                console.log(this.schedule)
            })
        },
        getLineData(lineCode) {
            return LINES[lineCode]
        },
        parseStation(stationName) {
            if (stationName === undefined) return null
            return getStationByKeyword(stationName)[0]
        },
        toData(rawInfo, direction) {
            const depTime = this.date.clone().add(rawInfo[1], 's')
            if (depTime.seconds() >= 30) {
                depTime.add(1, 'm')
            }

            const dayOffset = Math.floor(rawInfo[1] / 86400)
            return {
                trainInfoId: rawInfo[0],
                depTime,
                hour: depTime.hours() + 24 * dayOffset,
                minute: depTime.minutes().toString().padStart(2, '0'),
                level: TRAIN_LEVEL[rawInfo[2]],
                terminal: rawInfo[3],
                get showStr() {
                    return this.terminal === direction ? this.minute : `${this.minute}${this.terminal.substring(0, 1)}`
                }
            }
        },
        saveAsImg() {
            console.log("saving schedule as image")
            const scale = 3
            const domNode = this.$refs['station-schedule-wrapper']
            domtoimage.toPng(domNode, {
                width: domNode.clientWidth * scale,
                height: domNode.clientHeight * scale,
                style: {
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left'
                }
            })
                .then(dataUrl => {
                    let a = document.createElement('a')
                    a.href = dataUrl
                    a.download = `${this.station.name}-${this.line.name}时刻表`
                    a.click()
                })
                .catch(error => {
                    console.error(error)
                })
        },
        formatHour(hour) {
            if (hour < 24) return `${hour}时`
            if (hour < 48) return `次日${hour - 24}时`
            return `+${hour}时`
        },

    },
    created() {
        this.init()
    },
    computed: {
        horizontalSchedule() {
            if (this.schedule == null) return []
            return Array.from(this.schedule.entries())
                .map(item => {
                    item[1].forEach(item => item.dataList.sort((o1, o2) => o1.depTime - o2.depTime))
                    return {
                        terminal: item[0],
                        schedule: item[1]
                    }
                })
        },
        verticalSchedule() {
            if (this.schedule == null) return []
            const tempMap = new Map()
            for (const key of this.schedule.keys()) {
                const item = this.schedule.get(key)
                tempMap.set(key, JSON.parse(JSON.stringify(item)))
            }
            const temp = Array.from(tempMap.entries())
                .map(item => item[1].map(h => h))
                .reduce((acc, cur) => {
                    return [...acc, ...cur]
                }, [])
                .reduce((acc, cur) => {
                    const {hour, dataList} = cur
                    let findIndex = acc.findIndex(item => item.hour === hour)
                    if (findIndex === -1) {
                        acc.push(cur)
                    } else {
                        acc[findIndex].dataList.push(...dataList)
                    }
                    return acc
                }, [])
            temp.forEach(item => item.dataList.sort((o1, o2) => o1.depTime.localeCompare(o2.depTime)))
            temp.sort((o1, o2) => o1.hour - o2.hour)
            return temp
        },
    }
})