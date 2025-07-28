<template>
    <!-- 左侧抽屉 -->
    <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        side="left"
        behavior="mobile"
        bordered
        swipe-open
        @hide="onHide"
        :width="200"
        :breakpoint="600"
    >
        <q-list>
            <q-item-label
                header
                style="background-color:var(--q-primary);color: #ffffff"
            >
                更多
            </q-item-label>
            <q-item clickable v-ripple>
                <q-item-section>Author: @雲上</q-item-section>
            </q-item>
        </q-list>
    </q-drawer>
</template>
<script setup>
import {onMounted, ref, watch} from 'vue'
import {useStore} from "vuex";

const leftDrawerOpen = ref(false)
const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    }
})
onMounted(() => {
    if (typeof props?.open === "boolean") {
        leftDrawerOpen.value = props.open
    }
})
const store = useStore()
const onHide = () => {
    store.commit('application/SET_SHOW_LEFT_DRAWER', false)
}
watch(props, (newVal, oldVal) => {
    if (typeof newVal?.open === "boolean") {
        leftDrawerOpen.value = newVal.open
    }
})
</script>
<style scoped>

</style>
