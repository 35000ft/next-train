<template>
    <q-popup-proxy>
        <q-banner style="width: 90%;">
            <div
                style="font-size: 20px;font-weight:bold;text-align: center;height: 30px;padding-top: 10px;color: var(--q-primary-d);margin-bottom: 10px;">
                运营讯息
            </div>
            <div style="max-height: 50vh;overflow-y: auto">
                <div>{{ operationMsg.message }}</div>
                <div style="display: flex;justify-content: space-between;margin-top: 5px;" class="row">
                    <span style="color: var(--q-primary)" v-show="operationMsg.sourceUrl" class="col-4">
                        <a :href="operationMsg.sourceUrl" target="_blank">原文链接</a>
                    </span>
                    <span style="font-weight:bold;text-align: right;" class="col-8">
                       来源: {{ operationMsg.sourceName }}
                    </span>
                </div>
                <div style="font-size: 12px">生效时间: {{ operationMsg.validTime.format('YYYY-MM-DD HH:mm:ss') }} ~
                    {{ operationMsg.expireTime.format('YYYY-MM-DD HH:mm:ss') }}
                </div>
            </div>
        </q-banner>
    </q-popup-proxy>
</template>
<script setup>
import {onMounted, ref} from "vue";
import {useStore} from "vuex";

const store = useStore()
const props = defineProps({
    operationMsg: {
        type: Object
    }
})
onMounted(() => {

})
</script>

<style scoped>
.quick-station-view-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
</style>
