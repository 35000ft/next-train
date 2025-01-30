<template>
    <div style="padding-left: 10px;padding-right: 10px;padding-bottom: 10px;" @click="handleClick">
        <q-card style="height:93px;padding: 5px;background-color: var(--q-background-grey-2);">
            <div class="solution-title">
                <span class="wrap-over-float-text" style="background-color: var(--q-green);">
                    {{ solution.depTime.format('HH:mm') }}
                </span>
                <span class="wrap-over-float-text">{{ totalTime }}</span>
                <span class="wrap-over-float-text" style="background-color: var(--q-red);">
                    {{ solution.arrTime.format('HH:mm') }}
                </span>
            </div>
            <div style="height: 10px;"></div>
            <div class="solution-content">
                <div v-if="trains">
                      <span v-for="(train,index) in trains" :key="train.id">
                          <span v-if="index>0 && trains[index-1].arrStationName!==train.depStationName">
                              {{ train.depStationName }}
                          </span>
                          <LineIcon v-for="line in train.lines" :key="line.lineId" :line="line.line"/>
                          <span v-if="index<trains.length-1"
                                style="margin-left: 4px;margin-right: 4px;">
                              {{ train.arrStationName }}
                          </span>
                      </span>
                </div>
            </div>
            <div style="height: 3px;"></div>
            <div class="transfer-times">
                <span v-if="solution.transferTimes>0"
                      style="margin-right: 5px;">
                    {{ t('transferTimes').replace('$times', solution.transferTimes) }}
                </span>

                <span v-show="solution.transferTimes>0" style="margin-right: 4px;">
                    <q-icon name="fa-solid fa-person-walking"/>
                    {{ solution.walkDistance }} {{ t('meterShort') }}
                </span>

                <span v-for="tag in solution.tags" :key="tag.code" :style="{backgroundColor:tag.color}"
                      class="tag-text">
                    {{ t(`solutionTags.${tag.code}`) }}
                </span>
            </div>
        </q-card>
    </div>
</template>
<script setup>
import {computed, onMounted, ref} from "vue";
import {diff} from "src/utils/time-utils";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
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
    console.log('trains', _trains)
    trains.value = _trains
}
const emit = defineEmits(['select'])
const handleClick = () => {
    emit('select', props.solution)
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
    padding-left: 6px;
    padding-right: 6px;
}

.solution-content {
    height: 30px;
    overflow-x: auto;
    white-space: nowrap;
    font-family: "Helvetica Neue", Helvetica, "Lucida Grande", Arial, "Hiragino Sans GB", "Microsoft Yahei", "WenQuanYi Micro Hei", sans-serif;
}

.tag-text {
    color: white;
    background-color: var(--q-primary);
    border-radius: 3px;
    padding: 1px 5px;
    margin-right: 3px;
}

.transfer-times {
    color: var(--q-normal);
}
</style>
