<template>
    <q-tab-panels v-cloak v-if="currentStation&&currentLine" class="full-height" v-model="currentStationId"
                  swipeable
                  animated
                  :infinite="!!(currentLine?.extra?.isCircle)"
                  @touchstart.stop>
        <q-tab-panel v-for="station in (currentLine?.stations || [])" :name="station.id" :key="station.id"
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
                            <span>{{ previousStation.i18Name }}</span>
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
                            <q-icon @click="handleClickMap" name="map">
                                <OpenMapSelector :config="openOnMapConfig" @close="()=>openOnMapConfig=null"/>
                            </q-icon>
                        </div>
                    </div>
                    <div style="margin-top: 5px;width: 100%;" @click="handleClickStationName">
                        <div class="text-h6 station-name-text current-station"
                             style="border-bottom: 1px solid var(--q-primary); margin-bottom: 5px;width: 100%;">
                            <span v-overflow-auto-scroll style="display: block;white-space: nowrap;">
                                {{ station.i18Name }}
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
                            <span>{{ nextStation.i18Name }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <q-separator color="primary" size="2px" style="margin: 0 0 10px;"/>

            <!-- Operation Messages -->
            <div v-if="operationMsgs.length>0" style="height: 70px;margin-bottom: 10px;">
                <q-tab-panels v-model="curOpMsgId" swipeable animated @touchstart.stop infinite
                              style="height: 100%;opacity: 80%;border-radius: 10px;">
                    <q-tab-panel :name="msg.id" v-for="(msg,index) in operationMsgs" :key="msg.id"
                                 class="text-container"
                                 :style="{backgroundColor:msg.color}" style="color: white;text-overflow:ellipsis;">
                        <span style="position: absolute; opacity: 70%;right: 5px;top: 24px;font-size: 16px;"
                              v-show="operationMsgs.length>1&&index<operationMsgs.length-1">
                            <q-icon class="fa-solid fa-circle-chevron-right"/>
                        </span>
                        <span style="position: absolute; opacity: 70%;left: 5px;top: 24px;font-size: 16px;"
                              v-show="index>0">
                            <q-icon class="fa-solid fa-circle-chevron-left"/>
                        </span>
                        <OperationMsgDetailView :operation-msg="msg" @on-show="handleOpMsgDetailOnShow"
                                                @close="()=>shownOpMsg=null"/>
                        {{ msg.message }}
                    </q-tab-panel>
                </q-tab-panels>
            </div>

            <div v-if="externalStations?.length>0" class="col-12"
                 style="overflow-x: scroll;white-space: nowrap;margin-bottom: 5px;">
                <q-icon name="fa-solid fa-person-walking"/>
                <q-icon name="fas fa-ellipsis-h"/>
                <q-icon name="fa-solid fa-arrows-rotate" style="margin-right: 5px;"/>
                <StationIcon v-for="s in externalStations" :station="s" :key="s.id"
                             @click="handleShowExternalStation(s)"
                             class="line-icon"/>
            </div>
            <!-- 选择线路 -->
            <q-skeleton v-if="!currentLine" class="col-12" style="height: 25px;margin-bottom: 5px;"/>
            <div v-else class="col-12" style="overflow-x: scroll;white-space: nowrap;margin-bottom: 5px;"
                 @touchstart="handleTouchLineIconRegionStart" ref="lineIconRegion">
                <LineIcon class="line-icon" v-show="currentStation.lines.length>1"
                          :line="{name:t('all'),color:'#36598f'}"
                          @click="(event)=> handleClickLineIcon(event,'all')" :disabled="currentLineId!=='all'"/>
                <LineIcon v-for="line in currentStation.lines" :line="line" :key="line.id"
                          v-touch-hold:400.mouse="(evt)=>handleHoldOnLineIcon(evt,line)"
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
    <q-tab-panel v-else name="skeleton">
        <div class="row">
            <div class="col-12 station-name-row" style="display: flex;align-items: center;justify-content: center;">
                <div class="tool-bar" style="z-index: 10">
                    <div>
                        <q-icon style="color:white" name="star"/>
                    </div>
                    <div>
                        <q-icon name="departure_board"/>
                    </div>
                    <div>
                        <q-icon name="map"/>
                    </div>
                </div>
                <div style="margin-top: 5px;max-width: 40%;">
                    <div class="text-h6 station-name-text current-station"
                         style="border-bottom: 1px solid var(--q-primary);width: auto">
                        <q-skeleton height="40px" width="100px" type="text"/>
                    </div>
                    <div style="display: flex;align-items: center;justify-content: center;">
                        <q-skeleton height="30px" width="60px" type="text"/>
                    </div>
                </div>
            </div>
        </div>
        <q-separator color="primary" size="2px" style="margin: 0 0 10px;"/>
        <div class="full-width">
            <q-skeleton height="50px" width="100%" type="text"/>
            <q-separator color="gray" size="1px" style="margin: 0 0 10px;"/>
            <q-skeleton height="30px" width="100%" type="text"/>
            <q-skeleton height="30px" width="100%" type="text"/>
            <q-skeleton height="30px" width="100%" type="text"/>
            <q-skeleton height="30px" width="100%" type="text"/>
        </div>
    </q-tab-panel>
    <line-stations-selector :height="150" ref="lineStationsSelector" @select="handleSelectStation"/>
    <station-selector ref="stationSelector" @select="handleSelectStation"/>
    <EditFavouriteStationDialog :station="addFavStation" @close="()=>addFavStation=null"/>

</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref, toRaw, watch} from "vue";
import LineIcon from "components/LineIcon.vue";
import TrainDataItem from "components/TrainDataItem.vue";
import {useI18n} from "vue-i18n";
import TrainDataItemForAll from "components/TrainDataItemForAll.vue";
import StationSelector from "components/input/StationSelector.vue";
import {useStore} from "vuex";
import {useQuasar} from "quasar";
import LineStationsSelector from "components/input/LineStationsSelector.vue";
import {isNumber} from "src/utils/string-utils";
import _ from "lodash";
import {useRouter} from "vue-router";
import EditFavouriteStationDialog from "components/EditFavouriteStationDialog.vue";
import OpenMapSelector from "components/input/OpenMapSelector.vue";
import OperationMsgDetailView from "components/OperationMsgDetailView.vue";
import StationIcon from "components/StationIcon.vue";
import {toI18NameObject} from "src/utils/common_utils";

