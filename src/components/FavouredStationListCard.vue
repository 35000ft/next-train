<template>
    <div style="display: flex;flex-direction: column; height: 100%;">
        <div class="header-wrapper">常用车站</div>
        <div class="content-wrapper scroll">
            <div class="row station-row" v-for="station in stations" :key="station.id"
                 @click="handleViewStation(station)">
                <div class="col-8 station-name">
                    <div v-overflow-auto-scroll>
                        {{ station.name }}
                    </div>
                </div>
                <div class="col-4 icons">
                    <span v-if="station.favourite">
                         <q-icon style="color:var(--q-favourite);" name="star"/>
                    </span>
                    <span v-if="station.history">
                         <q-icon style="color:var(--q-grey)" name="history"/>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import {useStore} from "vuex";
import {computed} from "vue";
import {arr2Map} from "src/utils/array-utils";
import _ from "lodash";
import {useRouter} from "vue-router";

const store = useStore()
const router = useRouter()

const stations = computed(() => {
    const historyStations = arr2Map(store.getters['preference/historyStations'], 'id')
    const favouredStations = store.getters['preference/favouriteStations']
    const resultMap = new Map()
    for (let id of favouredStations.keys()) {
        const s = _.clone(favouredStations.get(id))
        s.favourite = true
        resultMap.set(id, s)
    }
    for (let id of historyStations.keys()) {
        if (resultMap.has(id)) {
            resultMap.get(id).history = true
        } else {
            const s = _.clone(historyStations.get(id))
            s.history = true
            resultMap.set(id, s)
        }
    }
    return Array.from(resultMap.values())
})
const handleViewStation = (station) => {
    if (station && station.id) {
        router.push({name: 'station-detail', params: {id: station.id}})
    }
}
</script>
<style scoped>
.content-wrapper {
}

.header-wrapper {
    height: 20px;
    color: var(--q-grey);
}

.station-row {
    border-bottom: 1px solid var(--q-grey-2);
}

.icons {
    text-align: right;
}

.station-name {
    font-weight: bold;
    color: var(--q-grey);
}
</style>
