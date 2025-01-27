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
        <template v-slot:default>
            <div>
                <div style="height: 10px;"></div>
                <div v-for="(solution,index) in solutions" :key="index">
                    <OneSolutionOverview :solution="solution" @select="handleShowSolutionDetail"/>
                </div>
                <div v-if="loading">
                    <q-skeleton height="80px" style="margin-bottom: 2px;"/>
                    <q-skeleton height="80px" style="margin-bottom: 2px;"/>
                    <q-skeleton height="80px" style="margin-bottom: 2px;"/>
                </div>
            </div>
        </template>
    </OverlayView>
</template>
<script setup>
import OverlayView from "components/OverlayView.vue";
import {onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {planRoute} from "src/utils/route-plan";
import {getNowByTimezone} from "src/utils/time-utils";
import {useStore} from "vuex";
import {useQuasar} from "quasar";
import OneSolutionOverview from "components/OneSolutionOverview.vue";
import dayjs from "dayjs";

const loading = ref(true)
const route = useRoute()

const depTime = ref(null)

const departStation = ref(null)
const arrivalStation = ref(null)
onMounted(() => {
    init()
})
const store = useStore()
const $q = useQuasar()
const solutions = ref([])

async function init() {
    const params = route.query
    const {fromMainId, toMainId} = params
    depTime.value = params.depTime
    loading.value = true
    departStation.value = await store.dispatch('railsystem/getStation', {stationId: fromMainId})
    store.dispatch('railsystem/getStation', {stationId: toMainId}).then(station => {
        arrivalStation.value = station
    })
    const {timezone, railsystemCode} = departStation.value
    const _depTime = depTime.value || getNowByTimezone(timezone)
    store.dispatch('railsystem/getRailSystemGraph', {code: railsystemCode}).then(graph => {
        planRoute(graph, fromMainId, toMainId, ({stationId, lineId, depTime}) =>
                store.dispatch('realtime/fetchStationTrainAtTime', {stationId, lineId, depTime}),
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
                solutions.value.push(solution)
                console.log('push solution', solution, new dayjs().format())
            })
            .then(allSolutions => {
                loading.value = false
                console.log('all done')
                $q.notify.ok('全部方案已加载完成')
            })
    })
}

const router = useRouter()
const handleShowSolutionDetail = (_solution) => {
    router.push({name: 'route-solution-detail'})
    store.dispatch('application/pushOverlay', {
        component: {componentName: "RouteSolutionDetailView", props: {solution: _solution}}
    })
}

</script>

<style scoped>

</style>
