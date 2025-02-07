<template>
    <q-popup-proxy>
        <q-banner style="width: 90%;">
            <div
                style="font-size: 20px;font-weight:bold;text-align: center;height: 30px;padding-top: 10px;color: var(--q-primary-d);">
                换乘指引
            </div>
            <div
                style="width: 100%;height: 100%;overflow: hidden;">
                <img :src="imgUrl" alt="" class="quick-station-view-img">
            </div>
        </q-banner>
    </q-popup-proxy>
</template>
<script setup>
import {onMounted, ref} from "vue";
import {useStore} from "vuex";

const store = useStore()
const imgUrl = ref(null)
const props = defineProps({
    transferInfo: {
        type: Object
    }
})
onMounted(() => {
    if (!props.transferInfo) return
    const _transferInfo = props.transferInfo
    store.dispatch('resource/checkResourceExist', {path: `quick-station-view/${_transferInfo.fromLineId}_${_transferInfo.depStationId}.png`})
        .then(path => {
            imgUrl.value = path
        })
        .catch(e => {
        })
})
</script>

<style scoped>
.quick-station-view-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
</style>
