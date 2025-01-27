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
                <div v-for="solution in solutions" :key="solution.id">
                    <OneSolutionOverview :solution="solution" @select="handleShowSolutionDetail"/>
                </div>
                <div v-if="loading">
                    <q-skeleton height="80px" style="margin-bottom: 2px;"/>
                    <q-skeleton height="80px" style="margin-bottom: 2px;"/>
                    <q-skeleton height="80px" style="margin-bottom: 2px;"/>
                </div>
                <div v-if="!loading&&solutions.length===0" style="display: flex;justify-content: center;">
                    <h4>暂无可用方案</h4>
                </div>
            </div>
        </template>
    </OverlayView>
</template>
<script setup>
import OverlayView from "components/OverlayView.vue";
import {onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {planRoute, planShortestSolution} from "src/utils/route-plan";
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
    const {fromMainId, toMainId, viaIds} = params
    const via = (viaIds && viaIds.split(',')) || []
    depTime.value = params.depTime
    loading.value = true
    departStation.value = await store.dispatch('railsystem/getStation', {stationId: fromMainId})
    store.dispatch('railsystem/getStation', {stationId: toMainId}).then(station => {
        arrivalStation.value = station
    })
    const {timezone, railsystemCode} = departStation.value
    const _depTime = depTime.value || getNowByTimezone(timezone)
    const oneSolutionCb = (solution) => {
        solutions.value.push(solution)
        console.log('Push solution', solution, new dayjs().format())
    }
    const trainGetter = ({stationId, lineId, depTime}) =>
        store.dispatch('realtime/fetchStationTrainAtTime', {stationId, lineId, depTime})
    const transferInfoGetter = ({fromId, fromPlatform, toId, toPlatform, fromMainId}) => {
        return store.dispatch('railsystem/getTransferInfo', {
            fromId,
            fromPlatform,
            toId,
            toPlatform,
            fromMainId,
        })
    }
    store.dispatch('railsystem/getRailSystemGraph', {code: railsystemCode}).then(graph => {
        let promise
        if (via.length === 0) {
            promise = planRoute(graph, fromMainId, toMainId, trainGetter, transferInfoGetter, _depTime, oneSolutionCb)
        } else {
            promise = planShortestSolution(graph, fromMainId, toMainId, via, trainGetter, transferInfoGetter, _depTime, oneSolutionCb)
        }
        promise.then(allSolutions => {
            loading.value = false
            solutions.value.sort((o1, o2) => o1.arrTime.format().localeCompare(o2.arrTime.format()))
            console.log('全部方案已加载完成', allSolutions)
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
