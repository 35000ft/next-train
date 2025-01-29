<template>
    <OverlayView name="RouteSolutionDetailView" @close="handleClose" :manage-by-overlay="false">
        <template v-slot:default>
            <div v-if="solution && solution.trains" style="overflow-y: auto;height: 90vh;">
                <div v-for="(train,index) in solution.trains" :key="index">
                    <!-- TODO 出站换乘-->
                    <div class="transfer-info-wrapper"
                         v-if="train.outerTransfer">
                    </div>
                    <div class="train-wrapper">
                        <div class="station-name-wrapper">
                            <span class="station-name auto-scroll-container">
                                <span v-overflow-auto-scroll>{{ train.depStationName }}</span>
                            </span>
                            <span class="first-stop" v-show="train.isFirstStop">本站始发</span>
                            <div class="transfer-info" v-if="train.transfer">
                                <div style="height: 50%;width: 100%;" class="auto-scroll-container">
                                    <div v-overflow-auto-scroll>
                                        <q-icon name="fa-solid fa-person-walking"/>
                                        <span>
                                           {{ Math.round(train.transfer.needTime / 60) }}
                                            {{ t('time.minute') }} ({{ train.transfer.distance + t('meterShort') }})
                                        </span>
                                    </div>
                                </div>
                                <div style="height: 50%;width: 100%;" class="auto-scroll-container">
                                    <span v-overflow-auto-scroll>
                                        {{ t(`transferCategory.${train.transfer.category}`) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="through-station-wrapper">
                            <div class="stop-info-wrapper">
                                <span style="top: 0">
                                        {{ train.depTime.format('HH:mm') }}
                                </span>
                                <span style="top: 25px;font-size: 14px">
                                    {{ Math.ceil(train.arrTime.diff(train.depTime, 's') / 60) }}
                                    {{ t('time.minute') }}
                                </span>
                                <span style="bottom: 0">
                                        {{ train.arrTime.format('HH:mm') }}
                                </span>
                            </div>

                            <div class="stop-line-wrapper" v-if="train.lines">
                                <span :class="calcLineClass(train,lineIndex)"
                                      :key="lineIndex"
                                      :style="{backgroundColor:line.color, height:calcLineHeight(train,lineIndex)}"
                                      v-for="(line,lineIndex) in train.lines.map(it=>it.line)">
                                </span>
                                <transition-group name="list-view">
                                        <span :key="`stop-info-${index}`" :style="{top:130+index*70+'px'}"
                                              class="station-circle-wrapper"
                                              v-for="(item,index) in train.stops.slice(1,-1)"
                                              v-show="train.showStopInfo">
                                            <span class="dep-arr-time-wrapper">
                                               <b>{{ item.arr.format('HH:mm') }}</b><br>
                                                <b>{{ item.dep.format('HH:mm') }}</b>
                                            </span>
                                            <span @click="handleChangeDepStation(item.stationId)"
                                                  class="station-name-wrapper station-name">
                                                {{ item.stationName }}
                                            </span>
                                            <svg class="normal" height="20px" width="20px"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="10" cy="10" fill="#ffffff" r="5" stroke="#ffffff"/>
                                            </svg>
                                        </span>
                                </transition-group>
                            </div>
                            <div class="right-area-wrapper">
                                <div class="line-name-wrapper">
                                    <div style="display: flex;gap: 10px;">
                                        <span v-html="trainNameGetter(train)"></span>
                                        <span
                                            style="width: 50px;display: flex; flex-direction: column; justify-content: center;">
                                            <TrainCategory :category="train.category"/>
                                        </span>
                                    </div>
                                    <span>
                                        <b style="color: var(--q-primary)">
                                            {{ t('boundFor').replace('$terminal', train.terminal.stationName) }}</b>
                                    </span>
                                </div>
                                <div @click="handleFoldStopInfo(train)" class="item-wrapper stop-count-wrapper"
                                     v-show="train.stops.length>2">
                                    <span style="color: var(--q-normal);margin-right: 4px;">
                                        {{ train.stops.length - 1 }} {{ t('stop') }}</span>
                                    <i :class="[train.showStopInfo?'fa fa-angle-up':'fa fa-angle-down']"></i>
                                </div>
                            </div>
                        </div>
                        <div class="station-name-wrapper" v-if="index===solution.trains.length-1||train.outerTransfer">
                            <span class="station-name">
                                {{ train.arrStationName }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </OverlayView>
</template>
<script setup>
import OverlayView from "components/OverlayView.vue";
import {useI18n} from "vue-i18n";
import {onMounted} from "vue";
import TrainCategory from "components/TrainCategory.vue";

const {t} = useI18n()
const props = defineProps({
    solution: {
        type: Object,
    }
})
const STOP_ROW_HEIGHT = 80
const trainNameGetter = (train) => {
    if (!train.lines) {
        console.warn('lines is undefined', JSON.stringify(train))
    }
    const lines = train.lines.map(it => it.line)
    const lineName = lines.map(it => it.name).join('·')
    const color = lines[0].color || 'var(--q-primary)'
    return `<span style="color: ${color};font-size: 24px;font-weight:bold;">${lineName}</span>`
}
const calcLineHeight = (trainInfo, lineIndex) => {
    let initHeight = 140
    const perStopHeight = 70
    const isTransLine = trainInfo.lines.length > 1
    if (trainInfo.showStopInfo) {
        if (!isTransLine) return initHeight + (trainInfo.stops.length - 2) * perStopHeight + 'px'
        if (lineIndex === 0) {
            return initHeight + trainInfo.lines[lineIndex].height + 'px'
        }
        return trainInfo.lines[lineIndex].height + 'px'
    } else {
        return isTransLine ? initHeight / 2 + 'px' : initHeight + 'px'
    }
}
const transferInfoGetter = (index) => {
    if (index === 0) {
        return null
    }

}
const calcLineClass = (trainInfo, lineIndex) => {
    let length = trainInfo.lines.length;
    const isTransLine = length > 1
    if (!isTransLine) return 'line-wrapper normal-line'
    if (lineIndex === 0) return 'line-wrapper first-line'
    else if (lineIndex === length - 1) return 'line-wrapper last-line'
    return 'center-line'
}
const handleClickStationName = (stationId) => {

}
const handleShowQuickStationView = (stop) => {

}

const handleFoldStopInfo = (train) => {
    train.showStopInfo = !train.showStopInfo;
}
onMounted(() => {
    console.log('RouteSolutionDetailView.vue mounted', props.solution)
})
const emit = defineEmits(['close'])
const handleClose = () => {
    emit('close')
}
</script>
<style scoped>
.train-wrapper .station-name-wrapper {
    width: 90%;
    margin: 0 auto;
    display: flex;
    height: 50px;
    border-bottom: 1px solid #cecdcd;
    border-top: 1px solid #cecdcd;
    position: relative;
}

.train-wrapper .station-name-wrapper {
    .transfer-info {
        position: absolute;
        right: 0;
        align-self: center;
        width: 40%;
        height: 100%;
        font-size: 16px;
        color: var(--q-normal);
    }

    .transfer-info div {
        height: 50%;
        text-align: right;
    }
}

.transfer-info-wrapper {
    width: 90%;
    margin: 0 auto;
    display: flex;
    height: 80px;
    border-top: 1px solid #cdcdcd;
}

.train-wrapper .station-name-wrapper .station-name {
    position: absolute;
    left: 80px;
    width: 40%;
    text-align: left;
    display: block;
    font-weight: bold;
    font-size: 24px;
    color: #656f8c;
    align-self: center;
}

.train-wrapper .station-name-wrapper .first-stop {
    height: 20px;
    font-size: 12px;
    line-height: 20px;
    width: 60px;
    margin-left: 10px;
    margin-right: 10px;
    border-radius: 10px;
    color: #ffffff;
    text-align: center;
    background-color: var(--q-primary);
    align-self: center;
}

.normal-line {
    border-radius: 5px;
}

.first-line {
    border-top-right-radius: 5px;
    border-top-left-radius: 5px;
}

.last-line {
    border-bottom-right-radius: 5px;
    border-bottom-left-radius: 5px;
}

.center-line {
    border-radius: 0;
}

.through-station-wrapper {
    width: 90%;
    margin: 0 auto;
    display: flex;
}


.stop-info-wrapper {
    height: inherit;
    display: inline-block;
    width: 80px;
    position: relative;
}

.stop-info-wrapper > span {
    position: absolute;
    font-size: 20px;
    width: 100%;
    text-align: right;
    color: var(--q-primary);
    font-weight: bold;
}

.stop-line-wrapper {
    height: 100%;
    display: inline-block;
    width: 40px;
    position: relative;
}

.stop-line-wrapper .line-wrapper {
    width: 10px;
    min-height: 70px;
    display: block;
    margin: 0 auto;
    transition: all .5s;
}

.stop-line-wrapper .station-circle-wrapper {
    display: block;
    position: absolute;
    z-index: 25;
    width: 100%;
    text-align: center;
    top: 0;
}

.station-circle-wrapper .dep-arr-time-wrapper {
    position: absolute;
    left: -40px;
    top: -10px;
    color: var(--q-grey-3);
}

.station-circle-wrapper .station-name-wrapper {
    position: absolute;
    left: 40px;
    font-weight: normal;
    font-size: 18px;
    width: 100px;
    text-align: left;
    color: var(--q-grey-3);
    border: 0;
}

.list-view-enter-active {
    animation: stop-info-view-transition .5s;
}

.list-view-leave-active {
    animation: stop-info-view-transition .5s reverse;
}

@keyframes stop-info-view-transition {
    from {
        transform: translateY(100vh);
    }
    to {
        transform: translateY(0);
    }
}
</style>
