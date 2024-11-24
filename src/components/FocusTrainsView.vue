<template>
    <div v-if="focusTrains.length===0"
         style="display: flex;justify-content: center;padding: 10px;  align-items: center;height: 100%;">
        <span style="font-size: 20px;text-align: center; display: flex;">
            在车站实时添加关注列车
        </span>
    </div>
    <q-tab-panels v-if="focusTrains.length>0" v-model="currentTrainId" @touchstart.stop swipeable animated>
        <q-tab-panel :name="train.id" v-for="(train,index) in focusTrains" :key="train.id">
            <div class="row">
                <div v-overflow-auto-scroll class="col-4 auto-scroll-container">
                    <i style="color: var(--q-primary)"> {{ train.station.name }}</i>
                </div>
                <div class="col-8">
                    {{ formatToHHMM(train.dep) }}
                </div>
                <div class="col-8" style="display: flex;align-items: center;justify-content: center;">
                    <div class="show-text-in-2-line"
                         style="font-weight: bold;width: 100%;font-size: 18px;text-align: center;">
                        {{ train.terminal }}
                    </div>
                </div>
                <div class="col-4 train-status"
                     style="display: flex;align-items: center;justify-content: center; border-left: 2px solid var(--q-primary);">
                    <div class="show-text-in-2-line" :class="train.status"
                         style="font-size: 16px;text-align: center;" v-html="train.statusStr">
                    </div>
                </div>
            </div>
            <div style="font-size: 12px;color: var(--q-grey);text-align: center;opacity: 80%;">
                {{ index + 1 }} / {{ focusTrains.length }}
            </div>
        </q-tab-panel>
    </q-tab-panels>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useStore} from "vuex";
import {diff, fixedMins, formatToHHMM} from "src/utils/time-utils";
import {calcTrainStatus, TRAIN_STATUS} from "src/models/Train";
import {useI18n} from "vue-i18n";

const {t} = useI18n()
const store = useStore()

const updateTrainStatus = (trains) => {
    console.log('Update focus train status', trains)
    if (!trains) return
    trains.forEach(train => {
        const [status, seconds] = calcTrainStatus(train)
        train.status = status.code
        if (status === TRAIN_STATUS.ONTIME) {
            train.statusStr = `<b style="color: var(--q-primary-d)">${fixedMins(seconds)}</b><br/>${t('time.minute')}`
        } else {
            const key = 'trainStatus.' + status.code
            train.statusStr = `<b>${t(key)}</b>` || status.code
        }
    })
}

const focusTrains = computed(() => {
    let trains = store.getters["preference/focusTrains"]
    if (!trains || trains.length === 0) {
        return []
    }
    trains = trains.sort((o1, o2) => diff(o1.dep, o2.dep))
    updateTrainStatus(trains)
    return trains
})
watch(focusTrains, (newTrains, oldTrains) => {
    if (newTrains && newTrains.length > 0) {
        const newestTrains = newTrains.filter(it => oldTrains.findIndex(it2 => it2.id === it.id) === -1)
        if (newestTrains.length > 0) {
            currentTrainId.value = newestTrains[0].id
        }
        updateTrainStatus(focusTrains.value)
    }
})
const currentTrainId = ref((focusTrains.value.length > 0 && focusTrains.value[0].id) || null)

let updateTrainStatusInterval;

onMounted(() => {
    updateTrainStatusInterval = setInterval(() => {
        if (focusTrains.value && focusTrains.value.length > 0) {
            updateTrainStatus(focusTrains.value)
        }
    }, 5000)
})

onBeforeUnmount(() => {
    if (updateTrainStatusInterval) {
        clearInterval(updateTrainStatusInterval)
    }
})

</script>

<style scoped>
.q-tab-panel {
    padding: 6px 12px;
}

.q-tab-panels {
    height: 100%;
}

.train-status {
    color: var(--q-normal);
}
</style>
