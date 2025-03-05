<template>
    <div style="background-color: var(--q-background);height: 100px; width: 100%;">
        <div v-if="depInfo&&arrInfo" style="height: 20px;padding-left: 10px;padding-right: 10px;padding-top: 2px;"
             class="row" @click="handleShowSolutionDetail">
            <div class="col-8">{{ depInfo.name }}
                <q-icon name="fa fa-arrow-right"></q-icon>
                {{ arrInfo.name }}
            </div>
            <div class="col-4" style="text-align: right;">
                <span
                    style="background-color: var(--q-primary);color: white;border-radius: 10px;display: inline-block;
                    text-align: center; width: 50px; margin-right: 4px;">
                    {{ formatToHHMM(arrInfo.arrTime) }}
                </span>
                <span>到达</span>
            </div>
        </div>
        <div v-if="!currentTrain&&nextTrain" class="row" style="height: 80px;">
            <div class="col-4"
                 style="display: flex;align-items: center;justify-content: center;border-right: 2px solid var(--q-primary-d);flex-direction: column;">
                <div>候车站</div>
                <span style="font-size: 24px;font-weight:bold;color: var(--q-primary-d);"
                      @click="showStationRealtime(nextTrain.depStationId)">
                    {{ nextTrain.depStationName }}
                </span>
            </div>
            <div class="col-8" style="padding-left: 10px;display: flex;justify-content: center;flex-direction: column;"
            >
                <div style="align-items: center;gap: 5px;display: flex;margin-bottom: 5px;">
                    <div
                        style="background-color: var(--q-next-station);border-radius: 8px;color: white;width: 60px;text-align: center;font-size: 16px;">
                        候车中
                    </div>
                    <div style="font-size: 16px;">{{ waitingTime }} 分钟内到站</div>
                </div>
                <div style="display: flex;" @click="showTrainInfoDetail(nextTrain.trainInfo)">
                    <TrainCategory :category="nextTrain.trainInfo.category"/>
                    <span>{{ nextTrain.terminal.stationName }}</span>
                </div>

            </div>
        </div>
        <div v-if="currentTrain" class="row" style="height: 80px;">
            <div class="col-4"
                 style="display: flex;align-items: center;justify-content: center;border-right: 2px solid var(--q-primary-d);flex-direction: column;">
                <div v-if="currentStation">当前到站</div>
                <div v-else>下一站</div>
                <div style="font-size: 24px;font-weight:bold;color: var(--q-primary-d);" v-if="currentStation"
                     @click="showStationRealtime(currentStation.stationId)">
                    {{ currentStation.stationName }}
                </div>
                <div style="font-size: 24px;font-weight:bold;color: var(--q-primary-d);"
                     v-if="nextStation&&!currentStation" @click="showStationRealtime(nextStation.stationId)">
                    {{ nextStation.stationName }}
                </div>
            </div>
            <div class="col-8" style="padding-left: 10px;display: flex;justify-content: center;flex-direction: column;"
            >
                <div style="align-items: center;gap: 5px;display: flex;margin-bottom: 5px;">
                    <div
                        style="background-color: var(--q-green);border-radius: 8px;color: white;width: 60px;text-align: center;font-size: 16px;">
                        乘车中
                    </div>
                    <div style="font-size: 16px;" v-html="getOffTime"></div>
                </div>
                <div style="display: flex;" @click="showTrainInfoDetail(currentTrain.trainInfo)">
                    <TrainCategory :category="currentTrain.trainInfo.category"/>
                    <span>{{ currentTrain.terminal.stationName }}</span>
                </div>

            </div>
        </div>
    </div>
</template>
<script setup>

import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import {useStore} from "vuex";
import {diff, formatToHHMM, getNowByTimezone,} from "src/utils/time-utils";
import TrainCategory from "components/TrainCategory.vue";
import {useRouter} from "vue-router";

const props = defineProps({
    solution: {
        type: Object
    }
})
const showSolutionDetail = ref(null)
const now = ref(null)
const depInfo = ref(null)
const arrInfo = ref(null)
const currentTrain = ref(null)
const nextTrain = ref(null)
const store = useStore()
const router = useRouter()
let timezone = null
let timeInterval
onMounted(() => {
    timeInterval = setInterval(() => {
        if (timezone) {
            now.value = getNowByTimezone(timezone)
            calcNextStop()
        }
    }, 10000)
    if (props.solution) {
        init()
    }
})
onBeforeUnmount(() => {
        clearInterval(timeInterval)
    }
)
const waitingTime = computed(() => {
    const _now = now.value
    if (nextTrain.value && _now) {
        return Math.ceil(diff(nextTrain.value.depTime, _now) / 60)
    }
    return null
})
const getOffTime = computed(() => {
    const _now = now.value
    if (currentTrain.value && _now) {
        const seconds = diff(currentTrain.value.arrTime, _now)
        const minutes = Math.ceil(seconds / 60)
        return `${minutes} 分钟后下车`
    }
    return null
})
const showTrainInfoDetail = (trainInfo) => {
    if (trainInfo && trainInfo.id) {
        store.commit('application/SET_SHOWN_TRAININFO', {trainInfo})
    }
}
const showStationRealtime = (stationId) => {
    console.log('sdd', stationId)
    if (stationId) {
        router.push({name: 'station-detail', params: {id: stationId}})
    }
}
const currentStation = computed(() => {
    const _now = now.value
    if (currentTrain.value && _now) {
        for (const stop of currentTrain.value.stops.slice(1)) {
            if (_now.isAfter(stop.arr) && _now.isBefore(stop.dep)) {
                return stop
            }
        }
    }
    return null
})
const nextStation = computed(() => {
    const _now = now.value
    if (currentTrain.value && _now) {
        for (const stop of currentTrain.value.stops.slice(1)) {
            if (_now.isBefore(stop.arr)) {
                return stop
            }
        }
    }
    return null
})
const calcNextStop = () => {
    const solution = props.solution
    if (!solution) return
    const now = getNowByTimezone(timezone)
    if (now.isAfter(solution.arrTime)) {
        clearUsingSolution()
        return
    }

    let _currentTrain = null
    for (const train of solution.trains) {
        if (now.isBefore(train.arrTime) && now.isAfter(train.depTime)) {
            _currentTrain = train
        }
        if (now.isBefore(train.depTime)) {
            nextTrain.value = train
            break
        }
    }
    currentTrain.value = _currentTrain
}

const clearUsingSolution = () => {
    currentTrain.value = null
    nextTrain.value = null
    store.commit('application/SET_USING_SOLUTION', null)
}

async function init() {
    const solution = props.solution
    store.dispatch('railsystem/getStation', {stationId: solution.depStationId}).then(s => {
        s.depTime = solution.depTime
        depInfo.value = s
        timezone = s.timezone
        now.value = getNowByTimezone(timezone)
    }).then(calcNextStop)

    store.dispatch('railsystem/getStation', {stationId: solution.arrStationId}).then(s => {
        s.arrTime = solution.arrTime
        arrInfo.value = s
    })
}

const handleShowSolutionDetail = () => {
    store.commit('application/SET_SHOWN_SOLUTION', {solution: props.solution})
}
const handleCloseDetail = () => {
    showSolutionDetail.value = null
}
</script>

<style scoped>

</style>
