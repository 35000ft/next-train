<template>
    <OverlayView name="StationScheduleDetail">
        <template v-slot:header-center>
            <div v-if="lineScheduleHeaders && lineScheduleHeaders.length>0">
                <q-btn-dropdown color="primary"
                                unelevated>
                    <template v-slot:label>
                        <div style="font-size: 18px;">{{ curDate.format('MM/DD · dddd') }}</div>
                    </template>
                    <q-list>
                        <q-item v-for="_date in selectableDates" :key="_date" clickable v-close-popup
                                style="padding-top: 0;padding-bottom: 0;min-height: 30px"
                                @click="handleChangeDate(_date)"
                                :class="_date===curDate?'current-date':''">
                            <q-item-section>
                                <q-item-label>
                                    {{ _date.format('MM/DD · dddd') }}
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-btn-dropdown>
            </div>
        </template>
        <template v-slot:default>
            <div style="position: relative;">
                <div class="toolbar-area-wrapper">
                    <div style="width: 50%;">
                    <span class="switch-schedule-format-wrapper">
                        <span class="vertical-icon layout-icon" :class="{'showing-icon':showVertical}">
                            <i class="fa fa-bars"></i>
                        </span>
                         <span class="horizontal-icon layout-icon" :class="{'showing-icon':!showVertical}">
                            <i class="fa fa-bars"></i>
                         </span>
                     </span>
                    </div>
                    <div style="text-align: right;width: 50%;">
                     <span class="download-icon-wrapper" style="color: var(--q-primary);font-size: 20px;"
                           @click="saveAsImg">
                        <i aria-hidden="true" class="fa fa-download"></i>
                    </span>
                    </div>
                </div>
                <div class="schedule-area-parent" ref="scheduleRef">
                    <div class="schedule-header-wrapper">
                        <div class="schedule-header-container row">
                            <div class="station-name-box col-12" v-if="station">{{ station.name }}</div>
                            <div v-else style="width: 100%;">
                                <q-skeleton height="30px" width="30%" style="margin-bottom: 3px;"></q-skeleton>
                            </div>
                            <div class="col-12" style="margin-bottom: 2px;">
                                <LineIcon style="margin-right: 3px;" v-if="line" :line="line" :font-size="'13px'"/>
                                <div v-else style="width: 100%;">
                                    <q-skeleton height="25px" width="50%"></q-skeleton>
                                </div>
                                <b style="color: var(--q-primary-d);">{{ t('trainSchedule') }}</b>
                            </div>

                            <div v-if="scheduleData" class="update-time-box col-12" style="color: var(--q-grey-3);">
                                {{ t('date') }}:<b>{{ scheduleData.date.format('YYYY-MM-DD dddd') }}</b>
                            </div>
                            <div v-if="!scheduleData&&loading" style="width: 100%;">
                                <q-skeleton height="18px" width="40%" style="margin-bottom: 4px;"></q-skeleton>
                            </div>
                            <div v-if="headerInfo" class="update-time-box col-12" style="color: var(--q-grey-3);">
                                <div>{{ t(`version`) }}:<b>{{ headerInfo.version }}</b></div>
                            </div>
                            <div v-if="!headerInfo&&loading" style="width: 100%;">
                                <q-skeleton height="18px" width="35%" style="margin-bottom: 3px;"></q-skeleton>
                            </div>
                            <div v-if="headerInfo" class="update-time-box col-12" style="color: var(--q-grey-3);">
                                <div>{{ headerInfo.executeDate }}</div>
                            </div>
                            <div v-if="!headerInfo&&loading" style="width: 100%;">
                                <q-skeleton height="18px" width="35%" style="margin-bottom: 3px;"></q-skeleton>
                            </div>
                        </div>
                    </div>
                    <div class="schedule-area-wrapper">
                        <HorizontalScheduleLayout v-if="scheduleData" :schedule-data="scheduleData"/>
                        <div v-if="!scheduleData&&loading" style="width: 100%;">
                            <q-skeleton height="60px" type="text"></q-skeleton>
                            <q-skeleton height="60px" type="text"></q-skeleton>
                            <q-skeleton height="60px" type="text"></q-skeleton>
                            <q-skeleton height="60px" type="text"></q-skeleton>
                            <q-skeleton height="60px" type="text"></q-skeleton>
                            <q-skeleton height="60px" type="text"></q-skeleton>
                        </div>
                        <div v-if="!scheduleData&&!loading"
                             style="display: flex;justify-content: center;">
                            <h5>{{ t('noAvailableSchedule') }}</h5>
                        </div>
                    </div>
                </div>
            </div>

        </template>
    </OverlayView>
