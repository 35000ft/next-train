<template>
    <bottom-modal :display="display" @close="handleCloseSelector" content-height="90vh" content-width="100%"
                  :after-close="afterClose"
                  :is-use-route="isFromUrl"
                  @touchstart.stop name="train-info-detail">
        <template v-slot:default>
            <div>
                <div class="wrapper">
                    <div class="header" :style="{backgroundColor:primaryColor}">
                        <!-- TODO 标题-->
                        <span style="color: #ffffff;padding-left: 20px;font-size: 15px;font-weight: bold;"></span>
                    </div>
                    <div class="row" style="height: 100px;">
                        <div class="col-6"
                             style="border-right: 2px solid var(--q-primary-d);height: 100%;align-items: center;display: flex;">
                            <div style="margin: 0 auto;width: 90%;">
                                <div>
                                    <TrainCategory v-if="trainInfo" :category="trainInfo.category"/>
                                    <q-skeleton v-else width="40px" height="20px"/>
                                </div>
                                <div style="display: flex;align-items: baseline;">
                                    <div class="auto-scroll-container"
                                         style="max-width: 95%;display: inline-block;margin-right: 4px;">
                                        <span v-overflow-auto-scroll v-if="trainInfo"
                                              style="font-weight:bold;color: var(--q-primary-d);font-size: 18px;">
                                                {{ terminal }}
                                        </span>
                                        <q-skeleton v-else type="text" width="120px" height="30px"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-6" style="align-items: center;display: flex;">
                            <div style="margin: 0 auto;width: 90%;" v-if="trainInfo">
                                <div style="color: var(--q-normal);">
                                    <span v-if="nextIndex===0">{{ t('waitingForDeparture') }}</span>
                                    <span v-else>{{ t('currentInterval') }}</span>
                                </div>
                                <div class="auto-scroll-container">
                                    <div v-overflow-auto-scroll>
                                        <span
                                            style="font-weight:bold;color: var(--q-primary-d);font-size: 18px;"
                                            v-html="currentInterval">
                                    </span>
                                    </div>
                                </div>
                            </div>
                            <div v-else style="margin: 0 auto;width: 90%;">
                                <q-skeleton width="100%" height="50px"/>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- schedule -->
                <div class="wrapper" style="padding-left: 10px;padding-right: 10px;">
                    <q-expansion-item expand-separator default-opened popup>
                        <template v-slot:header>
                            <div
                                style="width: 100%;display: flex;align-self: center;padding-left: 25px;font-size: 18px;font-weight:bold;color: var(--q-primary-d) ">
                                {{ t('trainSchedule') }}
                            </div>
                        </template>
                        <div
                            style="min-height: 100px;">
                            <!-- location tool -->
                            <transition name="tool-wrapper">
                                <span class="tool-wrapper" v-show="showLocationToolIcon"
                                      @click="handleLocate">
                                    <i class="fa-solid fa-location-crosshairs"></i>
                                 </span>
                            </transition>

                            <div class="stop-info-wrapper grey-border-bottom row"
                                 style="height: 40px; border-bottom: 2px solid var(--q-grey-2);font-weight:bold;">
                                <div class="col-4">{{ t('stopStationName') }}</div>
                                <div class="col-2"></div>
                                <div class="col-3">{{ t('arrTime') }}</div>
                                <div class="col-3">{{ t('depTime') }}</div>
                            </div>
                            <div class="scroll" style="max-height: 50vh;" ref="stopInfoListView" v-if="trainInfo">
                                <div class="stop-info-wrapper row" v-for="stop in schedule"
                                     style="font-size: 18px;font-weight:bold;"
                                     :style="{height:STOP_ROW_HEIGHT+'px'}"
                                     :class="stop.statusClass||'ontime'"
                                     :key="stop.stationId">
                                    <div class="col-4 grey-border-bottom">
                                    <span class="show-text-in-2-line station-name"
                                          @click="handleClickStationName(stop.stationId)">
                                        {{ stop.stationName }}
                                    </span>
                                    </div>
                                    <div class="col-2"
                                         style="height: 100%;display: flex;justify-content: center;">
                                        <span style="height: 100%; flex: 1;" class="grey-border-bottom"></span>
                                        <span
                                            class="line-segment"
                                            style="height: 100%;width: 10px;display: block;position: relative;"
                                            :style="stop.lineStyle||{}"
                                        >
                                        <span class="circle"></span>
                                    </span>
                                        <span style="height: 100%; flex: 1;" class="grey-border-bottom"></span>
                                    </div>
                                    <div class="col-3 grey-border-bottom dep-arr-time">
                                        {{ stop.arrStr }}
                                    </div>
                                    <div class="col-3 grey-border-bottom dep-arr-time">
                                        {{ stop.depStr }}
                                    </div>
                                </div>
                            </div>
                            <div v-else class="scroll" style="max-height: 50vh;">
                                <q-skeleton height="100px" width="100%" type="text"/>
                                <q-skeleton height="100px" width="100%" type="text"/>
                                <q-skeleton height="100px" width="100%" type="text"/>
                                <q-skeleton height="100px" width="100%" type="text"/>
                            </div>
                        </div>
                    </q-expansion-item>
                </div>
            </div>
        </template>
    </bottom-modal>
