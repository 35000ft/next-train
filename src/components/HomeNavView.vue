<template>
    <LeftDrawer :open="leftDrawerOpen"/>
    <SearchHeader/>
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

            <div style="min-height: 500px;max-width: 400px;width: 100%;z-index: 100;position: absolute;">
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

            <OpenStreetMap v-if="isWideScreen" style="width: 100%; height:100vh;position: fixed;z-index: 0"
                           :center="mapProps.center" :point-name="mapProps.pointName"
            />
        </div>
    </q-page-container>
</template>

<script setup>
import SearchHeader from "components/SearchHeader.vue";
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import StationRealtimeView from "components/StationRealtimeView.vue";
import {useStore} from "vuex";
import FocusTrainsView from "components/FocusTrainsView.vue";
import FavouredStationListCard from "components/FavouredStationListCard.vue";
import {useQuasar} from "quasar";
import CurrentTrip from "components/CurrentTrip.vue";
import LeftDrawer from "components/LeftDrawer.vue";
import 'leaflet/dist/leaflet.css';
import OpenStreetMap from "components/OpenStreetMap.vue";

defineOptions({
    name: 'HomeView'
})

const isWideScreen = ref(window.innerWidth > 1024)
const handleResize = () => {
    isWideScreen.value = window.innerWidth > 1024
}
onMounted(() => {
    init()
})

async function init() {
    window.addEventListener('resize', handleResize)
}

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
})

const store = useStore()
const props = defineProps({})
const topBanner = ref('currentTrip')
const $q = useQuasar()
const leftDrawerOpen = computed(() => store.getters['application/showLeftDrawer'])
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
    loadRuleFavStation()
})
const loadRuleFavStation = () => {
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
