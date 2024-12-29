<template>
    <q-tab-panels v-cloak v-if="currentStation&&currentLine" class="full-height" v-model="currentStationId"
                  swipeable
                  animated
                  @touchstart.stop>
        <q-tab-panel v-for="station in currentLine.stations" :name="station.id" :key="station.id"
                     style="display: flex;flex-direction: column;">
            <div class="row">
                <div class="col-3 station-name-row small text-left">
                    <div v-if="previousStation">
                        <div style="font-size: 25px;margin-bottom: 15px;overflow: hidden">
                            <i class="fa-solid fa-arrow-left"></i>
                        </div>
                        <div class="direction-text">
                            <div v-overflow-auto-scroll>
                                <span>{{ t('directionShort') }}: <b>{{ previousStation.direction }}</b></span>
                            </div>
                        </div>
                        <div v-overflow-auto-scroll>
                            <span>{{ previousStation.name }}</span>
                        </div>
                    </div>
                </div>
                <!-- tool bar -->
                <div class="col-6 station-name-row" style="display: flex;align-items: center;justify-content: center;">
                    <div class="tool-bar" style="z-index: 10">
                        <div @click="handleFavourStation(currentStation)">
                            <q-icon :style="{color:currentStation.isFavourite?'var(--q-favourite)':'white'}"
                                    name="star"/>
                        </div>
                        <div>
                            <q-icon name="departure_board" @click="handleShowSchedule"/>
                        </div>
                        <div>
                            <a :href="locationUrl" target="_blank">
                                <q-icon name="map"/>
                            </a>
                        </div>
                    </div>
                    <div style="margin-top: 5px;max-width: 40%;" @click="handleClickStationName">
                        <div class="text-h6 station-name-text current-station"
                             style="border-bottom: 1px solid var(--q-primary); margin-bottom: 5px;width: auto">
                            <span v-overflow-auto-scroll style="display: block;white-space: nowrap;">
                                {{ station.name }}
                            </span>
                        </div>
                        <div v-if="station.code" class="pill" style="margin: 0 auto">
                            {{ station.code }}
                        </div>
                    </div>
                </div>
                <div class="col-3 station-name-row small text-right">
                    <div v-if="nextStation">
                        <div style="font-size: 25px;margin-bottom: 15px;overflow: hidden">
                            <i class="fa-solid fa-arrow-right"></i>
                        </div>
                        <div class="direction-text">
                            <div v-overflow-auto-scroll>
                                <span>{{ t('directionShort') }}: <b>{{ nextStation.direction }}</b></span>
                            </div>
                        </div>
                        <div v-overflow-auto-scroll>
                            <span>{{ nextStation.name }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <q-separator color="primary" size="2px" style="margin: 0 0 10px;"/>
            <q-skeleton v-if="!currentLine" class="col-12" style="height: 25px;margin-bottom: 5px;"/>
            <div v-if="currentLine" class="col-12" style="overflow-x: scroll;white-space: nowrap;margin-bottom: 5px;"
                 @touchstart="handleTouchLineIconRegionStart" ref="lineIconRegion">
                <LineIcon class="line-icon" v-show="currentStation.lines.length>1" :line="{
          name:t('all'),
          color:'#36598f'
        }" @click="(event)=> handleClickLineIcon(event,'all')" :disabled="currentLineId!=='all'"/>
                <LineIcon v-for="line in currentStation.lines" :line="line" :key="line.id"
                          @click="(event)=> handleClickLineIcon(event,line)"
                          :disabled="currentLineId==='all'||line.id!==currentLine.id" class="line-icon">
                </LineIcon>
            </div>
            <div class="scroll train-info-area-wrapper" ref="trainInfoArea">
                <q-pull-to-refresh @refresh="handleRefreshTrainData" @touchstart="handleTouchTrainDataRegionStart">
                    <div>
                        <div v-if="showSkeleton">
                            <q-skeleton height="40px" style="margin-bottom: 5px;"/>
                            <q-skeleton height="30px" style="margin-bottom: 2px;"/>
                            <q-skeleton height="30px" style="margin-bottom: 2px;"/>
                            <q-skeleton height="30px" style="margin-bottom: 2px;"/>
                        </div>
                        <q-tab-panels class="train-data-wrapper" v-model="currentLineId"
                                      swipeable animated infinite>
                            <q-tab-panel v-if="currentStation.lines.length>1"
                                         name="all"
                                         style="padding-left: 0;padding-right: 0;padding-top: 0;">
                                <div class="realtime-info-wrapper text-left">
                                    <div class="row train-data border-bottom"
                                         v-if="!isLoadingTrains && (allTrains.length===0)"
                                         style="padding-left: 4px; color: var(--q-normal);height: 40px;justify-content: center">
                                        {{ t('noTrain') }}
                                    </div>
                                    <transition-group name="list-view" tag="div">
                                        <TrainDataItemForAll v-for="_trainInfo in allTrains" :key="_trainInfo.id"
                                                             @show-train-detail="showTrainInfoDetailView"
                                                             :train-data="_trainInfo" :station="currentStation"/>
                                    </transition-group>
                                </div>
                            </q-tab-panel>
                            <q-tab-panel v-for="line in currentStation.lines" :name="line.id" :key="line.id"
                                         style="padding-left: 0;padding-right: 0;padding-top: 0;">
                                <div class="row train-data border-bottom"
                                     v-if="!isLoadingTrains && (currentTrains&&currentTrains.length===0)"
                                     style="padding-left: 4px; color: var(--q-normal);height: 40px;justify-content: center">
                                    {{ t('noTrain') }}
                                </div>
                                <div class="realtime-info-wrapper text-left" v-for="directionTrainInfo in currentTrains"
                                     :key="directionTrainInfo.direction">
                                    <q-expansion-item expand-separator default-opened popup>
                                        <template v-slot:header>
                                            <div class="border-bottom" style="width: 100%;">
                                             <span class="direction-text">
                                                 <i>{{ directionTrainInfo.direction }}</i>
                                                 <span style="color: var(--q-normal);margin-left: 3px;">
                                                     {{ t('direction') }}
                                                 </span>
                                             </span>
                                            </div>
                                        </template>
                                        <div class="row train-data border-bottom"
                                             v-if="!isLoadingTrains && (directionTrainInfo.trains&&directionTrainInfo.trains.length===0)"
                                             style="padding-left: 4px; color: var(--q-normal);height: 40px;justify-content: center">
                                            {{ t('noTrain') }}
                                        </div>
                                        <TrainDataItem v-for="_trainInfo in directionTrainInfo.trains"
                                                       :key="_trainInfo.id"
                                                       :station="currentStation"
                                                       @show-train-detail="showTrainInfoDetailView"
                                                       :train-data="_trainInfo"/>
                                    </q-expansion-item>
                                </div>
                            </q-tab-panel>
                        </q-tab-panels>
                    </div>
                </q-pull-to-refresh>
            </div>
        </q-tab-panel>
    </q-tab-panels>
    <line-stations-selector :height="45" ref="lineStationsSelector" @select="handleSelectStation"/>
    <station-selector ref="stationSelector" @select="handleSelectStation"/>
    <train-info-detail-view v-if="showTrainInfo" :train-info-id-prop="showTrainInfo.id" :date="showTrainInfo.date"
                            @close="handleCloseShowTrainDetail"/>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref, toRaw, watch} from "vue";
