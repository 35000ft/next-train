<template>
  <q-tab-panels class="full-height" v-model="currentStationName" swipeable animated @touchstart.stop
                @update:model-value="updateCurrentStation">
    <q-tab-panel v-for="station in stations" :name="station.name" :key="station.id">
      <div class="row">
        <div class="col-3 station-name-row small text-left">
          <div v-if="previousStation!=null">
            <div style="font-size: 25px;margin-bottom: 15px;">
              <i class="fa-solid fa-arrow-left"></i>
            </div>
            <div>
              {{ previousStation.name }}
            </div>
            <div>
              {{ previousStation.enName }}
            </div>
          </div>
        </div>
        <div class="col-6 station-name-row">
          <div style="height: 20px;">
          </div>
          <div class="text-h5 station-name-text current-station">
            {{ station.name }}
          </div>
          <div class="station-name-text">
            {{ station.enName }}
          </div>
        </div>
        <div class="col-3 station-name-row small text-right">
          <div v-if="nextStation!=null">
            <div style="font-size: 25px;margin-bottom: 15px;">
              <i class="fa-solid fa-arrow-right"></i>
            </div>
            <div>
              {{ nextStation.name }}
            </div>
            <div>
              {{ nextStation.enName }}
            </div>
          </div>
        </div>
      </div>

      <q-separator color="primary" size="2px" style="margin: 0;"/>
    </q-tab-panel>
  </q-tab-panels>
</template>
<script setup>
import {computed, ref} from "vue";

const stations = [{
  id: 2132,
  name: "南京站",
  enName: "Nanjing Railway Station"
}, {
  id: 2131,
  name: "新模范马路",
  enName: "XINMOFANGMALU"
}, {
  id: 2130,
  name: "玄武门",
  enName: "XUANWUMEN"
}]
let currentStation = stations[0]
const currentStationName = ref(currentStation.name)

const currentLine = ref('home')

const nextStation = computed(() => {
  if (currentStation == null) {
    return null
  }
  let number = stations.indexOf(currentStation)
  if (stations[number + 1] === undefined) return null;
  return stations[number + 1]
})

const previousStation = computed(() => {
  if (currentStation == null) {
    return null
  }
  let number = stations.indexOf(currentStation)
  if (stations[number - 1] === undefined) return null;
  return stations[number - 1]
})

const updateCurrentStation = (stationName) => {
  console.log('update')
  currentStation = stations.find(it => it.name === stationName)
}
defineOptions({
  name: 'StationRealtimeView'
})
</script>
<style scoped>
.station-name-text {
  color: var(--q-secondary);
  font-weight: bold;
  text-align: center;
  overflow-x: auto;
  white-space: nowrap;
}

.q-tab-panel {
  padding: 5px 10px;
}

.station-name-row {
  padding-left: 3px;
  padding-right: 3px;
  height: 80px;
}

.small div {
  color: var(--q-secondary);
  font-size: 12px;
  line-height: 15px;
  white-space: nowrap;
  overflow-x: hidden; /* 超出内容隐藏 */
  text-overflow: ellipsis; /* 超出内容省略号 */
}
</style>
