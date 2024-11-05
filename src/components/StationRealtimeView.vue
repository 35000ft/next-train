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
            <div class="direction-text">
              {{ t('directionShort') }} <b>{{ previousStation.direction }}</b>
            </div>
            <div>
              {{ previousStation.name }}
            </div>
          </div>
        </div>
        <div class="col-6 station-name-row" style="display: flex;align-items: center;justify-content: center;">
          <div class="tool-bar">
            <q-icon name="star"></q-icon>
            <q-icon name="departure_board"></q-icon>
            <q-icon name="map"></q-icon>
          </div>
          <div style="margin-top: 5px;" @click="handleClickStationName">
            <div class="text-h6 station-name-text current-station"
                 style="border-bottom: 1px solid var(--q-primary); margin-bottom: 5px;">
              {{ station.name }}
            </div>
            <div v-if="station.code" class="pill" style="margin: 0 auto">
              {{ station.code }}
            </div>
          </div>
        </div>
        <div class="col-3 station-name-row small text-right">
          <div v-if="nextStation!=null">
            <div style="font-size: 25px;margin-bottom: 15px;overflow: hidden">
              <i class="fa-solid fa-arrow-right"></i>
            </div>
            <div class="direction-text">
              {{ t('directionShort') }} <b>{{ nextStation.direction }}</b>
            </div>
            <div>
              {{ nextStation.name }}
            </div>
          </div>
        </div>
      </div>
      <q-separator color="primary" size="2px" style="margin: 0 0 10px;"/>
      <div v-if="currentLine" class="col-12" style="overflow-x: scroll;white-space: nowrap;margin-bottom: 5px;"
           @touchstart="handleTouchLineIconRegionStart" ref="lineIconRegion">
        <LineIcon class="line-icon" v-show="currentStation.lines.length>1" :line="{
          name:t('all'),
          color:'#36598f'
        }" @click="handleClickLineIcon('all')" :disabled="currentLineCode!=='all'"/>
        <LineIcon v-for="line in currentStation.lines" :line="line" :key="line.id"
                  @click="handleClickLineIcon(line)"
                  :disabled="currentLineCode==='all'||line.code!==currentLine.code" class="line-icon"/>
      </div>
      <q-tab-panels class="train-data-wrapper" v-model="currentLineCode" @touchstart="handleTouchTrainDataRegionStart"
                    style="overflow-y: auto;height: 57%;"
                    swipeable animated infinite>
        <q-tab-panel v-if="currentStation.lines.length>1" name="all"
                     style="padding-left: 0;padding-right: 0;padding-top: 0;">
          <div class="realtime-info-wrapper text-left">
            <TrainDataItemForAll/>
            <TrainDataItemForAll/>
            <TrainDataItemForAll/>
          </div>
        </q-tab-panel>
        <q-tab-panel v-for="line in currentStation.lines" :name="line.code" :key="line.id" v-scroll-to-view
                     style="padding-left: 0;padding-right: 0;padding-top: 0;">

          <div class="realtime-info-wrapper text-left">
            <q-expansion-item expand-separator default-opened popup>
              <template v-slot:header>
                <div class="border-bottom" style="width: 100%;">
                  <span class="direction-text"><i>八卦洲大桥南</i> {{ t('direction') }}</span>
                </div>
              </template>
              <TrainDataItem/>
              <TrainDataItem/>
              <TrainDataItem/>
            </q-expansion-item>
          </div>
          <div class="realtime-info-wrapper text-left">
            <q-expansion-item expand-separator default-opened popup>
              <template v-slot:header>
                <div class="border-bottom" style="width: 100%;">
                  <span class="direction-text"><i>八卦洲大桥南</i> {{ t('direction') }}</span>
                </div>
              </template>
              <TrainDataItem/>
              <TrainDataItem/>
              <TrainDataItem/>
            </q-expansion-item>
          </div>

        </q-tab-panel>
      </q-tab-panels>
    </q-tab-panel>

  </q-tab-panels>

  <station-selector ref="stationSelector"/>
</template>

<script setup>
import {computed, onMounted, ref, toRaw, watch} from "vue";
import LineIcon from "components/LineIcon.vue";
import TrainDataItem from "components/TrainDataItem.vue";
import {useI18n} from "vue-i18n";
import TrainDataItemForAll from "components/TrainDataItemForAll.vue";
import StationSelector from "components/StationSelector.vue";

const {t} = useI18n()

const stations = [{
  id: 2132,
  name: "南京站",
  secName: "Nanjing Railway Station",
  code: "NJS",
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
const lineIconRegion = ref(null)
const stationSelector = ref(null)
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

const handleTouchTrainDataRegionStart = (event) => {
  if (currentStation.value.lines.length > 1) {
    event.stopPropagation();
  }
}

const handleClickStationName = (event) => {
  stationSelector.value.showSelector()
}

const handleTouchLineIconRegionStart = (event) => {
  const dom = toRaw(lineIconRegion.value)[0]
  if (!dom) {
    return
  }
  const clientWidth = dom.clientWidth
  const scrollWidth = dom.scrollWidth
  if (scrollWidth > clientWidth) {
    event.stopPropagation();
  }
}
onMounted(() => {
  init()
});

const isLoading = ref(true)

const currentLine = computed(() => {
  if (currentLineCode.value === 'all') {
    return currentLine.value
  }
  return currentStation.value.lines.find(it => it.code === currentLineCode.value)
})

function getStation(offset) {
  if (currentStation.value == null) {
    return null;
  }
  const number = stations.indexOf(currentStation.value);
  const station = stations[number + offset];

  if (station === undefined) return null;

  const newStation = Object.assign({}, station);
  newStation.direction = offset > 0
    ? stations.slice(-1)[0].name
    : stations[0].name;
  return newStation;
}

const nextStation = computed(() => getStation(1))
const previousStation = computed(() => getStation(-1))

const handleClickLineIcon = (line) => {
  if (line === 'all') {
    currentLineCode.value = 'all'
    return
  }
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
  color: var(--q-primary);
  font-weight: bold;
  text-align: center;
  overflow-x: auto;
  white-space: nowrap;
  width: fit-content;
  justify-self: center;
}

.q-tab-panel {
  padding: 5px 10px;
}

.train-data-wrapper .q-tab-panel {
  overflow-y: scroll;
  height: 100%;
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

.line-icon {
  margin-right: 8px;
}

.realtime-info-wrapper {
  font-size: 16px;
  display: block;
  width: 100%;
}

.border-bottom {
  border-bottom: 1px solid #dcdcdc;
  display: flex;
  align-items: center;
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
  font-weight: bold;
  font-size: 18px;
}

.station-name-row .direction-text {
  margin-bottom: 2px;
}

.pill {
  justify-self: center;
  height: 20px;
  font-size: 14px;
  padding: 0 10px;
  display: flex;
  width: fit-content;
  color: var(--q-primary);
  font-weight: bold;
  justify-content: center;
  align-items: center;
  border: 2px solid var(--q-primary);
  border-radius: 10px;
}

.tool-bar {
  height: 20px;
  overflow-x: auto;
  background-color: var(--q-primary);
  width: 50%;
  position: absolute;
  top: 0;
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.tool-bar .q-icon {
  color: #ffffff;
}

::v-deep .q-item {
  padding: 0;
  max-height: 40px;
}

::v-deep .q-expansion-item--popup .q-expansion-item__container {
  border: none;
}

::v-deep .q-expansion-item--popup.q-expansion-item--expanded {
  padding-top: 0;
  padding-bottom: 0;
}
</style>
