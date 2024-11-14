<template>
    <q-tab-panels v-cloak v-if="currentStationId" class="full-height" v-model="currentStationId" swipeable
                  animated
                  @touchstart.stop>
        <q-tab-panel v-for="station in currentLine.stations" :name="station.id" :key="station.id">
            <div class="row">
                <div class="col-3 station-name-row small text-left">
                    <div v-if="previousStation!=null">
                        <div style="font-size: 25px;margin-bottom: 15px;overflow: hidden">
                            <i class="fa-solid fa-arrow-left"></i>
                        </div>
                        <div class="direction-text">
                            {{ t('directionShort') }} <b>{{ previousStation.direction }}</b>
                        </div>
                        <div>
                            {{ previousStation.name }}
                        </div>
                    </div>
                </div>
                <div class="col-6 station-name-row" style="display: flex;align-items: center;justify-content: center;">
                    <div class="tool-bar" style="z-index: 2000">
                        <q-icon name="star"></q-icon>
                        <q-icon name="departure_board"></q-icon>
                        <q-icon name="map"></q-icon>
                    </div>
                    <div style="margin-top: 5px;" @click="handleClickStationName">
                        <div class="text-h6 station-name-text current-station"
                             style="border-bottom: 1px solid var(--q-primary); margin-bottom: 5px;">
                            {{ station.name }}
                        </div>
                        <div v-if="station.code" class="pill" style="margin: 0 auto">
                            {{ station.code }}
                        </div>
                    </div>
                </div>
                <div class="col-3 station-name-row small text-right">
                    <div v-if="nextStation!=null">
                        <div style="font-size: 25px;margin-bottom: 15px;overflow: hidden">
                            <i class="fa-solid fa-arrow-right"></i>
                        </div>
                        <div class="direction-text">
                            {{ t('directionShort') }} <b>{{ nextStation.direction }}</b>
                        </div>
                        <div>
                            {{ nextStation.name }}
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
        }" @click="handleClickLineIcon('all')" :disabled="currentLineId!=='all'"/>
                <LineIcon v-for="line in currentStation.lines" :line="line" :key="line.id"
                          @click="handleClickLineIcon(line)"
                          :disabled="currentLineId==='all'||line.id!==currentLine.id" class="line-icon">
                </LineIcon>
            </div>
            <div class="scroll" style="height: 57%;" ref="trainInfoArea">
                <q-pull-to-refresh @refresh="handleRefreshTrainData" @touchstart="handleTouchTrainDataRegionStart">
                    <div>
                        <div v-if="isLoadingTrains && (!currentTrains||currentTrains.length===0)">
                            <q-skeleton height="40px" style="margin-bottom: 5px;"/>
                            <q-skeleton height="30px" style="margin-bottom: 2px;"/>
                            <q-skeleton height="30px" style="margin-bottom: 2px;"/>
                            <q-skeleton height="30px" style="margin-bottom: 2px;"/>
                        </div>
                        <q-tab-panels class="train-data-wrapper" v-model="currentLineId"
                                      swipeable animated infinite>
                            <q-skeleton v-if="!currentTrains||currentTrains.length===0" square height="150px"/>
                            <q-tab-panel v-if="currentStation.lines.length>1" name="all"
                                         style="padding-left: 0;padding-right: 0;padding-top: 0;">
                                <div class="realtime-info-wrapper text-left">
                                    <div class="row train-data border-bottom"
                                         v-if="!isLoadingTrains && (currentTrains&&currentTrains.length===0)"
                                         style="padding-left: 4px; color: var(--q-normal);height: 40px;justify-content: center">
                                        {{ t('noTrain') }}
                                    </div>
                                    <transition-group name="list-view" tag="div">
                                        <TrainDataItemForAll v-for="_trainInfo in currentTrains" :key="_trainInfo.id"
                                                             :train-data="_trainInfo"/>
                                    </transition-group>
                                </div>
                            </q-tab-panel>
                            <q-tab-panel v-for="line in currentStation.lines" :name="line.id" :key="line.id"
                                         style="padding-left: 0;padding-right: 0;padding-top: 0;">
                                <div class="realtime-info-wrapper text-left" v-for="directionTrainInfo in currentTrains"
                                     :key="directionTrainInfo.direction">
                                    <q-expansion-item expand-separator default-opened popup>
                                        <template v-slot:header>
                                            <div class="border-bottom" style="width: 100%;">
                        <span class="direction-text"><i>{{ directionTrainInfo.direction }}</i> <span
                            style="color: var(--q-normal)">{{ t('direction') }}</span> </span>
                                            </div>
                                        </template>
                                        <div class="row train-data border-bottom"
                                             v-if="!isLoadingTrains && (directionTrainInfo.trains&&directionTrainInfo.trains.length===0)"
                                             style="padding-left: 4px; color: var(--q-normal);height: 40px;justify-content: center">
                                            {{ t('noTrain') }}
                                        </div>
                                        <TrainDataItem v-for="_trainInfo in directionTrainInfo.trains"
                                                       :key="_trainInfo.id"
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
    <line-stations-selector ref="lineStationsSelector"/>
    <station-selector ref="stationSelector"/>
