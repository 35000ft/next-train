<template>
    <SearchHeader/>
    <q-page-container style=" max-height: 85vh; overflow-y: auto">
        <div class="row" style="gap:20px;justify-content: space-between;">
            <div class="col-12 row-card" v-if="false">
                <q-card class="my-card">
                    <q-card-section class="full-height" style="padding: 0">
                        <q-tab-panels class="full-height" v-model="topBanner" swipeable animated @touchstart.stop>
                            <q-tab-panel name="home">
                                HOME 1
                            </q-tab-panel>
                            <q-tab-panel name="home2">
                                HOME 2
                            </q-tab-panel>
                            <q-tab-panel name="home3">
                                HOME 3
                            </q-tab-panel>
                        </q-tab-panels>
                    </q-card-section>
                </q-card>
            </div>

            <div class="middle-card">
                <q-card class="my-card">
                    <FocusTrainsView/>
                </q-card>
            </div>
            <div class="middle-card">
                <q-card class="my-card">
                    <q-card-section>
                        <FavouredStationListCard/>
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12" style="height: 55vh;">
                <q-card class="my-card full-height">
                    <q-card-section class="full-height" style="padding: 0;">
                        <StationRealtimeView :current-station-id-prop="currentStationId"
                                             @change-station="handleChangeStation"/>
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </q-page-container>
</template>

<script setup>
import SearchHeader from "components/SearchHeader.vue";
import {computed, ref} from "vue";
import StationRealtimeView from "components/StationRealtimeView.vue";
import {useStore} from "vuex";
import FocusTrainsView from "components/FocusTrainsView.vue";
import FavouredStationListCard from "components/FavouredStationListCard.vue";
import {useQuasar} from "quasar";
import TrainInfoDetailView from "components/TrainInfoDetailView.vue";

defineOptions({
    name: 'HomeView'
})

const store = useStore()
const props = defineProps({})
const topBanner = ref('home2')
const $q = useQuasar()
const currentStationId = computed(() => {
    const currentStation = store.getters['preference/currentStation']
    console.log('getter cur station', currentStation.name)
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

const handleChangeStation = (station) => {
    console.log('handleChangeStation', station)
    store.commit('preference/SET_CURRENT_STATION', {station})
}

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
    padding: 5px 10px;
}

.q-card__section--vert {
    height: 100%;
    padding-top: 10px;
    padding-bottom: 10px;
}
</style>