</template>

<script setup>
import OverlayView from "components/OverlayView.vue";
import {computed, onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {fetchStationScheduleV2} from "src/apis/reailtime";
import {genBriefName} from "src/utils/string-utils";
import dayjs from "dayjs";
import {useStore} from "vuex";
import {useQuasar} from "quasar";
import LineIcon from "components/LineIcon.vue";
import {useI18n} from "vue-i18n";
import HorizontalScheduleLayout from "components/schedule-layouts/HorizontalScheduleLayout.vue";
import domtoimage from 'dom-to-image';
import {isTargetScheduleHeader, SCHEDULE_CATEGORY} from "src/models/Schedule";
import {formatWeekday, getToday, TIME_FORMATS} from "src/utils/time-utils";

const loading = ref(true)
const scheduleData = ref(null)
const showVertical = ref(false)
const station = ref(null)
const line = ref(null)
const {t} = useI18n()
const scheduleRef = ref(null)
const saveAsImg = () => {
    if (!scheduleData.value) {
        $q.notify.info('时刻表未加载完成')
        return
    }
    console.log("saving schedule as image")
    $q.notify.info(t("downloadingSchedule"))
    const scale = 3
    const domNode = scheduleRef.value
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
            a.download = `${station.value.name}-${line.value.name}_schedule`
            a.click()
        })
        .catch(error => {
            console.error(error)
        })
}
const route = useRoute()
const router = useRouter()
const store = useStore()
const lineScheduleHeaders = ref([])
const $q = useQuasar()
const selectableDates = ref(Array.from({length: 8}, (_, i) => dayjs().add(i - 1, 'day')))
const curDate = ref(selectableDates.value[1])
const curHeader = ref(null)
const headerInfo = computed(() => {
    const _curHeader = curHeader.value
    if (_curHeader) {
        const fromDate = dayjs(_curHeader.fromDate).format(TIME_FORMATS.DATE)
        const categoryStr = t(`scheduleCategory.${_curHeader.category}`) + t('schedule')
        const scheduleExecuteDate = t('scheduleExecuteDate').replace('$date', fromDate)
        if (_curHeader.category === SCHEDULE_CATEGORY.NORMAL.code) {
            return {
                version: categoryStr,
                executeDate: scheduleExecuteDate
            }
        }
        if (_curHeader.period) {
            const _categoryStr = `${categoryStr}·${formatWeekday(_curHeader.period)}`
            return {
                version: _categoryStr,
                executeDate: scheduleExecuteDate
            }
        } else if (_curHeader.specifiedDates && _curHeader.specifiedDates.length > 0) {
            const _scheduleExecuteDates = _curHeader.specifiedDates.map(it => dayjs(it)).map(it => it.format('L')).join(', ')
            return {
                version: categoryStr,
                executeDate: `${t('executeDates')}:${_scheduleExecuteDates}`
            }
        }
    }
    return null
})
onMounted(() => {
    const stationId = route.params.stationId
    const lineId = route.params.lineId
    init(stationId, lineId)
})

const changeSchedule = (_date) => {
    loading.value = true
    let change = false
    if (scheduleData.value) {
        change = true
        scheduleData.value = null
        $q.notify.info('正在切换时刻表')
    }
    const lineScheduleHeader = lineScheduleHeaders.value.find(it => isTargetScheduleHeader(it, _date))
    if (!lineScheduleHeader) {
        loading.value = false
        return
    }
    curHeader.value = lineScheduleHeader
    const _line = line.value
    const _station = station.value
    fetchStationScheduleV2(_station.id, lineScheduleHeader.scheduleId).then(_scheduleData => {
        if (line.value.id !== _line.id || _station.id !== station.value.id) {
            return
        }
        _scheduleData = processScheduleData(_scheduleData, _line)
        scheduleData.value = _scheduleData
        if (change) {
            $q.notify.ok('切换时刻表成功')
        }
    }).finally(_ => {
        loading.value = false
    })
}

