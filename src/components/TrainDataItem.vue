<template>
    <div class="row train-data border-bottom" v-if="trainData"
         style="padding-left: 4px;">
        <div style="display: flex; align-items: center;text-align: left; width: auto;">
            <TrainStatusIndicator :arrive-mins="arriveMins" size="13px"/>
        </div>
        <div class="col-5 text-left" style="color: var(--q-normal)">
            <TrainTerminal :train-data="trainData" @show-train-detail="handleShowTrainDetail"/>
        </div>
        <div class="col-5">
            <div v-overflow-auto-scroll
                 style="margin-left: auto;display: flex;align-items: center;justify-content: flex-end;">
                <div style="flex-shrink: 0">
                    <DepTrainTime :train-data="trainData" :station="station"/>
                </div>
                <span class="pill"
                      v-for="(trainCategory,index) in trainCategories" :key="index"
                      :style="{backgroundColor:trainCategory.bgColor}">
                        {{ t(`trainCategory.${trainCategory.code}`) }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>

import TrainStatusIndicator from "components/TrainStatusIndicator.vue";
import {useI18n} from "vue-i18n";
import {computed} from "vue";
import {diffFromNow, fixedMins} from "src/utils/time-utils";
import {TRAIN_CATEGORY} from "src/models/Train";
import DepTrainTime from "components/DepTrainTime.vue";
import TrainTerminal from "components/TrainTerminal.vue";

const {t} = useI18n()
const trainCategories = computed(() => {
    if (props.trainData && props.trainData.category) {
        return props.trainData.category.map(it => TRAIN_CATEGORY[it])
    }
    return []
})
const props = defineProps({
    trainData: {
        type: Object,
    },
    station: {
        type: Object,
    }
})
const arriveMins = computed(() => {
    let diffSeconds = diffFromNow(props.trainData.arr, 'second')
    return fixedMins(diffSeconds)
})
const emit = defineEmits(['showTrainDetail'])
const handleShowTrainDetail = (trainInfoId) => {
    emit('showTrainDetail', trainInfoId)
}

</script>

<style scoped>
.train-data {
    justify-content: space-around;
}

.border-bottom {
    border-bottom: 1px solid #dcdcdc;
}

.train-data div {
    padding-bottom: 2px;
    white-space: nowrap;
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
    flex-shrink: 1;
}
</style>
