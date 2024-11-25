<template>
    <bottom-modal :display="display" @close="handleClose" content-height="40vh">
        <StationRealtimeView :current-station-id-prop="stationId"/>
    </bottom-modal>
</template>

<script setup>
import {computed, ref, watch} from "vue";
import BottomModal from "components/BottomModal.vue";
import StationRealtimeView from "components/StationRealtimeView.vue";
import {useStore} from "vuex";

const store = useStore()
const display = ref(false)
const shownStationId = computed(() => store.getters["application/shownStationId"])
const handleClose = () => {
    store.dispatch('application/closeStationRealtimeModal')
    display.value = false
}
const stationId = ref(null)
watch(shownStationId, (newVal, oldVal) => {
    console.log('shown id change', newVal)
    if (newVal && newVal !== oldVal) {
        stationId.value = newVal
        display.value = true
    }
})

</script>

<style scoped>

</style>