const router = useRouter()
const $q = useQuasar()
const {t} = useI18n()
const emit = defineEmits(['changeStation', 'close'])
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
const addFavStation = ref(null)
const openOnMapConfig = ref(null)
const operationMsgs = ref([])
const curOpMsgId = ref(null)
const shownOpMsg = ref(null)
const handleClickMap = () => {
    const _station = currentStation.value
    if (!_station) {
        return
    }
    if (_station.location) {
        openOnMapConfig.value = {
            location: _station.location,
            title: _station.name
        }
    }
}

const props = defineProps({
    currentStationIdProp: {
        type: String,
    },
    currentLineIdProp: {
        type: String,
        default: null
    },
    enableOpMsg: {
        type: Boolean,
        default: true
    },
    inModal: {
        type: Boolean,
        default: false
    }
})

onMounted(() => {
    init()
})

watch(props, (newVal, oldValue) => {
    if (!currentStationId.value && newVal.currentStationIdProp) {
        init()
    }
    if (newVal.currentStationIdProp) {
        if (currentStationId.value !== newVal.currentStationIdProp) {
            currentStationId.value = newVal.currentStationIdProp
        }
    }
})
const externalStations = ref(null)


const showSkeleton = computed(() => {
    return isLoadingTrains.value && (currentTrains.value && currentTrains.value.length === 0)
})
const handleFavourStation = (_station) => {
    if (!_station) return
    addFavStation.value = _station
}

const showTrainInfoDetailView = (trainInfo) => {
    if (trainInfo) {
        if (props.inModal) {
            emit('close', () => store.commit('application/SET_SHOWN_TRAININFO', {trainInfo: trainInfo}))
        } else {
            store.commit('application/SET_SHOWN_TRAININFO', {trainInfo: trainInfo})
        }
    }
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
    if (allLines) {
        if (_lineId === 'all') {
            // All Trains
            currentTrainsMap.value = new Map()
            const loadTrainsPromises = Array.from(allLines.keys()).map(lineId => loadLineTrains(lineId, _stationId))
            loadTrainsPromises.forEach(promise => promise.then(lineTrains => {
                if (!checkIsChanged(_stationId)) {
                    addAllTrains(lineTrains)
                }
            }))
        } else {
            const lineTrains = await store.dispatch('realtime/getStationDirectionTrains', {
                stationId: _stationId,
                lineId: _lineId
            })
            if (!checkIsChanged(_stationId)) {
                currentTrains.value = lineTrains
            }
        }
    }
}


function handleShowExternalStation(externalStation) {
    if (externalStation?.id) {
        store.commit('application/SET_SHOWN_STATION_ID', {stationId: externalStation.id})
    }
}

