<template>
  <div class="row train-data border-bottom"
       style="padding-left: 4px;display: flex;justify-content: space-around">
    <div style="display: flex; align-items: center;text-align: left; ">
      <TrainStatusIndicator :arrive-mins="arriveMins" size="13px"/>
    </div>
    <div class="col-2" style="display: flex;align-items: center;">
      <div class="pill" :style="{backgroundColor:trainData.lineColor}">
        <span>{{ trainData.lineName }}</span>
      </div>
    </div>
    <div class="col-6 text-left text-bold" style="color: var(--q-normal);">
      {{ trainData.terminal }}
    </div>
    <div style="display: flex;align-items: center;justify-content: flex-end;">
      <div class="pill">
        <span>{{ formatToHHMM(trainData.dep) }}</span>
      </div>
    </div>
  </div>

</template>

<script setup>

import TrainStatusIndicator from "components/TrainStatusIndicator.vue";
import {useI18n} from "vue-i18n";
import {computed} from "vue";
import {diffFromNow, fixedMins, formatToHHMM} from "src/utils/time-utils";
import dayjs from "dayjs";
import {TRAIN_CATEGORY} from "src/models/Train";

const {t} = useI18n()
computed(() => {
  return ['LOCALE', 'THROUGH'].map(it => TRAIN_CATEGORY[it])
});
const props = defineProps({
  trainData: {
    type: Object,
    default: () => {
      return {
        id: 23,
        trainNo: "5101",
        arr: dayjs(new Date()).add(2, 'minute').toString(),
        dep: dayjs(new Date()).add(3, 'minute').toString(),
        terminal: "天隆寺",
        lineName: "1号线",
        lineColor: "#009ACE",
        direction: true,
      }
    }
  }
})
const arriveMins = computed(() => {
  let diffSeconds = diffFromNow(props.trainData.arr, 'second')
  return fixedMins(diffSeconds)
})
const terminalStation = computed(() => {
  const trainData = props.trainData
  const terminalStationId = trainData.schedules.slice(-1)[0].id
  return terminalStationId
})
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid #dcdcdc;
}

.train-data div {
  padding-bottom: 2px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-x: hidden;
  padding-top: 2px;
  margin-right: 2px;
}

.pill {
  height: 22px;
  font-size: 14px;
  padding: 0 5px;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--q-primary);
  border-radius: 5px;
}
</style>
