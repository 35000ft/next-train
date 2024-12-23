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

const {t} = useI18n()
const props = defineProps({
    schedule: {
        type: Map,
        default: () => new Map()
    }
})
const horizontalSchedule = computed(() => {
    let _schedule = props.schedule
    if (!(_schedule instanceof Map)) {
        return []
    }
    if (_schedule.size === 0) {
        return []
    }
    Array.from(_schedule.entries())
        .map(item => {
            item[1].forEach(item => item.dataList.sort((o1, o2) => o1.depTime - o2.depTime))
            return {
                terminal: item[0],
                schedule: item[1]
            }
        })
    return []
})
const otherTerminals = ref([])
</script>
<style scoped>

</style>
