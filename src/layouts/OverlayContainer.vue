<template>
    <transition name="right-in-right-out">
        <div class="full-height full-width container" style=" z-index: 1000;overflow: hidden;"
             v-if="topComponent||secondTopComponent">
            <transition name="right-in-right-out">
                <div class="full-height full-width container" style=" z-index: 1000;overflow: hidden;"
                     v-if="topComponent">
                    <component :is="topComponent" :key="path"/>
                </div>
            </transition>
            <transition name="right-in">
                <div class="full-height full-width container" style=" z-index: 950;" v-if="secondTopComponent">
                    <component :is="secondTopComponent" :key="path"/>
                </div>
            </transition>
        </div>
    </transition>

</template>

<script setup>

import {computed, defineAsyncComponent, onMounted, ref, shallowRef, watch} from "vue";
import {useStore} from "vuex";

const topComponent = shallowRef(null)
const secondTopComponent = shallowRef(null)
const path = ref(null)
const store = useStore()
const overlayComponentStack = computed(() => store.getters['application/overlayComponentStack'])
const shownComponent = computed(() => store.getters["application/topOverlayComponent"])
watch(shownComponent, (newVal, oldVal) => {
    if (newVal && newVal.componentName) {
        console.log('set shown component', newVal)
        try {
            const stackSize = overlayComponentStack.value.length;
            if (stackSize > 1) {
                const lastComponentName = overlayComponentStack.value[stackSize - 2].componentName
                if (lastComponentName) {
                    secondTopComponent.value = defineAsyncComponent(() => import(`../components/${lastComponentName}.vue`))
                }
                topComponent.value = null
                setTimeout(() => {
                    topComponent.value = defineAsyncComponent(() => import(`../components/${newVal.componentName}.vue`))
                }, 0)
            } else {
                topComponent.value = defineAsyncComponent(() => import(`../components/${newVal.componentName}.vue`))
                secondTopComponent.value = null
            }
        } catch {
            console.warn(`component not found:${newVal.componentName}`)
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
