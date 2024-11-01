<template>
  <div class="row train-data border-bottom"
       style="padding-left: 4px;">
    <div style="display: flex; align-items: center;text-align: left; ">
      <TrainStatusIndicator :arrive-mins="arriveMins" size="13px"/>
    </div>
    <div class="col-5 text-left">
      八卦洲大桥南
    </div>
    <div class="col-6" style="display: flex;align-items: center;justify-content: flex-end;">
      <div class="pill">
        <q-icon name="alarm" style="font-size: 15px;"/>
        <span>17:48</span>
      </div>

      <div class="pill" v-for="(trainCategory,index) in trainCategories" :key="index"
           :style="{backgroundColor:trainCategory.bgColor}">
        {{ t(`trainCategory.${trainCategory.code}`) }}
      </div>

    </div>
  </div>

</template>

<script setup>

import TrainStatusIndicator from "components/TrainStatusIndicator.vue";
import {useI18n} from "vue-i18n";
import {computed} from "vue";
import {diffFromNow, fixedMins} from "src/utils/time-utils";
import dayjs from "dayjs";
import {TRAIN_CATEGORY} from "src/models/Train";

const {t} = useI18n()
const trainCategories = computed(() => {
  return ['INITIAL', 'THROUGH'].map(it => TRAIN_CATEGORY[it])
})
const props = defineProps({
  trainData: {
    type: Object,
    default: () => {
      return {
        id: 23,
        trainNo: "5101",
        arr: dayjs(new Date()).add(4, 'minute').toString(),
        dep: dayjs(new Date()).add(3, 'minute').toString(),
        terminal: {
          id: 2344,
          name: "天隆寺",
          secName: "TIANLONGSI"
        },
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
