<template>
  <div class="row train-data border-bottom"
       style="padding-left: 4px;display: flex;justify-content: space-around">
    <div style="display: flex; align-items: center;text-align: left; ">
      <TrainStatusIndicator :arrive-mins="arriveMins" size="13px"/>
    </div>
    <div class="col-2" style="display: flex;align-items: center;">
      <span class="pill" :style="{backgroundColor:trainData.line.color}">
        {{ trainData.line.name }}
      </span>
    </div>
    <div class="col-6 text-left" style="color: var(--q-normal);">
      {{ trainData.terminal }}
    </div>
    <div style="display: flex;align-items: center;justify-content: flex-end;">
      <span class="pill">
        {{ formatToHHMM(trainData.dep) }}
      </span>
    </div>
  </div>

</template>

<script setup>

import TrainStatusIndicator from "components/TrainStatusIndicator.vue";
import {useI18n} from "vue-i18n";
import {computed} from "vue";
import {diffFromNow, fixedMins, formatToHHMM} from "src/utils/time-utils";
import {TRAIN_CATEGORY} from "src/models/Train";

const {t} = useI18n()
computed(() => {
  return ['LOCALE', 'THROUGH'].map(it => TRAIN_CATEGORY[it])
});
const props = defineProps({
  trainData: {
    type: Object,
  }
})
const arriveMins = computed(() => {
  let diffSeconds = diffFromNow(props.trainData.arr, 'second')
  return fixedMins(diffSeconds)
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
  text-align: center;
  padding-top: 0;
  padding-bottom: 0;
  min-width: 43px;
  margin-right: 3px;
  color: #ffffff;
  display: flex;
  justify-content: center;
  background-color: var(--q-primary);
  border-radius: 5px;
}
</style>
