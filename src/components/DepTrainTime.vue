<template>
      <span class="pill" @click="addToFocusTrains">
        {{ formatToHHMM(trainData.dep) }}
      </span>
</template>

<script setup>

import {diffFromNowFormatted, formatToHHMM} from "src/utils/time-utils";
import {useStore} from "vuex";
import {toRaw} from "vue";
import {useQuasar} from "quasar";
import {useI18n} from "vue-i18n";

const {t} = useI18n()
const $q = useQuasar()
const store = useStore()
const props = defineProps({
    trainData: {
        type: Object
    },
    station: {
        type: Object
    }
})
const addToFocusTrains = () => {
    store.dispatch('preference/addFocusTrain', {train: toRaw(props.trainData), station: props.station})
        .then(_ => {
            const remainTime = diffFromNowFormatted(props.trainData.dep)
            const remainTimeStr = (remainTime.hours > 0 ? `${remainTime.hours}${t('time.hour')} ` : '')
                + (remainTime.minutes > 0 ? `${remainTime.minutes}${t('time.minute')} ` : '')
                + (remainTime.seconds > 0 ? `${remainTime.seconds}${t('time.second')}` : '')
            const message = t('focusTrainSuccess').replace('$remain', remainTimeStr)
            $q.notify.ok(message)
        })
}
</script>

<style scoped>
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
}
</style>