async function loadLineTrains(lineId, _stationId) {
    if (!lineId) {
        return Promise.reject('LineId is empty')
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

function checkIsChanged(originStationId) {
    if (currentStationId.value) {
        return (originStationId !== currentStationId.value)
    }
    return false
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
}

async function updateCurrentTrains(force = false) {
    if (isLoadingTrains.value && !force) {
        return
    }
    console.log('updateCurrentTrains... current station:', currentStation.value)
    isLoadingTrains.value = true
    currentTrains.value = []
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

const handleSelectStation = ({stationId, lineId}) => {
    if (isNumber(stationId)) {
        currentLineId.value = lineId
        currentStationId.value = stationId
    }
}

const handleOpMsgDetailOnShow = (opMsg) => {
    shownOpMsg.value = opMsg
}

const refreshTrainInfoTimer = setInterval(() => {
    updateCurrentTrains()

    // Change shown operation message automatically
    const opMsgs = operationMsgs.value
    if (opMsgs.length > 0 && curOpMsgId.value) {
        if (shownOpMsg.value) {
            return
        }
        const index = opMsgs.findIndex(it => it.id === curOpMsgId.value)
        if (index !== -1) {
            const nextIndex = (index + 1) % opMsgs.length
            curOpMsgId.value = opMsgs[nextIndex].id
        } else {
            curOpMsgId.value = opMsgs[0].id
        }
    }
}, 10000)

//clean refresh train info timer
onBeforeUnmount(() => {
    clearInterval(refreshTrainInfoTimer)
})

const currentStationId = ref(null)
const currentLineId = ref(null)

function init() {
    handleChangeStation(props.currentStationIdProp, props.currentLineIdProp, "init")
}

const loadOperationMsg = (stationId) => {
    if (!props.enableOpMsg) {
        return
    }
    store.dispatch('realtime/getStationOpMsg', {stationId}).then(r => {
        if (!checkIsChanged(stationId)) {
            if (r && r.length > 0) {
                operationMsgs.value = r
                curOpMsgId.value = r[0].id
            }
        }
    }).catch(e => {
        operationMsgs.value = []
    })
}

const handleChangeStation = (stationId, lineId, source) => {
    trainInfoMap.value = new Map()
    allTrains.value = []
    loadOperationMsg(stationId)
    changeStation(stationId, lineId).then(station => {
        if (checkIsChanged(stationId)) {
            return
        }
        currentStation.value = station
        currentStationId.value = station.id

        // 外部连接车站（出站换乘）
        const externalIds = station?.extra?.externalStations
        if (externalIds instanceof Array) {
            const promises = externalIds.map(it => store.dispatch('railsystem/getStation', {stationId: it}))
            Promise.all(promises).then(r => {
                if (!checkIsChanged(stationId)) {
                    externalStations.value = r
                }
            })
        } else {
            externalStations.value = []
        }

        updateCurrentTrains(true)
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
        console.warn(`Load station error, cannot get station info. stationId:${stationId}`, station)
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
    const curStationIndex = _stations.findIndex(it => it.id === currentStationId.value)
    let station = _stations[curStationIndex + offset]
    let direction

    // 判断是否为环线
    if (currentLine.value?.extra?.isCircle) {
        if (curStationIndex + offset === -1) {
            station = _stations[_stations.length - 1]
            direction = '内环'
        } else if (curStationIndex + offset === _stations.length) {
            station = _stations[0]
            direction = '外环'
        }
        if (offset > 0) {
            direction = '外环'
        } else {
            direction = '内环'
        }
    }

    if (station !== undefined) {
        const newStation = Object.assign({}, station)
        if (direction) {
            newStation.direction = direction
        } else {
            newStation.direction = offset > 0
                ? _stations.slice(-1)[0].i18Name
                : _stations[0].i18Name
        }
        return newStation
    }
    return null
}

const nextStation = computed(() => calcRelativeStation(1))
const previousStation = computed(() => calcRelativeStation(-1))
const handleHoldOnLineIcon = (event, line) => {
    if (line && line.id) {
        lineStationsSelector.value.showSelector({
            position: {
                x: event.position?.left,
                y: event.position?.top,
                height: 10,
            },
            lineProp: line,
            currentStationIdProp: currentStationId.value
        })
    }
}
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
    handleChangeStation(stationId, currentLineId.value, "watch currentStationId")
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
    min-height: 200px;
    max-height: 300px;
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

.text-container {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3; /* 显示的最大行数 */
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