</template>

<script setup>
import BottomModal from "components/BottomModal.vue";
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import {useStore} from "vuex";
import {useRoute, useRouter} from "vue-router";
import {useQuasar} from "quasar";
import TrainCategory from "components/TrainCategory.vue";
import {TRAIN_STATUS} from "src/models/Train";
import {diffFromNowFormatted, formatToHHMM, isAfterNow, isBeforeNow, TIME_FORMATS} from "src/utils/time-utils";
import {smoothScroll} from "src/utils/dom-utils";
import {useI18n} from "vue-i18n";
import _ from 'lodash';

const primaryColor = computed(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--q-primary').trim()
})
const shownTrainInfo = computed(() => {
    return store.getters['application/shownTrainInfo']
})
const isFromUrl = ref(false)
const isUpdatingStopStatus = ref(false)
const store = useStore()
const loading = ref(false)
const trainInfoId = ref(null)
const display = ref(false)
const route = useRoute()
const router = useRouter()
const trainInfo = ref(null)
const trainDate = ref(null)

const currentInterval = computed(() => {
    const _schedule = schedule.value
    const _nextIndex = nextIndex.value
    const _currentIndex = currentIndex.value
    if (_currentIndex === _schedule.length - 1) {
        return `<span style="color: var(--q-arrived)">${t('trainHasArrivedAtTerm')}</span>`
    }
    if (_schedule && _nextIndex && _nextIndex > 0) {
        const currentStop = _schedule[_nextIndex - 1]
        const nextStop = _schedule[_nextIndex]
        if (isAfterNow(currentStop.dep)) {
            return `<span style="color: var(--q-arrived)">${currentStop.stationName}</span> ~ <span style="color:var(--q-ontime);">${nextStop.stationName}</span>`
        } else {
            return `<span style="color: var(--q-grey-3)">${currentStop.stationName}</span> ~ <span style="color:var(--q-next-station);">${nextStop.stationName}</span>`
        }
    } else if (_schedule && _nextIndex === 0) {
        const remainTime = diffFromNowFormatted(_schedule[0].arr, {
            $hour: t('time.hour'),
            $minute: t('time.minute'),
            $second: t('time.second'),
        }, 'hm')
        if (remainTime.totalSeconds <= 30) {
            return t('trainStatus.arriveSoon')
        }
        return t('arriveIn').replace('$remain', remainTime.str)
    } else {
        return '--'
    }
})
const schedule = computed(() => {
    if (trainInfo.value) {
        return calcSchedule(trainInfo.value)
    }
    return []
})
const calcSchedule = (_trainInfo) => {
    if (_trainInfo) {
        const _schedule = _trainInfo.schedule
        const trainVia = _trainInfo.trainVia
        let reduce = trainVia.reduce((acc, cur) => {
            for (let i = cur.fromIndex; i <= cur.toIndex; i++) {
                acc.set(i, cur.lineId)
            }
            return acc
        }, new Map());
        _schedule.forEach(((it, index) => {
            it.lineId = reduce.get(index)
            it.arrStr = formatToHHMM(it.arr.toDate())
            it.depStr = formatToHHMM(it.dep.toDate())
        }))
        _schedule[_schedule.length - 1].depStr = '--:--'
        return _schedule
    }
    return []
}
const {t} = useI18n()
const STOP_ROW_HEIGHT = 80
const isFirst = ref(true)
const nextIndex = ref(null)
const currentIndex = ref(null)
const stopInfoListView = ref(null)
const updateStatusInterval = ref(null)
watch(schedule, (newValue, oldValue) => {
    if (newValue) {
        updateStopStatus(newValue)
    }
})
const scrollToCurrent = (instantly = true) => {
    const dom = stopInfoListView.value
    if (!dom) {
        return
    }
    if (dom.scrollHeight <= dom.clientHeight) {
        return
    }
    const target = (nextIndex.value * STOP_ROW_HEIGHT)
    if (instantly) {
        stopInfoListView.value.scrollTop = target
    } else {
        smoothScroll(dom, target, 600)
    }
}
const updateStopStatus = (_schedule) => {
    if (!_schedule || isUpdatingStopStatus.value || _schedule.length === 0) {
        return
    }
    let nextIndexValue = null
    let currentIndexValue = null
    isUpdatingStopStatus.value = true
    try {
        for (let index = 0; index < _schedule.length; index++) {
            const _stopInfo = _schedule[index]
            if (isBeforeNow(_stopInfo.arr)) {
                if (isAfterNow(_stopInfo.dep)) {
                    currentIndexValue = index
                    if (index < _schedule.length - 1) {
                        nextIndexValue = index + 1
                    }
                    break
                }
            } else {
                currentIndexValue = null
                if (index === 0) {
                    nextIndexValue = 0
                    break
                }

                const previousStop = _schedule[index - 1]
                if (isBeforeNow(previousStop.dep)) {
                    nextIndexValue = index
                    break
                }
            }
        }
        if (nextIndexValue >= 0) {
            for (let i = 0; i < nextIndexValue; i++) {
                const stopInfo = _schedule[i]
                if (stopInfo.statusClass !== TRAIN_STATUS.DEPARTED.code) {
                    _schedule[i].statusClass = TRAIN_STATUS.DEPARTED.code
                    _schedule[i].lineStyle = {
                        backgroundColor: 'var(--q-grey-2)',
                        borderBottom: `2px solid var(--q-grey-2)`
                    }
                }
            }
            for (let i = nextIndexValue + 1; i < _schedule.length; i++) {
                const stopInfo = _schedule[i]
                const _line = store.getters["railsystem/lines"].get(stopInfo.lineId)
                if (stopInfo.statusClass !== TRAIN_STATUS.ONTIME.code) {
                    _schedule[i].statusClass = TRAIN_STATUS.ONTIME.code
                    _schedule[i].lineStyle = {
                        backgroundColor: _line.color || 'var(--q-primary)',
                        borderBottom: '2px solid ' + (_line.color || 'var(--q-primary)')
                    }
                }
            }

            const stopInfo = _schedule[nextIndexValue]
            const _line = store.getters["railsystem/lines"].get(stopInfo.lineId)
            _schedule[nextIndexValue].statusClass = 'next-station'
            _schedule[nextIndexValue].lineStyle = {
                backgroundColor: _line.color || 'var(--q-primary)',
                borderBottom: '2px solid ' + (_line.color || 'var(--q-primary)')
            }

            if (!currentIndexValue && nextIndexValue > 0) {
                _schedule[nextIndexValue - 1].statusClass = TRAIN_STATUS.DEPARTED.code
                _schedule[nextIndexValue - 1].lineStyle = {
                    backgroundColor: 'var(--q-grey-2)',
                    borderBottom: `2px solid var(--q-grey-2)`
                }
            }

        }
        if (currentIndexValue) {
            const stopInfo = _schedule[currentIndexValue]
            if (stopInfo) {
                const _line = store.getters["railsystem/lines"].get(stopInfo.lineId)
                _schedule[currentIndexValue].statusClass = TRAIN_STATUS.ARRIVED.code
                _schedule[currentIndexValue].lineStyle = {
                    backgroundColor: _line.color || 'var(--q-primary)',
                    borderBottom: '2px solid ' + (_line.color || 'var(--q-primary)')
                }
            }
        }
        currentIndex.value = currentIndexValue
        nextIndex.value = nextIndexValue
    } finally {
        isUpdatingStopStatus.value = false
    }

    if (isFirst.value) {
        setTimeout(() => {
            scrollToCurrent()
            isFirst.value = false
        }, 100)
    }
}
const scrollTop = ref(0)
const showLocationToolIcon = computed(() => {
    const dom = stopInfoListView.value
    const _currentIndex = currentIndex.value || (nextIndex.value - 1)
    const _scrollTop = scrollTop.value
    if (dom && _currentIndex) {
        if (dom.scrollHeight <= dom.clientHeight) {
            return false
        }
        const currentStopHeight = _currentIndex * STOP_ROW_HEIGHT
        if (currentStopHeight > _scrollTop + dom.clientHeight) {
            return true
        }
        if (_scrollTop > currentStopHeight + STOP_ROW_HEIGHT) {
            return true
        }
        return false
    }
    return false
})
const handleLocate = () => {
    scrollToCurrent(false)
}
const terminal = computed(() => {
    if (trainInfo.value && trainInfo.value.schedule.length > 0) {
        return trainInfo.value.schedule.slice(-1)[0].stationName
    }
    return "--"
})
const $q = useQuasar()
let prefix = null
onMounted(() => {
    if (route.params.id && route.params.prefix) {
        isFromUrl.value = true
        trainInfoId.value = route.params.id
        trainDate.value = store.getters['application/getNowTime'].format(TIME_FORMATS.DATE)
        if (route.params.prefix === '') {
            prefix = '/'
        } else {
            prefix = '/' + route.params.prefix.join('/')
        }
    }
    updateStatusInterval.value = setInterval(() => updateStopStatus(schedule.value), 5000)
})
onUnmounted(() => {
    if (updateStatusInterval.value) {
        clearInterval(updateStatusInterval.value)
    }
})
watch(stopInfoListView, (newVal, oldValue) => {
    if (newVal) {
        stopInfoListView.value.addEventListener('scroll', _.debounce(() => {
            scrollTop.value = stopInfoListView.value.scrollTop
        }, 300))
    }
})