</template>

<script setup>
import {computed, onMounted, ref, toRaw, watch} from "vue";
import LineIcon from "components/LineIcon.vue";
import TrainDataItem from "components/TrainDataItem.vue";
import {useI18n} from "vue-i18n";
import TrainDataItemForAll from "components/TrainDataItemForAll.vue";
import StationSelector from "components/StationSelector.vue";
import {useStore} from "vuex";
import {useQuasar} from "quasar";
import LineStationsSelector from "components/LineStationsSelector.vue";
import {getNowByTimezone} from "src/utils/time-utils";

const $q = useQuasar()
const {t} = useI18n()
const emit = defineEmits(['changeStation'])
const store = useStore()
const EACH_DIRECTION_TRAIN_AMOUNT_LIMIT = 3
const trainInfoMap = ref(new Map())

const lineIconRegion = ref(null)
const trainInfoArea = ref(null)
const isLoadingStation = ref(true)
const isLoadingTrains = ref(true)
const currentLine = ref(null)
const stationSelector = ref(null)
const lineStationsSelector = ref(null)
const currentStation = ref(null)
const currentTrains = ref([])

/**
 * Calculate trains to show on current line tab
 */
async function calcCurrentTrains() {
    console.log('calc currentTrains')
    const _t = toRaw(trainInfoMap.value)
    const allLines = new Map(currentStation.value.lines.map(it => [it.id, it]))
    const currentTimezone = currentStation.value.timezone
    if (_t && allLines) {
        if (currentLineId.value === 'all') {
            // All Trains
            const allTrains = Array.from(allLines.keys())
                .map(lineId => {
                    // trainInfoMap do not contain directionTrains of this line
                    if (!_t.has(lineId)) {
                        loadLineTrains(lineId).then(_ => updateCurrentTrains())
                        return []
                    }
                    const lineTrains = _t.get(lineId).map(it => it.trains).flat()
                    if (lineTrains === 0) {
                        loadLineTrains(lineId).then(_ => updateCurrentTrains())
                        return []
                    }
                    const now = getNowByTimezone(currentTimezone)
                    return lineTrains.filter(it => it.arr >= now || (now >= it.arr && now < it.dep))
                        .map(it => {
                            it.line = allLines.get(lineId)
                            return it
                        })
                }).flat()
            return allTrains.sort((i1, i2) => i1.dep - i2.dep)
        }

        let directionTrains = []
        let _lineId = currentLineId.value
        if (!_t.has(_lineId)) {
            await loadLineTrains(_lineId)
        }
        _lineId = currentLineId.value
        if (_t.has(_lineId)) {
            directionTrains = _t.get(_lineId)
            if (directionTrains.length === 0) {
                loadLineTrains(_lineId).then(_ => updateCurrentTrains())
            } else {
                const now = getNowByTimezone(currentTimezone)
                directionTrains.forEach(it => {
                    it.trains = it.trains.filter(it => it.arr >= now || (now >= it.arr && now < it.dep)).slice(0, EACH_DIRECTION_TRAIN_AMOUNT_LIMIT).sort((i1, i2) => i1.dep - i2.dep)
                })
                return directionTrains
            }
        }
    }
    return []
}

async function loadLineTrains(lineId) {
    if (lineId === 'all') {
        return Promise.reject()
    }
    console.log('loadLineTrains lineId:', lineId)
    const currentStationId = currentStation.value.id
    if (lineId && currentStationId) {
        return store.dispatch('realtime/loadStationTrains', {currentStationId, lineId}).then(r => {
            trainInfoMap.value.set(lineId, r)
        })
    } else {
        return Promise.reject(`lineId or currentStationId is illegal lineId:${lineId} currentStationId:${currentStationId}`)
    }
}

