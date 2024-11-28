<template>
    <div>
        <div v-if="station&&line">
            <div>
                <LineIcon :line="line"
                          @click="(event)=> handleClickLineIcon(event)"
                          :disabled="false" class="line-icon">
                </LineIcon>
            </div>
            <div v-if="showSkeleton">
                <q-skeleton height="40px" style="margin-bottom: 5px;"/>
                <q-skeleton height="30px" style="margin-bottom: 2px;"/>
                <q-skeleton height="30px" style="margin-bottom: 2px;"/>
                <q-skeleton height="30px" style="margin-bottom: 2px;"/>
            </div>
            <div class="realtime-info-wrapper text-left" v-for="directionTrainInfo in directionTrains"
                 :key="directionTrainInfo.direction">
                <q-expansion-item expand-separator default-opened popup>
                    <template v-slot:header>
                        <div class="border-bottom" style="width: 100%;">
                        <span class="direction-text">
                            <i>{{ directionTrainInfo.direction }}</i>
                            <span style="color: var(--q-normal);margin-left: 3px;">
                                {{ t('direction') }}
                            </span>
                        </span>
                        </div>
                    </template>
                    <div class="row train-data border-bottom"
                         v-if="!isLoadingTrains && (directionTrainInfo.trains&&directionTrainInfo.trains.length===0)"
                         style="padding-left: 4px; color: var(--q-normal);height: 40px;justify-content: center">
                        {{ t('noTrain') }}
                    </div>
                    <TrainDataItem v-for="_trainInfo in directionTrainInfo.trains"
                                   :key="_trainInfo.id"
                                   :station="station"
                                   @show-train-detail="showTrainInfoDetailView"
                                   :train-data="_trainInfo"/>
                </q-expansion-item>
            </div>
        </div>
        <train-info-detail-view :train-info-id-prop="showTrainInfoId" @close="handleCloseShowTrainDetail"/>
        <line-stations-selector :height="45" ref="lineStationsSelector" @select="handleSelectStation"/>
    </div>
</template>

<script setup>
import TrainDataItem from "components/TrainDataItem.vue";
import {computed, onMounted, onUnmounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {isNumber} from "src/utils/string-utils";
import TrainInfoDetailView from "components/TrainInfoDetailView.vue";
import {useStore} from "vuex";
import LineIcon from "components/LineIcon.vue";
import LineStationsSelector from "components/LineStationsSelector.vue";
import {useQuasar} from "quasar";

const props = defineProps({
    station: {
        type: Object
    },
    line: {
        type: Object
    },
})
const emit = defineEmits(['changeStation'])
const store = useStore()
const directionTrains = ref([])
const {t} = useI18n()
const showSkeleton = computed(() => {
    return isLoadingTrains.value
})
const isLoadingTrains = ref(true)
const showTrainInfoId = ref(null)
const lineStationsSelector = ref(null)
let updateTrainsTimer
onMounted(() => {
    loadLineTrains(props.line.id)
    updateTrainsTimer = setInterval(() => {
        loadLineTrains(props.line.id)
    }, 30000)
})
onUnmounted(() => {
    if (updateTrainsTimer) {
        clearInterval(updateTrainsTimer)
    }
})
const handleClickLineIcon = (event) => {
    const _line = props.line
    if (_line && _line.id) {
        lineStationsSelector.value.showSelector({
            position: event.target.getBoundingClientRect(),
            lineProp: _line,
            currentStationIdProp: props.station.id
        })
    }
}
const handleSelectStation = (stationId, lineId) => {
    if (stationId) {
        emit('changeStation', stationId, lineId)
    }
}
const showTrainInfoDetailView = (trainInfoId) => {
    if (isNumber(trainInfoId)) {
        showTrainInfoId.value = trainInfoId
    }
}

const $q = useQuasar()
const handleCloseShowTrainDetail = () => {
    showTrainInfoId.value = null
}

async function loadLineTrains(lineId) {
    if (!isNumber(lineId)) {
        return Promise.reject()
    }
    const stationId = props.station.id
    if (lineId && stationId) {
        isLoadingTrains.value = true
        return store.dispatch('realtime/getStationDirectionTrains', {stationId, lineId}).then(r => {
            directionTrains.value = r
        }).catch(err => {
            console.warn(`load trains err stationId:${stationId} lineId:${lineId} err:${err}`)
            $q.notify.error(`${t('load')} ${t('trainInfo')} ${t('error')}`)
        }).finally(_ => {
            isLoadingTrains.value = false
        })
    } else {
        return Promise.reject(`lineId or stationId is illegal lineId:${lineId} stationId:${stationId}`)
    }
}

</script>

<style scoped>
.direction-text {
    font-weight: bold;
    font-size: 18px;
    color: var(--q-primary-d);
}

.realtime-info-wrapper {
    font-size: 16px;
    display: block;
    width: 100%;
}

.train-data div {
    padding-bottom: 2px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow-x: hidden;
    padding-top: 2px;
    margin-right: 2px;
}

.border-bottom {
    border-bottom: 1px solid #dcdcdc;
    display: flex;
    align-items: center;
}
</style>
