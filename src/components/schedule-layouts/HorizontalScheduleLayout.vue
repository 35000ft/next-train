<template>
    <div class="horizontal-wrapper">
        <div style="height: 20px;background-color: #efefef;"></div>
        <div class="horizontal-item-wrapper" v-for="terminalData in horizontalSchedule" :key="terminalData.terminal">
            <div class="terminal-box" v-cloak>
                {{ t('trainTo') }}: <b><i> {{ terminalData.terminal }}</i></b>
            </div>
            <div class="hour-data-wrapper" v-for="hourData in terminalData.schedule" :key="hourData.hour">
                <span class="hour-box" v-cloak v-html="hourData.hourStr"></span>
                <div class="minutes-wrapper">
                    <span :class="calcStyleClass(trainInfo)" class="minute-wrapper"
                          v-for="trainInfo in hourData.dataList" :key="trainInfo.showStr">
                                {{ trainInfo.showStr }}
                    </span>
                </div>
            </div>
        </div>
        <div v-if="scheduleData.briefNameMap" class="legends-wrapper">
            <span class="legend-wrapper" v-for="item in scheduleData.briefNameMap.values()" :key="item.id">
                        {{ item.briefName }} = {{ item.name }}
            </span>
        </div>
        <div class="legends-wrapper">
            <span class="legend-wrapper">
                <span class="minute-wrapper first-stop">01</span>{{ t('trainCategory.initial') }}
            </span>
            <span class="legend-wrapper">
                <span class="minute-wrapper interval"
                      style="margin-right: 2px;">15</span>{{ t('trainCategory.short') }}
                </span>
            <span class="legend-wrapper">
                <span class="minute-wrapper express" style="margin-right: 2px;">00</span>
                {{ t('trainCategory.express') }}
            </span>
            <span class="legend-wrapper">
                <span class="minute-wrapper through" style="margin-right: 2px;">37</span>
                {{ t('trainCategory.through') }}
            </span>
        </div>

    </div>
</template>
<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {TRAIN_CATEGORY} from 'src/models/Train'
import {useStore} from "vuex";

const {t} = useI18n()
const store = useStore()
const currentLanguage = store.getters['language/currentLanguage']
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
                let depTime = it.depTime
                let dayOffset = it.dayOffset
                if (it.depTime.second() > 30) {
                    depTime = depTime.add(1, 'minute')
                    if (depTime.hour() === 0 && depTime.minute() === 0) {
                        // 跨日
                        dayOffset += 1
                    }
                }
                return {
                    id: it.id,
                    briefName,
                    category,
                    isFirst,
                    depTime,
                    dayOffset,
                    showStr: depTime.minute().toString().padStart(2, '0') + (briefName || "")
                }
            })
            tempSchedules.push(t)
        }
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
        tempSchedules = Array.from(tempSchedules.entries()).map(item => {
            return {
                hour: item[0],
                hourStr: formatHour(item[0]),
                dataList: item[1]
            }
        })
        result.push({
            terminal: terminalStr,
            schedule: tempSchedules
        })
    }
    return result
})
const formatHour = (hour) => {
    if (hour < 24) {
        if (currentLanguage.startsWith("zh") || currentLanguage.startsWith("ja")) {
            return hour + "时"
        }
        return hour
    }
    const dayOffset = Math.floor(hour / 24)
    hour = hour % 24
    if (dayOffset === 1) {
        if (currentLanguage.startsWith("zh")) {
            return '次日' + hour + '时'
        } else if (currentLanguage.startsWith("ja")) {
            return '翌日' + hour + '時'
        }
    }
    return `<span><span>${hour}</span><sup style="font-size: 10px">+${dayOffset}</sup></span>`
}
const calcStyleClass = (trainInfo) => {
    const classes = []
    if (trainInfo.category === TRAIN_CATEGORY.EXPRESS.code.toUpperCase()) {
        classes.push("express")
    } else if (trainInfo.category === TRAIN_CATEGORY.NONSTOP.code.toUpperCase()) {
        classes.push("express")
    } else if (trainInfo.category === TRAIN_CATEGORY.THROUGH.code.toUpperCase()) {
        classes.push("through")
    } else if (trainInfo.category === TRAIN_CATEGORY.SHORT.code.toUpperCase()) {
        classes.push("interval")
    }
    if (trainInfo.isFirst) {
        classes.push('first-stop')
    }
    return classes.join(' ')
}

</script>
<style scoped>
.first-stop {
    text-decoration: underline;
}

.express {
    background-color: #e37b00;
    color: white;
}

.through {
    background-color: #009844;
    color: white;
}

.interval {
    background-color: #36598f;
    color: white;
}

.legends-wrapper {
    display: flex;
    width: 80%;
    margin-top: 5px;
    flex-wrap: wrap;
}

.legend-wrapper {
    height: 25px;
    display: flex;
    align-items: center;
    margin-right: 10px;
    margin-bottom: 5px;
}

.minutes-wrapper > .minute-wrapper > .terminal-hint {
    color: #ffffff;
    display: block;
}

.minute-wrapper {
    width: 35px;
    float: left;
    line-height: 25px;
    position: relative;
    text-align: center;
}

.minutes-wrapper {
    flex: 1;
    background-color: #efefef;
}

.hour-box {
    width: 40px;
    text-align: center;
    font-size: 14px;
    padding-left: 3px;
    padding-right: 3px;
}

.hour-data-wrapper {
    display: flex;
    min-height: 25px;
    border-bottom: 1px solid #bebebe;
}

.terminal-box {
    color: #ffffff;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    padding-left: 10px;
    padding-top: 2px;
    padding-bottom: 2px;
    background-color: #36598f;
    font-size: 16px;
    border-bottom: 1px solid #dcdcdc;
}

.horizontal-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #efefef;
}

.horizontal-item-wrapper {
    width: 80%;
    border-radius: 6px;
    min-height: 50px;
    margin-bottom: 5px;
}

.hour-box {
    text-align: center;
    background: #dcdcdc;
    color: #132860;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}
</style>
