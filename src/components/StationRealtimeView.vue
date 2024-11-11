<template>
  <q-tab-panels v-cloak v-if="currentStationName" class="full-height" v-model="currentStationName" swipeable
                animated
                @touchstart.stop>
    <q-tab-panel v-for="station in currentLine.stations" :name="station.name" :key="station.id">
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
      <q-skeleton v-if="!currentLine" class="col-12" style="height: 25px;margin-bottom: 5px;"/>
      <div v-if="currentLine" class="col-12" style="overflow-x: scroll;white-space: nowrap;margin-bottom: 5px;"
           @touchstart="handleTouchLineIconRegionStart" ref="lineIconRegion">
        <LineIcon class="line-icon" v-show="currentStation.lines.length>1" :line="{
          name:t('all'),
          color:'#36598f'
        }" @click="handleClickLineIcon('all')" :disabled="currentLineId!=='all'"/>
        <LineIcon v-for="line in currentStation.lines" :line="line" :key="line.id"
                  @click="handleClickLineIcon(line)"
                  :disabled="currentLineId==='all'||line.id!==currentLine.id" class="line-icon">
        </LineIcon>
      </div>
      <q-pull-to-refresh @refresh="handleRefreshTrainData" @touchstart="handleTouchTrainDataRegionStart">
        <div style="overflow-y: auto;height: 57%;">
          <!--        <q-skeleton v-if="!currentTrains||currentTrains.length===0" square height="150px"/>-->
          <q-tab-panels class="train-data-wrapper" v-model="currentLineId"
                        swipeable animated infinite>
            <q-skeleton v-if="!currentTrains||currentTrains.length===0" square height="150px"/>
            <q-tab-panel v-if="currentStation.lines.length>1" name="all"
                         style="padding-left: 0;padding-right: 0;padding-top: 0;">
              <div class="realtime-info-wrapper text-left">
                <TrainDataItemForAll/>
                <TrainDataItemForAll/>
                <TrainDataItemForAll/>
              </div>
            </q-tab-panel>
            <q-tab-panel v-for="line in currentStation.lines" :name="line.id" :key="line.id" v-scroll-to-view
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
        </div>
      </q-pull-to-refresh>
    </q-tab-panel>


  </q-tab-panels>
  <line-stations-selector ref="lineStationsSelector"/>
  <station-selector ref="stationSelector"/>
</template>

<script setup>
import {computed, onMounted, ref, toRaw, watch} from "vue";
import LineIcon from "components/LineIcon.vue";
import TrainDataItem from "components/TrainDataItem.vue";
import {useI18n} from "vue-i18n";
import TrainDataItemForAll from "components/TrainDataItemForAll.vue";
import StationSelector from "components/StationSelector.vue";
import {useStore} from "vuex";
import {useQuasar} from "quasar";
import LineStationsSelector from "components/LineStationsSelector.vue";

const $q = useQuasar()
const {t} = useI18n()
const emit = defineEmits(['changeStation'])
const store = useStore()

const lineIconRegion = ref(null)
const stationSelector = ref(null)
const lineStationsSelector = ref(null)
const currentStation = ref(null)
const currentTrains = ref([])
const props = defineProps({
  currentStationIdProp: {
    type: String,
  },
  currentLineIdProp: {
    type: String,
  },
})
const stations = ref(null)
let currentStationName = ref(null)
let currentLineId = ref(null)

function init() {
  loadStationInfo(props.currentStationIdProp, props.currentLineIdProp).then(r => {
    console.log('load station info OK.')
  })
}

async function loadStationInfo(stationId, lineId) {
  isLoading.value = true
  const station = await store.dispatch('railsystem/getStation', stationId)
  if (!station || !(station.lines instanceof Array)) {
    console.warn('Change station error, cannot get station info. stationId:', station)
    isLoading.value = false
    return
  }
  let line
  if (typeof lineId === "string") {
    line = station.lines.find(it => it.id === lineId)
  }
  if (!line) {
    line = station.lines[0]
  }
  if (!line.stations) {
    line.stations = await store.dispatch('railsystem/getStationsByLine', line.id)
    stations.value = line.stations
  }
  currentStation.value = station
  currentStationName.value = station.name
  currentLineId.value = line.id
  isLoading.value = false
}

watch(currentLineId, (newValue, oldValue) => {
  console.log('line changed: new:', newValue)
  if (!newValue || currentLine.value.stations) {
    return
  }
  store.dispatch('railsystem/getStationsByLine', newValue).then(_stations => {
    if (_stations instanceof Array) {
      currentLine.value.stations = _stations
    } else {
      console.warn('load stations of line err! lineId:', newValue)
    }
  })
})

const handleRefreshTrainData = (done) => {
  setTimeout(() => {
    done()
    $q.notify.ok('列车数据已更新')
  }, 1000)
}

const handleTouchTrainDataRegionStart = (event) => {
  if (currentStation.value.lines.length > 1) {
    event.stopPropagation()
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
  if (currentLineId.value === 'all') {
    return currentLine.value
  }
  return currentStation.value.lines.find(it => it.id === currentLineId.value)
})

function calcRelativeStation(offset) {
  if (!currentLine.value || !currentLine.value.stations) {
    return null;
  }
  const _stations = currentLine.value.stations
  const number = _stations.indexOf(currentStation.value)
  const station = _stations[number + offset]

  if (station === undefined) return null;

  const newStation = Object.assign({}, station)
  newStation.direction = offset > 0
    ? _stations.slice(-1)[0].name
    : _stations[0].name;
  return newStation;
}

const nextStation = computed(() => calcRelativeStation(1))
const previousStation = computed(() => calcRelativeStation(-1))

const handleClickLineIcon = (line) => {
  if (line === 'all') {
    currentLineId.value = 'all'
    return
  }
  if (line && line.id) {
    if (currentLineId.value === line.id) {
      lineStationsSelector.value.showSelector(currentLine.value)
    } else {
      currentLineId.value = line.id
    }
  }
}

watch(currentStationName, () => {
  if (!currentStationName.value) {
    return
  }

  let line = currentStation.value.lines.find(it => it.id === currentLineId.value)
  if (!line) {
    currentLineId.value = currentStation.value.lines[0].id
  }
  emit('changeStation')
})

defineOptions({
  name: 'StationRealtimeView'
})
</script>
<style scoped>
.q-tab-panels {
  color: var(--q-primary-d);
  background-color: var(--q-background);
}


.station-name-text {
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
  font-weight: bold;
  justify-content: center;
  align-items: center;
  border: 2px solid var(--q-primary);
  border-radius: 10px;
}

.q-dark .pill {
  background-color: var(--q-primary);
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
