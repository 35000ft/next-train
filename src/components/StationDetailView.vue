<template>
    <OverlayView name="stationDetailView">
        <template v-slot:header-center>
            <div>{{ headerTitle }}</div>
        </template>
        <template v-slot:default>
            <div class="full-height content-wrapper">
                <div style="height: 10px;"></div>
                <div v-if="station">
                    <div v-for="line in station.lines" :key="line.id" class="line-train-info-wrapper2">
                        <StationLineRealtimeView :station="station" :line="line" @change-station="handleChangeStation"/>
                    </div>
                    <div style="height: 100px;"></div>
                </div>
            </div>
        </template>
    </OverlayView>

</template>

<script setup>
import OverlayView from "components/OverlayView.vue";
import {computed, onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useStore} from "vuex";
import StationLineRealtimeView from "components/StationLineRealtimeView.vue";
import {isNumber} from "src/utils/string-utils";

const loading = ref(true)
const route = useRoute()
const station = ref(null)
const store = useStore()
const router = useRouter()
onMounted(() => {
    console.log('stationId', route.params, route.fullPath)
    const stationId = route.params.id
    init(stationId)
})

const headerTitle = computed(() => {
    if (station.value) {
        return station.value.name
    } else {
        return '--'
    }
})

async function init(stationId) {
    loading.value = true
    let _station = await store.dispatch('railsystem/getStation', {stationId})
    //TODO
    if (_station) {
        loading.value = false
        station.value = _station
    }
}

const handleChangeStation = (stationId) => {
    if (isNumber(stationId)) {
        const params = {id: stationId};
        router.push({name: 'station-detail', params})
        store.dispatch('application/pushOverlay', {
            component: {componentName: "StationDetailView", params}
        })
    }
}
</script>

<style scoped>
.line-train-info-wrapper2 {
    margin-bottom: 10px;
}

.content-wrapper {
    width: 90%;
    margin: 0 auto;
}

::v-deep .q-expansion-item--popup > .q-expansion-item__container {
    border: none;
}
</style>