import LineIcon from "components/LineIcon.vue";
import TrainDataItem from "components/TrainDataItem.vue";
import {useI18n} from "vue-i18n";
import TrainDataItemForAll from "components/TrainDataItemForAll.vue";
import StationSelector from "components/StationSelector.vue";
import {useStore} from "vuex";
import {useQuasar} from "quasar";
import LineStationsSelector from "components/LineStationsSelector.vue";
import {isNumber} from "src/utils/string-utils";
import TrainInfoDetailView from "components/TrainInfoDetailView.vue";
import _ from "lodash";
import {useRouter} from "vue-router";
import dayjs from "dayjs";

const router = useRouter()
const $q = useQuasar()
const {t} = useI18n()
const emit = defineEmits(['changeStation'])
const store = useStore()
const trainInfoMap = ref(new Map())

const lineIconRegion = ref(null)
const trainInfoArea = ref(null)
const isLoadingStation = ref(true)
const isLoadingTrains = ref(false)
const currentLine = ref(null)
const stationSelector = ref(null)
const lineStationsSelector = ref(null)
const currentStation = ref(null)
const currentTrains = ref([])
const allTrains = ref([])
const showTrainInfo = ref(null)

//TODO 国际化 多地图服务商 根据坐标查询
const locationUrl = computed(() => {
    const _station = currentStation.value
    if (!_station) {
        return "/"
    }
    const base = "https://www.amap.com/search?query="
    const railsystem = store.getters['railsystem/railsystemGetter'](_station.railsystemCode)
    let url = `${base}${_station.name}地铁站`
    if (railsystem) {
        url += " " + railsystem.city
    }
    return url
})

