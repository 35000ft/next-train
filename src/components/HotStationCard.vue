<template>
    <q-card>
        <q-card-section class="full-height">
            <div style="display: flex;flex-direction: column; height: 100%;">
                <div v-if="hotStations.length===0 && !loading"
                     style="display: flex;justify-content: center;padding: 10px;  align-items: center;height: 100%;">
            <span style="font-size: 20px;text-align: center; display: flex;">
                暂时未能载入热点车站
            </span>
                </div>
                <div class="header-wrapper">{{ t('hotStation') }}</div>
                <div v-if="loading">
                    <q-skeleton height="20px" style="margin-bottom: 2px;"/>
                    <q-skeleton height="20px" style="margin-bottom: 2px;"/>
                    <q-skeleton height="20px" style="margin-bottom: 2px;"/>
                </div>
                <div v-if="hotStations?.length>0" class="scroll">
                    <div class="row station-row" v-for="(hs, index) in hotStations.slice(0,10)" :key="hs.stationId"
                         style="height: 20px;">
                        <div class="col-8 station-name" :class="index===0?'first-station':''">
                            {{ hs.station?.name }}
                        </div>
                        <div class="col-4 icons">
                        <span style="margin-right: 2px; color: var(--q-grey); ">
                            {{ hs.count > 1 ? Math.ceil(hs.count * 57.334) : 50 }}
                        </span>
                            <q-icon name="fa-solid fa-fire" color="red"/>
                        </div>
                    </div>
                </div>
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useStore} from "vuex";

import {useI18n} from "vue-i18n";
import {fetchHotStations} from "src/apis/reailtime";

const {t} = useI18n()
const store = useStore()

const currentRailSystem = computed(() => store.getters['railsystem/currentRailSystem'])
const hotStations = ref([])
const loading = ref(true)
const props = defineProps({
    showSignal: {
        type: Number,
        default: 1,
    }
})

async function loadHotStations() {
    loading.value = true
    hotStations.value = []
    try {
        hotStations.value = await fetchHotStations(currentRailSystem.value.code)
        console.log('load hot s', hotStations.value)
    } catch (e) {
        console.warn('Load hot station error.', e)
    } finally {
        loading.value = false
    }
}

watch(() => props.showSignal, (newVal, oldVal) => {
    loadHotStations()
})

onMounted(() => {
    loadHotStations()
})

onBeforeUnmount(() => {

})

</script>

<style scoped>
.q-tab-panel {
    padding: 6px 12px;
}

.q-tab-panels {
    height: 100%;
}

.station-row {
    border-bottom: 1px solid var(--q-grey-2);
}

.header-wrapper {
    height: 20px;
    color: var(--q-grey);
}

.icons {
    text-align: right;
}

.station-name {
    font-weight: bold;
    color: var(--q-grey);
}

.first-station {
    color: var(--q-red);
}

.q-tab-panel {
    padding: 0;
}

.q-card__section--vert {
    height: 100%;
    padding-top: 10px;
    padding-bottom: 10px;
}
</style>
