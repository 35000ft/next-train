<template>
  <q-tab-panels v-cloak v-if="currentStationName" class="full-height" v-model="currentStationName" swipeable
                animated
                @touchstart.stop>
    <q-tab-panel v-for="station in stations" :name="station.name" :key="station.id">
      <div class="row">
        <div class="col-3 station-name-row small text-left">
          <div v-if="previousStation!=null">
            <div style="font-size: 25px;margin-bottom: 15px;overflow: hidden">
              <i class="fa-solid fa-arrow-left"></i>
            </div>
            <div>
              {{ previousStation.name }}
            </div>
            <div>
              {{ previousStation.secName }}
            </div>
          </div>
        </div>
        <div class="col-6 station-name-row">
          <div style="height: 20px;overflow-x: auto;">
          </div>
          <div class="text-h5 station-name-text current-station">
            {{ station.name }}
          </div>
          <div class="station-name-text">
            {{ station.secName }}
          </div>
        </div>
        <div class="col-3 station-name-row small text-right">
          <div v-if="nextStation!=null">
            <div style="font-size: 25px;margin-bottom: 15px;overflow: hidden">
              <i class="fa-solid fa-arrow-right"></i>
            </div>
            <div>
              {{ nextStation.name }}
            </div>
            <div>
              {{ nextStation.secName }}
            </div>
          </div>
        </div>
      </div>
      <q-separator color="primary" size="2px" style="margin: 0 0 10px;"/>
      <div v-if="currentLine" class="col-12" style="overflow-x: auto;white-space: nowrap;" @touchstart.stop>
        <LineIcon v-for="line in currentStation.lines" :line="line" :key="line.id"
                  @click="handleClickLineIcon(line)"
                  :disabled="line.code!==currentLine.code" style="margin-right: 8px;"/>
      </div>
      <q-tab-panels v-model="currentLineCode" @touchstart="handleTouchStart"
                    swipeable animated infinite>
        <q-tab-panel v-for="line in currentStation.lines" :name="line.code" :key="line.id"
                     style="justify-content: space-between;display: flex;padding-left: 0;padding-right: 0;margin-top: 5px;">
          <div class="realtime-info-wrapper text-left">
            <div class="border-bottom">
              <span class="direction-text">八卦洲大桥南</span>
              {{ t('direction') }}
            </div>
            <TrainDataItem/>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-tab-panel>

  </q-tab-panels>
</template>
<script setup>
import {computed, onMounted, ref, watch} from "vue";
import LineIcon from "components/LineIcon.vue";
import TrainDataItem from "components/TrainDataItem.vue";
import {useI18n} from "vue-i18n";

const {t} = useI18n()

const stations = [{
  id: 2132,
  name: "南京站",
  secName: "Nanjing Railway Station",
  lines: [{
    name: "1号线",
    secName: "Line 1",
    code: "L1",
    color: "#009ACE"
  }, {
    name: "3号线",
    secName: "Line 3",
    code: "L3",
    color: "#009A44"
  },]
}, {
  id: 2131,
  name: "新模范马路",
  secName: "XINMOFANGMALU",
  lines: [{
    name: "1号线",
    secName: "Line 1",
    code: "L1",
    color: "#009ACE"
  }]
}, {
  id: 2130,
  name: "玄武门",
  secName: "XUANWUMEN",
  lines: [{
    name: "1号线",
    secName: "Line 1",
    code: "L1",
    color: "#009ACE"
  }]
}]

const props = defineProps({
  currentStationIdProp: {
    type: String,
    default: () => "121"
  },
  currentLineCodeProp: {
    type: String,
  },
})
let currentStationName = ref(null)
let currentLineCode = ref(null)

function init() {
  currentStationName.value = stations[0].name
  currentLineCode.value = currentStation.value.lines[0].code
}

const currentStation = computed(() => {
  return stations.find(it => it.name === currentStationName.value)
})

const handleTouchStart = (event) => {
  if (currentStation.value.lines.length > 1) {
    event.stopPropagation();
  }
}

onMounted(() => {
  init()
});

const isLoading = ref(true)

const currentLine = computed(() => {
  return currentStation.value.lines.find(it => it.code === currentLineCode.value)
})

const nextStation = computed(() => {
  if (currentStation.value == null) {
    return null
  }
  let number = stations.indexOf(currentStation.value)
  if (stations[number + 1] === undefined) return null;
  return stations[number + 1]
})

const previousStation = computed(() => {
  if (currentStation.value == null) {
    return null
  }
  let number = stations.indexOf(currentStation.value)
  if (stations[number - 1] === undefined) return null;
  return stations[number - 1]
})

const handleClickLineIcon = (line) => {
  if (line && line.code) {
    currentLineCode.value = line.code
  }
}

watch(currentStationName, () => {
  let find = currentStation.value.lines.indexOf(it => it.code === currentLineCode.value)
  if (find === -1) {
    currentLineCode.value = currentStation.value.lines[0].code
  }
})

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

.realtime-info-wrapper {
  font-size: 16px;
  display: inline-block;
  width: 100%;
}

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

.direction-text {
  color: var(--q-secondary);
  font-style: italic;
  font-weight: bold;
  font-size: 18px;
}
</style>