function updateCurrentTrains() {
    console.log('updateCurrentTrains')
    isLoadingTrains.value = true
    calcCurrentTrains().then(r => {
        isLoadingTrains.value = false
        if (r instanceof Array && r.length > 0) {
            if (r[0].id === undefined) {
                currentTrains.value = r
                return
            }
            if (r.length > 0) {
                let index = 0
                const interval = setInterval(() => {
                    if (index >= r.length) {
                        clearInterval(interval)
                        // 删除 currentTrains 中不在 r 中的元素
                        for (let i = currentTrains.value.length - 1; i >= 0; i--) {
                            const train = currentTrains.value[i];
                            if (!r.find(item => item.id === train.id)) {
                                currentTrains.value.splice(i, 1)
                            }
                        }
                        return
                    }
                    const rItem = r[index]
                    const existingIndex = currentTrains.value.findIndex(item => item.id === rItem.id);
                    if (existingIndex === -1) {
                        currentTrains.value.splice(index, 0, rItem);
                    } else if (existingIndex !== index) {
                        // 如果位置不一致，将其移动到正确位置
                        const [item] = currentTrains.value.splice(existingIndex, 1);
                        currentTrains.value.splice(index, 0, item);
                    }
                    index++
                }, 250)
            }
        } else {
            currentTrains.value = []
        }
    })
}

const props = defineProps({
    currentStationIdProp: {
        type: String,
    },
    currentLineIdProp: {
        type: String,
    },
})
const stations = ref(null)
let currentStationId = ref(null)
let currentLineId = ref(null)

function init() {
    loadStationInfo(props.currentStationIdProp, props.currentLineIdProp).then(r => {
        console.log('load station info OK.')
    })
}

async function loadStationInfo(stationId, lineId) {
    isLoadingStation.value = true
    const station = await store.dispatch('railsystem/getStation', stationId)
    if (!station || !(station.lines instanceof Array)) {
        console.warn('Load station error, cannot get station info. stationId:', station)
        isLoadingStation.value = false
        return
    }
    let line
    if (typeof lineId === "string") {
        line = station.lines.find(it => it.id === lineId)
    }
    if (!line) {
        line = station.lines[0]
    }
    if (!line.stations) {
        line.stations = await store.dispatch('railsystem/getStationsByLine', line.id)
        stations.value = line.stations
    }
    currentStation.value = station
    currentStationId.value = station.id
    currentLineId.value = line.id
    currentLine.value = line
    isLoadingStation.value = false
}

watch(currentLineId, (lineId, oldValue) => {
    if (!lineId || lineId === oldValue) {
        return
    }
    console.log('Change line, new lineId', lineId)
    currentTrains.value = []
    if (lineId === 'all') {
        updateCurrentTrains()
        return
    }
    store.dispatch('railsystem/getLine', lineId).then(_line => {
        if (_line) {
            currentLine.value = _line
            currentLineId.value = _line.id
            updateCurrentTrains()
        } else {
            console.warn('Load line info err! lineId:', lineId)
        }
    })
})

const handleRefreshTrainData = (done) => {
    setTimeout(() => {
        done()
        $q.notify.ok('列车数据已更新')
    }, 1000)
}

const handleTouchTrainDataRegionStart = (event) => {
    if (currentStation.value.lines.length > 1) {
        event.stopPropagation()
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

onMounted(() => {
    init()
});


function calcRelativeStation(offset) {
    if (!currentLine.value || !currentLine.value.stations) {
        return null;
    }
    const _stations = currentLine.value.stations
    const number = _stations.findIndex(it => it.id === currentStation.value.id)
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

const handleClickLineIcon = (line) => {
    if (line === 'all') {
        currentLineId.value = 'all'
        return
    }
    if (line && line.id) {
        if (currentLineId.value === line.id) {
            lineStationsSelector.value.showSelector(currentLine.value, currentStationId.value)
        } else {
            currentLineId.value = line.id
        }
    }
}

watch(currentStationId, (stationId, oldValue) => {
    if (stationId === oldValue || !stationId) {
        return
    }
    //change station
    if (stationId) {
        trainInfoMap.value = new Map()
        updateCurrentTrains()
    }
    loadStationInfo(stationId, currentLine.value.id)
    emit('changeStation')
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
    text-overflow: ellipsis; /* 超出内容省略号 */
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
