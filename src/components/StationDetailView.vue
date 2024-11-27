<template>
    <RightInRightOutView>
        <template v-slot:header-center>
            <div>{{ headerTitle }}</div>
        </template>
        <template v-slot:default>
            <div class="full-height">
                Station detail view
            </div>
        </template>
    </RightInRightOutView>

</template>

<script setup>
import RightInRightOutView from "components/OverlayView.vue";
import {computed, onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {useStore} from "vuex";

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
    let stationId = route.params.id
    loading.value = true
    let _station = await store.dispatch('railsystem/getStation', stationId)
    console.log('station', _station)
    //TODO
    if (_station) {
        loading.value = false
        station.value = _station
    }
}
</script>

<style scoped>

</style>
