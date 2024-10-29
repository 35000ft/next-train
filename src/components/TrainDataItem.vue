<template>
  <div class="row train-data border-bottom"
       style="padding-left: 4px;">
    <div style="display: flex; align-items: center;text-align: left; ">
      <TrainStatusIndicator size="25px"/>
    </div>
    <div class="col-10 text-left">
      八卦洲大桥南
    </div>
    <div class="col-4 text-left"
         style="height: 22px;font-size: 14px;padding: 0 1px;margin-bottom: 4px; color:#ffffff;background-color: var(--q-primary);border-radius: 5px;
display: flex;justify-content: center;align-items: center;">
      <q-icon name="alarm" style="font-size: 15px"/>
      <span>17:48</span>
    </div>
    <div class="col-4" style="height: 22px;font-size: 12px;padding: 0">
      17:48
    </div>
  </div>

</template>

<script setup>

import TrainStatusIndicator from "components/TrainStatusIndicator.vue";
import {useI18n} from "vue-i18n";
import {computed} from "vue";

const {t} = useI18n()
const props = defineProps({
  trainData: {
    type: Object,
    default: () => {
      return {
        id: 23
      }
    }
  }
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
</style>
