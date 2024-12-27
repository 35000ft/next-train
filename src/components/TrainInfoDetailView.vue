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
                                     :class="getStopStatus(stop.stationId)"
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
                                            style="height: 100%;width: 10px;display: block;position: relative;"
                                            :style="{backgroundColor:lineColorGetter(stop.lineId,stop.stationId),borderBottom:`2px solid ${lineColorGetter(stop.lineId,stop.stationId)}` }">
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

<script>
import BottomModal from "components/BottomModal.vue";
import {computed, defineComponent, onMounted, onUnmounted, ref, watch} from "vue";
import {useStore} from "vuex";
import {useRoute, useRouter} from "vue-router";
import {useQuasar} from "quasar";
import TrainCategory from "components/TrainCategory.vue";
import {TRAIN_STATUS} from "src/models/Train";
import {diffFromNowFormatted, formatToHHMM, isAfterNow, isBeforeNow} from "src/utils/time-utils";
import {smoothScroll} from "src/utils/dom-utils";
import {useI18n} from "vue-i18n";
import _ from 'lodash';

export default defineComponent({
    components: {TrainCategory, BottomModal},
    props: {
        trainInfoProp: {
            type: Object,
            default: null
        },
        trainInfoIdProp: {
            type: String
        },
        date: {
            type: String
        }
    },
    setup(props, {emit}) {
        const primaryColor = computed(() => {
            return getComputedStyle(document.documentElement).getPropertyValue('--q-primary').trim()
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
        const lineColorGetter = computed(() => {
            return (lineId, stationId) => {
                if (getStopStatus(stationId) === TRAIN_STATUS.DEPARTED.code) {
                    return 'var(--q-grey-2)'
                }
                const _line = store.getters["railsystem/lines"].get(lineId)
                if (_line) {
                    return _line.color
                } else {
                    store.dispatch('railsystem/getLine', {lineId})
                    return '#ffffff'
                }
            }
        })
        const currentInterval = computed(() => {
            const _schedule = schedule.value
            const _nextIndex = nextIndex.value
            const _currentIndex = currentIndex.value
            const _ = isUpdatingStopStatus.value
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
        const stopStatusMap = ref({})
        const nextIndex = ref(null)
        const currentIndex = ref(null)
        const stopInfoListView = ref(null)
        const updateStatusInterval = ref(null)
        const getStopStatus = (stationId) => {
            if (!schedule.value) {
                return TRAIN_STATUS.ONTIME.code
            }
            const className = stopStatusMap.value[stationId]
            if (className) {
                return className
            }

            return TRAIN_STATUS.ONTIME.code
        }
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
            let index = currentIndex.value || (nextIndex.value && nextIndex.value - 1)
            if (index < 0) index = 0
            if (!index) {
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
            if (!_schedule || isUpdatingStopStatus.value) {
                return
            }
            isUpdatingStopStatus.value = true
            try {
                for (let index = 0; index < _schedule.length; index++) {
                    const _stopInfo = _schedule[index]
                    if (isBeforeNow(_stopInfo.arr)) {
                        if (isAfterNow(_stopInfo.dep)) {
                            currentIndex.value = index
                            if (index < _schedule.length - 1) {
                                nextIndex.value = index + 1
                            }
                            break
                        }
                    } else {
                        currentIndex.value = null
                        if (index === 0) {
                            nextIndex.value = 0
                            break
                        }

                        const previousStop = _schedule[index - 1]
                        if (isBeforeNow(previousStop.dep)) {
                            nextIndex.value = index
                            break
                        }
                    }
                }

                if (nextIndex.value) {
                    _schedule.slice(0, nextIndex.value).forEach(stopInfo => {
                        stopStatusMap.value[stopInfo.stationId] = TRAIN_STATUS.DEPARTED.code
                    })
                    _schedule.slice(nextIndex.value).forEach(stopInfo => {
                        stopStatusMap.value[stopInfo.stationId] = TRAIN_STATUS.ONTIME.code
                    })
                }
                if (currentIndex.value) {
                    stopStatusMap.value[_schedule[currentIndex.value].stationId] = TRAIN_STATUS.ARRIVED.code
                }
                if (nextIndex.value) {
                    stopStatusMap.value[_schedule[nextIndex.value].stationId] = 'next-station'
                }
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
                if (route.params.prefix === '') {
                    prefix = '/'
                } else {
                    prefix = '/' + route.params.prefix.join('/')
                }
            }
            if (props.trainInfoProp) {
                trainInfo.value = props.trainInfoProp
            } else if (props.trainInfoIdProp) {
                trainInfoId.value = props.trainInfoIdProp
                if (props.date) {
                    trainDate.value = props.date
                } else {
                    store.getters['application/getNowTime']()
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

        watch(() => props.trainInfoIdProp, (newVal, oldValue) => {
            if (newVal !== trainInfoId.value) {
                trainInfoId.value = newVal;
            }
        })

        async function loadTrainInfo(_trainInfoId) {
            if (loading.value || !_trainInfoId) {
                return
            }
            loading.value = true
            return store.dispatch('realtime/getTrainInfoById', {
                trainInfoId: _trainInfoId,
                date: props.date
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
            emit('close')
        }

        const show = () => {
            display.value = true
        }

        return {
            handleCloseSelector,
            show,
            afterClose,
            handleLocate,
            handleClickStationName,
            getStopStatus,
            t,
            showLocationToolIcon,
            display,
            stopInfoListView,
            primaryColor,
            trainInfo,
            schedule,
            nextIndex,
            lineColorGetter,
            currentInterval,
            terminal,
            isFromUrl,
            STOP_ROW_HEIGHT
        }
    }

})
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
