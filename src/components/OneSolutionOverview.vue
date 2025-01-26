<template>
    <div style="padding-left: 10px;padding-right: 10px;padding-bottom: 10px;">
        <q-card style="height:80px;padding: 5px;background-color: var(--q-background-grey-2);">
            <div class="solution-title">
                <span class="wrap-over-float-text" style="background-color: var(--q-green);">
                    {{ solution.depTime.format('HH:mm') }} 发</span>
                <span class="wrap-over-float-text">{{ totalTime }}</span>
                <span class="wrap-over-float-text" style="background-color: var(--q-red);"
                >{{ solution.arrTime.format('HH:mm') }} 到</span>
            </div>
            <div class="solution-content">
                <div v-if="trains">
                      <span v-for="(train,index) in trains" :key="train.id">
                          <LineIcon v-for="line in train.lines" :key="line.lineId" :line="line.line"/>
                          <span v-if="index<trains.length-1">{{ train.arrStationName }}</span>
                      </span>
                </div>
            </div>
        </q-card>
    </div>
</template>
<script setup>
import {computed, onMounted, ref, watch} from "vue";
import {diff} from "src/utils/time-utils";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import {trainLineOfStopParser} from "src/models/Train";
import LineIcon from "components/LineIcon.vue";

const {t} = useI18n()
const props = defineProps({
    solution: {
        type: Object,
    }
})
onMounted(() => {
    initTrains()
})
const store = useStore()
const totalTime = computed(() => {
    if (props.solution) {
        const {depTime, arrTime, distance} = props.solution
        const minutes = diff(arrTime, depTime, 'minute')
        return `${minutes} ${t('time.minute')} ${(distance / 1000).toFixed(1)} ${t('kilometer')}`
    } else {
        return '--'
    }
})
const trains = ref(null)
const initTrains = () => {
    const _trains = props.solution.trains.filter(it => it.type === 'train')
    const promises = _trains.map(async it => {
        it.lines = trainLineOfStopParser(it.trainInfo)
        const promises = it.lines.map(async line => {
            return store.dispatch('railsystem/getLine', {lineId: line.lineId}).then(_line => {
                line.line = _line
                return line
            })
        })
        it.lines = await Promise.all(promises)
        return it
    })
    Promise.all(promises).then(_ => {
        trains.value = _trains
    })
}
</script>

<style scoped>
.solution-title {
    height: 20px;
    font-size: 16px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-content: center;
    font-family: "Helvetica Neue", Helvetica, "Lucida Grande", Arial, "Hiragino Sans GB", "Microsoft Yahei", "WenQuanYi Micro Hei", sans-serif;
}

.wrap-over-float-text {
    border-radius: 5px;
    color: white;
    background-color: var(--q-primary-d);
    padding-left: 4px;
    padding-right: 4px;
}

.solution-content {
    height: 20px;
    overflow-x: auto;
}
</style>
