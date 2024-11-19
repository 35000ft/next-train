<template>
    <div class="row train-data border-bottom"
         style="padding-left: 4px;justify-content: space-around">
        <div class="col-1" style="display: flex;justify-content: center; align-items: center;text-align: left; ">
            <TrainStatusIndicator :arrive-mins="arriveMins" size="13px"/>
        </div>
        <div class="col-5 text-left" style="color: var(--q-normal);overflow: hidden;">
            <div v-overflow-auto-scroll>
                 <span class="pill" style="display: inline-block;" :style="{backgroundColor:trainData.line.color}">
                     {{ trainData.line.name }}
                 </span>
                <span>{{ trainData.terminal }}</span>
            </div>
        </div>
        <div class="col-4" style="align-items: center;display: flex;justify-content: flex-end;">
            <span class="pill">{{ formatToHHMM(trainData.dep) }}</span>
        </div>
    </div>

</template>

<script setup>

import TrainStatusIndicator from "components/TrainStatusIndicator.vue";
import {useI18n} from "vue-i18n";
import {computed} from "vue";
import {diffFromNow, fixedMins, formatToHHMM} from "src/utils/time-utils";
import {TRAIN_CATEGORY} from "src/models/Train";

const {t} = useI18n()
const props = defineProps({
    trainData: {
        type: Object,
    }
})
const arriveMins = computed(() => {
    let diffSeconds = diffFromNow(props.trainData.arr, 'second')
    return fixedMins(diffSeconds)
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