watch(() => shownTrainInfo.value, (newVal, oldValue) => {
    console.log('shownTrainInfo change', newVal)
    if (newVal) {
        if (newVal.id !== trainInfoId.value) {
            trainInfoId.value = newVal.id
            trainDate.value = newVal.trainDate
        }
    }
})

async function loadTrainInfo(_trainInfoId, trainDate) {
    if (loading.value || !_trainInfoId) {
        return
    }
    loading.value = true
    return store.dispatch('realtime/getTrainInfoById', {
        trainInfoId: _trainInfoId,
        date: trainDate
    }).then(_trainInfo => {
        return _trainInfo
    }).catch(err => {
        console.warn('loadTrainInfo err:', err)
        $q.notify.error(`Failed to get train info`)
        return Promise.reject(err)
    }).finally(_ => {
        if (trainInfoId.value === _trainInfoId) {
            loading.value = false
        }
    })
}

watch(trainInfoId, (newVal, oldValue) => {
    if (newVal) {
        show()
        isFirst.value = true
        loadTrainInfo(newVal).then(res => {
            setTimeout(() => {
                trainInfo.value = res
            }, 100)
        })
    }
})

const handleClickStationName = (_stationId) => {
    if (_stationId) {
        store.dispatch('application/showStationRealtimeModal', {stationId: _stationId})
    }
}

