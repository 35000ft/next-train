<template>
    <transition name="right-in-right-out">
        <div class="full-height full-width container" style=" z-index: 1000;" v-if="topComponent">
            <component :is="topComponent" :key="path"/>
        </div>
    </transition>
    <transition name="right-in-right-out">
        <div class="full-height full-width container" style=" z-index: 950;" v-if="secondTopComponent">
            <component :is="secondTopComponent" :key="path"/>
        </div>
    </transition>

</template>

<script setup>

import {computed, defineAsyncComponent, ref, shallowRef, watch} from "vue";
import {useStore} from "vuex";

const topComponent = shallowRef(null);
const secondTopComponent = shallowRef(null);
const path = ref(null)
const store = useStore()
const shownComponent = computed(() => store.getters["application/topOverlayComponent"])

watch(shownComponent, (newVal, oldVal) => {
    if (newVal && newVal.componentName) {
        try {
            topComponent.value = defineAsyncComponent(() => import(`../components/${newVal.componentName}.vue`))
        } catch {
            console.warn(`component not found:${newVal.componentName}`)
            store.dispatch('application/popOverlay', {componentName: newVal.componentName})
        }
    } else {
        topComponent.value = null
    }
})

</script>

<style scoped>
.container {
    top: 0;
    position: absolute;
}
</style>