const props = defineProps({
    currentStationIdProp: {
        type: String,
    },
    currentLineIdProp: {
        type: String,
        default: null
    },
})

onMounted(() => {
    init()
})

watch(props, (newVal, oldValue) => {
    if (!currentStationId.value && newVal.currentStationIdProp) {
        init()
    }
})

const showSkeleton = computed(() => {
    return isLoadingTrains.value && (currentTrains.value && currentTrains.value.length === 0)
})
const handleFavourStation = (_station) => {
    if (!_station) return
    store.dispatch('preference/favourStation', {station: _station}).then(_isFavouriteStation => {
        if (currentStation.value && currentStation.value.id === _station.id) {
            currentStation.value.isFavourite = _isFavouriteStation
            if (_isFavouriteStation) {
                $q.notify.ok(t('favourStationOk'))
            }
        }
    })
}

const showTrainInfoDetailView = (trainInfo) => {
    if (trainInfo) {
        showTrainInfo.value = {
            id: trainInfo.id,
            date: trainInfo.trainDate
        }
    }
}

const handleCloseShowTrainDetail = () => {
    showTrainInfo.value = null
}

const currentTrainsMap = ref(new Map())

/**
 * Calculate trains to show on current line tab
 */
async function calcCurrentTrains(_lineId, _station) {
    if (!trainInfoMap.value || !currentStation.value) {
        console.warn('trainInfoMap or currentStation is not inited')
        return []
    }
    const _stationId = _station.id
    const allLines = new Map(currentStation.value.lines.map(it => [it.id, it]))
    try {
        if (allLines) {
            if (_lineId === 'all') {
                // All Trains
                currentTrainsMap.value = new Map()
                const loadTrainsPromises = Array.from(allLines.keys()).map(lineId => loadLineTrains(lineId, _stationId))
                loadTrainsPromises.forEach(promise => promise.then(lineTrains => {
                    if (!checkIsChanged(_lineId, _stationId)) {
                        addAllTrains(lineTrains)
                    }
                }))
            } else {
                const lineTrains = await store.dispatch('realtime/getStationDirectionTrains', {
                    stationId: _stationId,
                    lineId: _lineId
                })
                if (!checkIsChanged(_lineId, _stationId)) {
                    currentTrains.value = lineTrains
                }
            }
        }
    } catch {

    }
}


async function loadLineTrains(lineId, _stationId) {
    console.log('loading line trains', 'lineId:', lineId, 'stationId:', _stationId)
    if (!isNumber(lineId)) {
        return Promise.reject('LineId is not a number:' + lineId)
    }
    const _currentStationId = _stationId
    if (lineId && currentStationId) {
        return store.dispatch('realtime/getStationTrains', {stationId: _currentStationId, lineId: lineId}).then(r => {
            if (r instanceof Array) {
                trainInfoMap.value.set(lineId, r)
                return r
            }
        }).catch(err => {
            return Promise.reject(err)
        })
    } else {
        return Promise.reject(`lineId or currentStationId is illegal lineId:${lineId} currentStationId:${_currentStationId}`)
    }
}

function checkIsChanged(originLineId, originStationId) {
    return (currentLineId.value !== originLineId) || (originStationId !== currentStationId.value)
}

const addAllTrains = (trainInfoList) => {
    if (!(trainInfoList instanceof Array)) return
    trainInfoList.forEach(it => {
        currentTrainsMap.value.set(it.id, true)
        it.updateTime = new Date().getTime()
    })
    trainInfoList = trainInfoList.sort((i1, i2) => i1.dep.localeCompare(i2.dep))
    let index = 0
    const interval = setInterval(() => {
        if (index >= trainInfoList.length) {
            clearInterval(interval)
            // 删除 allTrains 中不在 currentTrainsMap 中的元素
            for (let i = allTrains.value.length - 1; i >= 0; i--) {
                const train = allTrains.value[i]
                if (!currentTrainsMap.value.get(train.id)) {
                    allTrains.value.splice(i, 1)
                }
            }
            allTrains.value.sort((i1, i2) => i1.dep.localeCompare(i2.dep))
            return
        }
        const rItem = trainInfoList[index]
        const curIndex = allTrains.value.findIndex(it => it.id === rItem.id);
        if (curIndex !== -1) {
            allTrains.value[curIndex] = rItem
            index++
            return
        }
        const preIndex = allTrains.value.findLastIndex(it => it.dep.localeCompare(rItem.dep))
        allTrains.value.splice(preIndex + 1, 0, rItem)
        index++
    }, 250)

    // lineTrains.map(it => {
    //     it.line = allLines.get(lineId)
    //     return it
    // })
}

