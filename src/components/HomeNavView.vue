<template>
    <SearchHeader/>
    <q-page-container style=" max-height: 85vh; overflow-y: auto">
        <div class="row" style="gap:20px;justify-content: space-between;">
            <div class="col-12 row-card">
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
                    <q-card-section>
                        HOME
                    </q-card-section>
                </q-card>
            </div>
            <div class="middle-card">
                <q-card class="my-card">
                    <q-card-section>
                        HOME
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12" style="height: 300px;">
                <q-card class="my-card full-height">
                    <q-card-section class="full-height" style="padding: 0;">
                        <StationRealtimeView current-station-id-prop="2132" @change-station="handleChangeStation"/>
                    </q-card-section>
                </q-card>
            </div>

        </div>
    </q-page-container>

</template>

<script setup>
import SearchHeader from "components/SearchHeader.vue";
import {ref} from "vue";
import StationRealtimeView from "components/StationRealtimeView.vue";
import {useStore} from "vuex";

defineOptions({
    name: 'HomeView'
})

const props = defineProps({})
const topBanner = ref('home2')

const displayRailSystemSelector = ref(true)
const displayStationSelector = ref(true)
const store = useStore()
const handleChangeStation = (station) => {
    console.log('change station', station)
    store.dispatch('preference/setCurrentStation', station)
}
const handleCloseRailSystemSelector = () => {
    displayRailSystemSelector.value = false
}
const handleCloseStationSelector = () => {
    displayStationSelector.value = false
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

.q-tab-panel {
    background-color: darkseagreen;
    padding: 5px 10px;
}
</style>
