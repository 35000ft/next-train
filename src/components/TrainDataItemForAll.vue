<template>
    <div class="row train-data border-bottom"
         style="padding-left: 4px;justify-content: space-around">
        <div class="col-1" style="display: flex;justify-content: center; align-items: center;text-align: left; ">
            <TrainStatusIndicator :arrive-mins="fixedMins(arriveSeconds)" size="13px"/>
        </div>
        <div class="col-5 text-left auto-scroll-container" style="color: var(--q-normal);overflow: hidden;">
            <div>
                <TrainTerminal :train-data="trainData" @show-train-detail="handleShowTrainDetail"/>
                <span v-if="arriveSeconds<=10"
                      style="color: var(--q-arrived);font-weight:bold;">{{ t('trainStatus.arrived') }}</span>
            </div>
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
import {diffFromNow, fixedMins, formatToHHMM} from "src/utils/time-utils";
import {TRAIN_CATEGORY} from "src/models/Train";
import DepTrainTime from "components/DepTrainTime.vue";
import TrainTerminal from "components/TrainTerminal.vue";
import {localHostList} from "@quasar/app-vite/lib/helpers/net";

const {t} = useI18n()
const props = defineProps({
    trainData: {
        type: Object,
    },
    station: {
        type: Object
    }
})
const trainCategories = computed(() => {
    const _t = props.trainData
    if (_t && _t.category) {
        const categories = [TRAIN_CATEGORY[_t.category]]
        if (_t.isFirstStop) {
            categories.push(TRAIN_CATEGORY.INITIAL)
        } else if (_t.isLastStop) {
            categories.push(TRAIN_CATEGORY.TERMINAL)
        }
        return categories
    }
    return []
})
const arriveSeconds = computed(() => {
    const _ = props.trainData.updateTime
    return diffFromNow(props.trainData.arr, 'second')
})
const emit = defineEmits(['showTrainDetail'])
const handleShowTrainDetail = () => {
    emit('showTrainDetail', props.trainData)
}
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
    max-width: 30px;
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