async function updateCurrentTrains() {
    if (isLoadingTrains.value) {
        return
    }
    isLoadingTrains.value = true
    const _currentLindId = currentLineId.value
    if (!_currentLindId) {
        return
    }
    const _station = currentStation.value
    if (!_station) {
        return
    }
    return calcCurrentTrains(_currentLindId, _station).then(_ => {
    }).catch(err => {
        console.warn('updateCurrentTrains err:', err)
        $q.notify.error(`${t('update')} ${t('trainInfo')} ${t('error')}`)
        currentTrains.value = []
    }).finally(_ => {
        isLoadingTrains.value = false
    })
}

const handleSelectStation = (stationId, lineId) => {
    if (stationId) {
        handleChangeStation(stationId, lineId, "handleSelectStation")
    }
}

const refreshTrainInfoTimer = setInterval(() => {
    updateCurrentTrains()
}, 30000)

//clean refresh train info timer
onBeforeUnmount(() => {
    clearInterval(refreshTrainInfoTimer)
})

let currentStationId = ref(null)
let currentLineId = ref(null)

function init() {
    handleChangeStation(props.currentStationIdProp, props.currentLineIdProp, "init")
}

const handleChangeStation = (stationId, lineId, source) => {
    console.log('Change station to stationId:', stationId, lineId, 'source:' + source)
    trainInfoMap.value = new Map()
    allTrains.value = []
    changeStation(stationId, lineId).then(station => {
        currentStation.value = station
        currentStationId.value = station.id
        updateCurrentTrains()
        emit('changeStation', station)
    }).finally(_ => {
        isLoadingStation.value = false
    })
}

async function changeStation(stationId, lineId) {
    if (!stationId) {
        return Promise.reject('stationId is undefined')
    }
    isLoadingStation.value = true
    const station = await store.dispatch('railsystem/getStation', {stationId})
    if (!station || !(station.lines instanceof Array)) {
        console.warn(`Load station error, cannot get station info. stationId:${stationId}`)
        return Promise.reject(`Load station error, cannot get station info. stationId:${stationId}`)
    }
    let line
    if (typeof lineId === "string") {
        line = station.lines.find(it => it.id === lineId)
    }
    if (!line) {
        line = station.lines[0]
    }
    currentLineId.value = line.id
    handleChangeLine(line.id)
    return station
}

watch(currentLineId, (lineId, oldValue) => {
    if (!lineId || lineId === oldValue) {
        return
    }
    currentTrains.value = []
    if (lineId === 'all') {
        updateCurrentTrains()
        return
    }
    handleChangeLine(lineId)
})

const handleChangeLine = (lineId) => {
    if (!lineId) {
        console.warn('lineId cannot be undefined')
        return
    }
    loadLineInfo(lineId).then(_line => {
        if (lineId === currentLineId.value) {
            currentLine.value = _line
            updateCurrentTrains()
        }
    }).catch(err => {
        console.warn('loadLineInfo err:', err)
    })
}

async function loadLineInfo(lineId) {
    return store.dispatch('railsystem/getLine', {lineId}).then(_line => {
        if (_line && lineId === _line.id) {
            const _result = _.cloneDeep(toRaw(_line))
            return Promise.resolve(_result)
        } else {
            console.warn('Load line info err! lineId:', lineId)
            return Promise.reject('Load line info err!')
        }
    })
}

const handleRefreshTrainData = (done) => {
    updateCurrentTrains().then(_ => {
        setTimeout(() => {
            done()
            $q.notify.ok(t('trainDataUpdated'))
        }, 1000)
    })
}

const handleTouchTrainDataRegionStart = (event) => {
    if (currentStation.value.lines.length > 1) {
        event.stopPropagation()
    }
}
const handleShowSchedule = () => {
    const stationId = currentStation.value.id
    const lineId = currentLine.value.id
    if (stationId && lineId) {
        const params = {stationId, lineId};
        router.push({name: 'station-schedule-detail', params: params})
    }
}

const handleClickStationName = (event) => {
    stationSelector.value.showSelector()
}

