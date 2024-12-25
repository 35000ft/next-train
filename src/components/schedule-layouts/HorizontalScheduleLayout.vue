<template>
    <div class="horizontal-wrapper">
        <div style="height: 20px;background-color: #efefef;"></div>
        <div class="horizontal-item-wrapper" v-for="terminalData in horizontalSchedule" :key="terminalData.terminal">
            <div class="terminal-box" v-cloak>
                开往: <b><i> {{ terminalData.terminal }}</i></b>
            </div>
            <div class="hour-data-wrapper" v-for="hourData in terminalData.schedule" :key="hourData.hourStr">
                <span class="hour-box" v-cloak>{{ hourData.hourStr }}</span>
                <div class="minutes-wrapper">
                    <span :class="trainInfo.level" class="minute-wrapper"
                          v-cloak v-for="trainInfo in hourData.dataList" :key="trainInfo.showStr">
                                {{ trainInfo.showStr }}
                    </span>
                </div>
            </div>
        </div>
        <div class="legends-wrapper">
            <span class="legend-wrapper" v-cloak v-for="item in otherTerminals" :key="item">
                        {{ item.substring(0, 1) }}={{ item }}
            </span>
            <span class="legend-wrapper">
                <span class="minute-wrapper interval">15</span>区间车</span>
            <span class="legend-wrapper">
                <span class="minute-wrapper express">00</span>大站快车</span>
            <span class="legend-wrapper">
                <span class="minute-wrapper through">37</span>贯通(快)车</span>
        </div>

    </div>
</template>
<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import {TRAIN_CATEGORY} from 'src/models/Train'
import dayjs from "dayjs";

const {t} = useI18n()
const props = defineProps({
    scheduleData: {
        type: Object,
    }
})
const horizontalSchedule = computed(() => {
    const _scheduleData = props.scheduleData
    if (!_scheduleData) {
        return []
    }
    const _schedules = _scheduleData.schedules
    console.log('_sc', _schedules)
    const result = []
    for (let directionSchedule of _schedules) {
        const terminalStr = Object.keys(directionSchedule).map(it => _scheduleData.stationMap[it])
            .filter(it => typeof it === "object")
            .map(it => it.name)
            .join("/")
        let tempSchedules = []
        for (let stationId of Object.keys(directionSchedule)) {
            const briefName = _scheduleData.briefNameMap.has(stationId) ? _scheduleData.briefNameMap.get(stationId).briefName : null
            const t = directionSchedule[stationId].map(it => {
                const category = it.categories.findLast(c => c !== TRAIN_CATEGORY.INITIAL.code.toUpperCase()) || TRAIN_CATEGORY.LOCAL.code.toUpperCase
                const isFirst = it.categories.findIndex(c => c === TRAIN_CATEGORY.INITIAL.code.toUpperCase()) !== -1
                return {
                    id: it.id,
                    briefName,
                    category,
                    isFirst,
                    depTime: it.depTime,
                    dayOffset: it.dayOffset
                }
            })
            tempSchedules.push(t)
        }
        // tempSchedules = tempSchedules.flat()
        tempSchedules = tempSchedules.flat().sort((o1, o2) => o1.depTime - o2.depTime)
        tempSchedules = tempSchedules.reduce((acc, cur) => {
            const hour = cur.depTime.hour() + cur.dayOffset * 24;
            if (acc.has(hour)) {
                acc.get(hour).push(cur)
            } else {
                acc.set(hour, [cur])
            }
            return acc
        }, new Map())

        console.log('temps', tempSchedules)
        result.push({
            terminal: terminalStr,
            schedule: tempSchedules
        })
    }

    return []
})
const otherTerminals = ref([])
</script>
<style scoped>

</style>
