<template>
    <q-page-container style=" max-height: 85vh; overflow-y: auto">
        <div class="row" style="gap:20px;justify-content: space-between;">
            <div class="col-12 row-card" v-if="usedSolution">
                <q-card class="my-card">
                    <q-card-section class="full-height" style="padding: 0">
                        <q-tab-panels class="full-height" v-model="topBanner" swipeable animated @touchstart.stop>
                            <q-tab-panel name="currentTrip" v-if="usedSolution">
                                <CurrentTrip :solution="usedSolution"/>
                            </q-tab-panel>
                            <!--                            <q-tab-panel name="home2">-->
                            <!--                                HOME 2-->
                            <!--                            </q-tab-panel>-->
                            <!--                            <q-tab-panel name="home3">-->
                            <!--                                HOME 3-->
                            <!--                            </q-tab-panel>-->
                        </q-tab-panels>
                    </q-card-section>
                </q-card>
            </div>

            <div v-if="pcMode" style="left: 0;position: absolute;top: 55px;">
                <div
                    style="min-height: 500px;max-width: 380px;width: 100%;z-index: 100;position: fixed; left: 35px; top:70px;">
                    <div style="display: flex;justify-content: space-around;margin-bottom: 10px;">
                        <div class="my-card middle-card">
                            <q-card>
                                <FocusTrainsView/>
                            </q-card>
                        </div>
                        <div class="my-card middle-card">
                            <q-card>
                                <q-card-section>
                                    <FavouredStationListCard/>
                                </q-card-section>
                            </q-card>
                        </div>
                    </div>
                    <q-card class="my-card full-height">
                        <q-card-section class="full-height" style="padding: 0;">
                            <StationRealtimeView :current-station-id-prop="currentStationId"
                                                 @change-station="handleChangeStation"/>
                        </q-card-section>
                    </q-card>
                </div>

                <OpenStreetMap style="width: 100%; height:100vh;position: fixed;z-index: 0"
                               :center="mapProps.center" :point-name="mapProps.pointName"
                />
            </div>
            <div v-else class="col-12">
                <div style="width: 100%;">
                    <div style="display: flex;justify-content: space-around;margin-bottom: 10px;">
                        <div class="my-card middle-card">
                            <q-card>
                                <FocusTrainsView/>
                            </q-card>
                        </div>
                        <div class="my-card middle-card">
                            <q-card>
                                <q-card-section>
                                    <FavouredStationListCard/>
                                </q-card-section>
                            </q-card>
                        </div>
                    </div>
                    <q-card class="my-card full-height">
                        <q-card-section class="full-height" style="padding: 0;">
                            <StationRealtimeView :current-station-id-prop="currentStationId"
                                                 @change-station="handleChangeStation"/>
                        </q-card-section>
                    </q-card>
                </div>
            </div>

        </div>
    </q-page-container>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import StationRealtimeView from "components/StationRealtimeView.vue";
import {useStore} from "vuex";
import FocusTrainsView from "components/FocusTrainsCard.vue";
import FavouredStationListCard from "components/FavouredStationListCard.vue";
import {useQuasar} from "quasar";
import CurrentTrip from "components/CurrentTrip.vue";
import 'leaflet/dist/leaflet.css';
import OpenStreetMap from "components/common/OpenStreetMap.vue";
import {isPCMode} from "src/utils/navigator_utils";
import {useRoute} from "vue-router";

defineOptions({
    name: 'HomeView'
})

const pcMode = ref(isPCMode(1024))


const store = useStore()
const props = defineProps({})
const topBanner = ref('currentTrip')
const $q = useQuasar()
const route = useRoute()
const currentStationId = computed(() => {
    const currentStation = store.getters['preference/currentStation']
    if (currentStation) {
        return currentStation.id
    } else {
        const railsystem = store.getters['railsystem/currentRailSystem'];
        return railsystem.defaultStationId
    }
})
onMounted(() => {
    initRailsystem()
    initStation()
})
const initRailsystem = () => {
    const stationId = route.query.stationId
    if (stationId) return
    const railsystemCode = route.query.r
    if (railsystemCode) {
        store.dispatch('railsystem/changeRailsystem', {railsystemCode}).then(r => {
            console.log('自动切换线网成功:', r)
        }).catch(e => {
            console.error('自动切换线网失败:', e)
            $q.notify.error("自动切换线网失败")
        })
    }
}

const initStation = () => {
    const stationId = route.query.stationId
    if (stationId) {
        // 加载路径传入的车站
        store.dispatch('railsystem/getStation', {stationId}).then(s => {
            store.commit('preference/SET_CURRENT_STATION', {station: s})
            $q.notify.ok('切换车站成功')
        })
        return
    }
    // 加载收藏车站
    store.dispatch('preference/getRuleFavourStation').then(_favStation => {
        if (_favStation) {
            store.commit('preference/SET_CURRENT_STATION', {station: _favStation})
            $q.notify.ok('切换到收藏车站成功')
        }
    })

}
const mapProps = ref({
    center: [32.04386, 118.778934],
    pointName: "南京"
})

const handleChangeStation = (station) => {
    if (station.location) {
        const [wgsLng, wgsLat] = coordtransform.gcj02towgs84(...station.location.split(',').map(it => Number(it)))
        if (wgsLat && wgsLng) {
            mapProps.value = {
                center: [wgsLat, wgsLng],
                pointName: station.name,
            }
        }
    }
    store.commit('preference/SET_CURRENT_STATION', {station})
}

const usedSolution = computed(() => {
    return store.getters['application/usedSolution']
})

</script>

<style scoped>

.row-card .q-card {
    height: 100px;
}

.middle-card {
    width: 46.5%;
}

.middle-card .q-card {
    height: 100px;
}

.my-card {
    height: 100%;
}

.q-tab-panel {
    background-color: darkseagreen;
    padding: 0;
}

.q-card__section--vert {
    height: 100%;
    padding-top: 10px;
    padding-bottom: 10px;
}
</style>
