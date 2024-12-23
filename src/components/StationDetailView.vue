<template>
    <OverlayView>
        <template v-slot:header-center>
            <div>{{ headerTitle }}</div>
        </template>
        <template v-slot:default>
            <div class="full-height content-wrapper">
                <div v-if="station">
                    <div v-for="line in station.lines" :key="line.id" class="line-train-info-wrapper2">
                        <StationLineRealtimeView :station="station" :line="line"/>
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
import {useRoute} from "vue-router";
import {useStore} from "vuex";
import StationLineRealtimeView from "components/StationLineRealtimeView.vue";

const loading = ref(true)
const route = useRoute()
const station = ref(null)
const store = useStore()
onMounted(() => {
    init()
})

const headerTitle = computed(() => {
    if (station.value) {
        return station.value.name
    } else {
        return '--'
    }
})

async function init() {
    console.log('route', route)
    const stationId = route.params.id
    console.log('stationId', stationId)
    loading.value = true
    let _station = await store.dispatch('railsystem/getStation', {stationId})
    console.log('station', _station)
    //TODO
    if (_station) {
        loading.value = false
        station.value = _station
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