async function init(stationId, lineId) {
    if (!stationId || !lineId) {
        return
    }
    loading.value = true
    try {
        store.dispatch('railsystem/getStation', {stationId}).then(_station => {
            station.value = _station
        }).catch(err => {
            $q.notify.error('No such station!', err)
            router.push('/')
        })
        const _line = await store.dispatch('railsystem/getLine', {lineId}).then(_line => {
            line.value = _line
            return _line
        }).catch(err => {
            $q.notify.error('No such line!', err)
            router.push('/')
        })
        store.dispatch('realtime/getLineScheduleHeaders', {lineId}).then(async _lineScheduleHeaders => {
            const railsystem = await store.dispatch('railsystem/getRailsystemByLineId', {lineId})
            const date = getToday(railsystem.timezone)
            lineScheduleHeaders.value = _lineScheduleHeaders
            changeSchedule(date)
        })
    } catch (err) {
        loading.value = false
    }

}

const processScheduleData = (scheduleData, _line) => {
    const rawSchedule = scheduleData.schedules || []
    scheduleData.date = dayjs(scheduleData.date || curDate.value.format(TIME_FORMATS.DATE))
    const ID_INDEX = 0
    const DEP_TIME_INDEX = 1
    const TRAIN_CATEGORY_INDEX = 2
    const shortTerminalStationIds = new Set()

    const lineTerminalStationIds = new Set([_line.stations[0].id, _line.stations.slice(-1)[0].id])
    rawSchedule.flat().flatMap(it => Object.entries(it)).map(it => {
        it[1] = it[1][0];
        return it[0]
    }).filter(it => !lineTerminalStationIds.has(it)).forEach(it => shortTerminalStationIds.add(it))
    const briefNameMap = new Map()
    for (let stationId of shortTerminalStationIds) {
        const station = scheduleData.stationMap[stationId]
        station.briefName = genBriefName(station.name, briefNameMap)
        briefNameMap.set(stationId, station)
    }
    scheduleData.schedules = rawSchedule.map(it => {
        for (let stationId of Object.keys(it)) {
            it[stationId] = it[stationId].map(trainInfo => {
                return {
                    id: trainInfo[ID_INDEX],
                    depTime: dayjs('2024-01-01T00:00:00').add(trainInfo[DEP_TIME_INDEX], "seconds"),
                    dayOffset: Math.floor(trainInfo[DEP_TIME_INDEX] / 86400),
                    categories: trainInfo[TRAIN_CATEGORY_INDEX],
                }
            })
        }
        return it
    })
    scheduleData.briefNameMap = briefNameMap
    return scheduleData
}

/**
 *
 * @param {dayjs.Dayjs}  _date
 */
const handleChangeDate = (_date) => {
    if (_date === curDate.value) return
    curDate.value = _date
    changeSchedule(_date)
}
</script>

<style scoped>
.schedule-area-parent {

}

.schedule-area-wrapper {
}

.schedule-header-container {
    background-color: var(--q-background);
}

.toolbar-area-wrapper {
    height: 40px;
    padding-left: 10px;
    padding-right: 10px;
    border-bottom: 1px solid var(--q-grey-2);
    display: flex;
    align-items: center;
}

.vertical-icon > i {
    transform: rotate(90deg);
}

.showing-icon {
    background-color: var(--q-primary);
    color: #ffffff;
}

.switch-schedule-format-wrapper {
    height: 20px;
    font-size: 16px;
    width: fit-content;
    border: 1px solid var(--q-primary);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    margin-top: 5px;
    color: #a6a6a6;
}

.layout-icon {
    height: 100%;
    padding-right: 4px;
    padding-left: 4px;
    display: flex;
    align-items: center;
}

.schedule-header-container div {
    display: flex;
    justify-content: center;
    align-items: center;
}

.station-name-box {
    font-size: 24px;
    color: var(--q-primary-d);
    font-weight: bold;
}

.current-date {
    font-weight: bold;
    color: var(--q-primary-d);
}
</style>
