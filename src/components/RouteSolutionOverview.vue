<template>
    <OverlayView name="RouteSolutionOverview">
        <template v-slot:header-center>
            <div style="width: 50vw;max-width: 300px;margin:0 auto;" class="auto-scroll-container">
                <div v-if="departStation&&arrivalStation" v-overflow-auto-scroll style="text-align: center;">
                    <span style="margin-right: 10px;">{{ departStation.name }}</span>
                    <q-icon name="fa fa-arrow-circle-right"/>
                    <span style="margin-left: 10px;">{{ arrivalStation.name }}</span>
                </div>
            </div>
        </template>
    </OverlayView>
</template>
<script setup>
import OverlayView from "components/OverlayView.vue";
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {planRoute} from "src/utils/route-plan";
import {getNowByTimezone} from "src/utils/time-utils";
import {useStore} from "vuex";

const route = useRoute()
const fromMainId = ref(null)
const toMainId = ref(null)
const depTime = ref(null)

const departStation = ref(null)
const arrivalStation = ref(null)
onMounted(() => {
    init()
})
const store = useStore()

async function init() {
    const params = route.query
    fromMainId.value = params.fromMainId
    toMainId.value = params.toMainId
    depTime.value = params.depTime
    departStation.value = await store.dispatch('railsystem/getStation', {stationId: params.fromMainId})
    store.dispatch('railsystem/getStation', {stationId: toMainId.value}).then(station => {
        arrivalStation.value = station
    })
    const {timezone, railsystemCode} = departStation.value
    const _depTime = depTime.value || getNowByTimezone(timezone)

    store.dispatch('railsystem/getRailSystemGraph', {code: railsystemCode}).then(graph => {
        planRoute(graph, fromMainId, toMainId, ({stationId, lineId, depTime}) => {
                return store.dispatch('realtime/fetchStationTrainAtTime', {stationId, lineId, depTime})
            },
            ({fromId, fromPlatform, toId, toPlatform, fromMainId}) => {
                return store.dispatch('railsystem/getTransferInfo', {
                    fromId,
                    fromPlatform,
                    toId,
                    toPlatform,
                    fromMainId,
                })
            },
            _depTime, (solution) => {
                console.log('sds', solution)
            }).then(allSolutions => {

        })
    })
}

</script>

<style scoped>

</style>