const handleCloseSelector = () => {
    display.value = false
}

function afterClose() {
    if (isFromUrl.value) {
        if (prefix) {
            router.push(prefix)
        } else {
            router.push('/')
        }
    }
    isFromUrl.value = false
    store.commit('application/SET_SHOWN_TRAININFO', {trainInfo: null})
    emit('close')
}

const show = () => {
    display.value = true
}

</script>
<style scoped>
.wrapper {
    border-radius: 10px;
    margin-bottom: 20px;
    background-color: var(--q-background-grey-2);
}


.departed {
    .station-name {
        color: var(--q-grey-3);
    }

    .dep-arr-time {
        color: var(--q-grey-3);
    }

    .line-segment {
        background-color: var(--q-grey-2);
        border-bottom: 2px solid var(--q-grey-2);
    }
}

.arrived {
    .station-name {
        color: var(--q-arrived);
    }

    .dep-arr-time {
        color: var(--q-arrived);
    }
}

.ontime {
    color: #009A44;
}

.next-station {
    color: var(--q-next-station);

    .station-name {
        color: var(--q-next-station);
    }
}

.header {
    height: 30px;
    border-top-right-radius: 10px;
    border-top-left-radius: 10px;
    display: flex;
    align-items: center;
}

.stop-info-wrapper {
    background-color: var(--q-background);
    text-align: center;
    display: flex;
    justify-content: space-around;
}

.stop-info-wrapper div {
    height: 100%;
    align-items: center;
    display: flex;
    justify-content: center;
}

.circle {
    height: 10px;
    background: #ffffff;
    border-radius: 50%;
    position: absolute;
    width: 10px;
    top: 35px;
    left: 0
}

.station-name {
    color: var(--q-primary-d);
}

.grey-border-bottom {
    border-bottom: 2px solid var(--q-grey-2);
}

.tool-wrapper {
    color: var(--q-grey-3);
    border: 1px solid var(--q-grey);
    height: 20px;
    width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    position: absolute;
    right: 0;
    bottom: 40px;
    opacity: 50%;
    transition: 0.5s;
}

.tool-wrapper:active {
    opacity: 100%;
}

.tool-wrapper-enter-active {
    animation: tool-wrapper-transition .8s;
}

.tool-wrapper-leave-active {
    animation: tool-wrapper-transition .5s reverse;
}


@keyframes tool-wrapper-transition {
    from {
        opacity: 0;
    }
    to {
        opacity: 50%;
    }
}

</style>
