<template>
    <bottom-modal
        name="station-realtime"
        :display="display" @close="handleClose" content-height="60vh" :on-move-up="onMoveUp"
        :after-close="afterCloseFunc">
        <StationRealtimeView :current-station-id-prop="stationId" :enable-op-msg="false" :in-modal="true"
                             @close="handleClose"/>
    </bottom-modal>
</template>

<script setup>
import {computed, ref, watch} from "vue";
import BottomModal from "components/BottomModal.vue";
import StationRealtimeView from "components/StationRealtimeView.vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";

const store = useStore()
const display = ref(false)
const shownStationId = computed(() => store.getters["application/shownStationId"])
const afterCloseFunc = ref(null)
const handleClose = (afterClose) => {
    if (typeof afterClose === "function") {
        afterCloseFunc.value = afterClose
    }
    store.dispatch('application/closeStationRealtimeModal')
    display.value = false
}
const router = useRouter()
const stationId = ref(null)
watch(shownStationId, (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
        stationId.value = newVal
        display.value = true
    }
})

const onMoveUp = () => {
    handleClose()
    router.push({name: 'station-detail', params: {id: stationId.value}})
}


</script>

<style scoped>

</style>
