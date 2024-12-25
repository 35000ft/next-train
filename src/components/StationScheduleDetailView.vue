<template>
    <OverlayView>
        <template v-slot:header-center>
            <div>线路时刻表</div>
        </template>
        <template v-slot:default>
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
                     <span class="download-icon-wrapper" style="color: var(--q-primary);font-size: 20px;">
                        <i aria-hidden="true" class="fa fa-download"></i>
                    </span>
                </div>
            </div>
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
                        日期:<b>{{ scheduleData.date.format('YYYY-MM-DD dddd') }}</b>
                    </div>
                    <div v-else style="width: 100%;">
                        <q-skeleton height="18px" width="40%" style="margin-bottom: 4px;"></q-skeleton>
                    </div>
                    <div v-if="scheduleData" class="update-time-box col-12" style="color: var(--q-grey-3);">
                        版本:<b>{{ scheduleData.version }}</b>
                    </div>
                    <div v-else style="width: 100%;">
                        <q-skeleton height="18px" width="35%" style="margin-bottom: 3px;"></q-skeleton>
                    </div>
                </div>
            </div>
            <div class="schedule-area-wrapper">
                <HorizontalScheduleLayout v-if="scheduleData" :schedule-data="scheduleData"/>
                <div v-else style="width: 100%;">
                    <q-skeleton height="30px"></q-skeleton>
                    <q-skeleton height="30px"></q-skeleton>
                    <q-skeleton height="30px"></q-skeleton>
                    <q-skeleton height="30px"></q-skeleton>
                    <q-skeleton height="30px"></q-skeleton>
                </div>
            </div>

        </template>
    </OverlayView>
</template>

<script setup>
import OverlayView from "components/OverlayView.vue";
import {onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {fetchStationSchedule} from "src/apis/reailtime";
import {genBriefName} from "src/utils/string-utils";
import {TRAIN_CATEGORY} from "src/models/Train";
import dayjs from "dayjs";
import {useStore} from "vuex";
import {useQuasar} from "quasar";
import LineIcon from "components/LineIcon.vue";
import {useI18n} from "vue-i18n";
import HorizontalScheduleLayout from "components/schedule-layouts/HorizontalScheduleLayout.vue";

const loading = ref(true)
const scheduleData = ref(null)
const showVertical = ref(false)
const station = ref(null)
const line = ref(null)
const {t} = useI18n()
const saveAsImg = () => {
    console.log("saving schedule as image")
    const scale = 3
    // const domNode = this.$refs['station-schedule-wrapper']
    // domtoimage.toPng(domNode, {
    //     width: domNode.clientWidth * scale,
    //     height: domNode.clientHeight * scale,
    //     style: {
    //         transform: `scale(${scale})`,
    //         transformOrigin: 'top left'
    //     }
    // })
    //     .then(dataUrl => {
    //         let a = document.createElement('a')
    //         a.href = dataUrl
    //         a.download = `${this.station.name}-${this.line.name}时刻表`
    //         a.click()
    //     })
    //     .catch(error => {
    //         console.error(error)
    //     })
}
const route = useRoute()
const router = useRouter()
const store = useStore()
const $q = useQuasar()

onMounted(() => {
    const stationId = route.params.stationId
    const lineId = route.params.lineId
    init(stationId, lineId).then(d => {
        $q.notify.ok('Load schedule ok')
        setTimeout(() => {
            scheduleData.value = d
        }, 1000)
    }).catch(e => {
        //TODO
    })
})


async function init(stationId, lineId) {
    if (!stationId || !lineId) {
        return
    }
    try {
        loading.value = true
        store.dispatch('railsystem/getStation', {stationId}).then(_station => {
            station.value = _station
        }).catch(err => {
            $q.notify.error('No such station!')
            router.push('/')
        })
        store.dispatch('railsystem/getLine', {lineId}).then(_line => {
            line.value = _line
        }).catch(err => {
            $q.notify.error('No such line!')
            router.push('/')
        })
        const scheduleData = await fetchStationSchedule(stationId, lineId)
        const rawSchedule = scheduleData.schedules || []
        scheduleData.date = dayjs(scheduleData.date)
        const ID_INDEX = 0
        const DEP_TIME_INDEX = 1
        const TRAIN_CATEGORY_INDEX = 2
        const shortTerminalStationIds = new Set()

        rawSchedule.flat().flatMap(it => Object.entries(it)).map(it => {
            it[1] = it[1][0];
            return it
        }).filter(it => it[1][TRAIN_CATEGORY_INDEX].find(it2 => it2 !== TRAIN_CATEGORY.LOCAL.code.toUpperCase())
        ).map(it => it[0]).forEach(it => shortTerminalStationIds.add(it))

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
                        depTime: scheduleData.date.add(trainInfo[DEP_TIME_INDEX], "seconds"),
                        dayOffset: Math.floor(trainInfo[DEP_TIME_INDEX] / 86400),
                        categories: trainInfo[TRAIN_CATEGORY_INDEX],
                    }
                })
            }
            return it
        })
        scheduleData.briefNameMap = briefNameMap
        console.log('scd', scheduleData)
        return scheduleData
    } catch (e) {
        console.error('Load schedule err:', e)
        return Promise.reject()
    } finally {
        loading.value = false
    }
}

</script>

<style scoped>
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
</style>