const handleTouchLineIconRegionStart = (event) => {
    const dom = toRaw(lineIconRegion.value)[0]
    if (!dom) {
        return
    }
    const clientWidth = dom.clientWidth
    const scrollWidth = dom.scrollWidth
    if (scrollWidth > clientWidth) {
        event.stopPropagation();
    }
}

function calcRelativeStation(offset) {
    if (!currentLine.value || !currentLine.value.stations) {
        return null;
    }
    const _stations = currentLine.value.stations
    const number = _stations.findIndex(it => it.id === currentStationId.value)
    const station = _stations[number + offset]

    if (station === undefined) return null;

    const newStation = Object.assign({}, station)
    newStation.direction = offset > 0
        ? _stations.slice(-1)[0].name
        : _stations[0].name;
    return newStation;
}

const nextStation = computed(() => calcRelativeStation(1))
const previousStation = computed(() => calcRelativeStation(-1))

const handleClickLineIcon = (event, line) => {
    if (line === 'all') {
        currentLineId.value = 'all'
        return
    }
    if (line && line.id) {
        if (currentLineId.value === line.id) {
            lineStationsSelector.value.showSelector({
                position: event.target.getBoundingClientRect(),
                lineProp: currentLine.value,
                currentStationIdProp: currentStationId.value
            })
        } else {
            currentLineId.value = line.id
        }
    }
}

watch(currentStationId, (stationId, oldValue) => {
    if (stationId === oldValue || !stationId) {
        return
    }
    if (currentStation.value) {
        if (currentStation.value.id === stationId) {
            return
        }
    }
    const _currentLineId = currentLine.value && currentLine.value.id || null
    handleChangeStation(stationId, _currentLineId, "currentStationId Changed")
})

defineOptions({
    name: 'StationRealtimeView'
})
</script>
<style scoped>
.q-tab-panels {
    color: var(--q-primary-d);
    background-color: var(--q-background);
}

.station-name-text {
    font-weight: bold;
    text-align: center;
    overflow-x: auto;
    color: var(--q-normal);
    white-space: nowrap;
    width: fit-content;
    justify-self: center;
}

.q-tab-panel {
    padding: 5px 10px;
}

.train-data-wrapper .q-tab-panel {
    overflow-y: scroll;
    height: 100%;
}

.station-name-row {
    padding-left: 3px;
    padding-right: 3px;
    color: var(--q-normal);
    height: 80px;
}

.small div {
    font-size: 12px;
    line-height: 15px;
    white-space: nowrap;
    overflow-x: hidden; /* 超出内容隐藏 */
}

.line-icon {
    margin-right: 8px;
}

.realtime-info-wrapper {
    font-size: 16px;
    display: block;
    width: 100%;
}

.border-bottom {
    border-bottom: 1px solid #dcdcdc;
    display: flex;
    align-items: center;
}

.train-info-area-wrapper {
    flex-grow: 1;
}

.train-data div {
    padding-bottom: 2px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow-x: hidden;
    padding-top: 2px;
    margin-right: 2px;
}

.direction-text {
    font-weight: bold;
    font-size: 18px;
}

.station-name-row .direction-text {
    margin-bottom: 2px;
}

.pill {
    justify-self: center;
    height: 20px;
    font-size: 14px;
    padding: 0 10px;
    display: flex;
    width: fit-content;
    font-weight: bold;
    align-items: center;
    border: 2px solid var(--q-primary);
    border-radius: 10px;
}

.q-dark .pill {
    background-color: var(--q-primary);
}

.tool-bar {
    height: 20px;
    overflow-x: auto;
    background-color: var(--q-primary);
    width: 50%;
    position: absolute;
    top: 0;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
    display: flex;
    justify-content: space-around;
    align-items: center;
}

.tool-bar .q-icon {
    color: #ffffff;
}

::v-deep .q-item {
    padding: 0;
    max-height: 40px;
}

::v-deep .q-expansion-item--popup .q-expansion-item__container {
    border: none;
}

::v-deep .q-expansion-item--popup.q-expansion-item--expanded {
    padding-top: 0;
    padding-bottom: 0;
}

.list-view-enter-active {
    animation: stop-info-view-transition .5s;
}

.list-view-leave-active {
    animation: stop-info-view-transition .5s reverse;
}

@keyframes stop-info-view-transition {
    from {
        opacity: 0;
        transform: translateY(-30px);
    }
    to {
        transform: translateY(0px);
    }
}
</style>
