<template>
    <transition name="right-in-right-out">
        <div class="full-height full-width container" style=" z-index: 1000;overflow: hidden;"
             v-if="firstComponent||secondComponent">
            <transition name="right-in-right-out">
                <div class="full-height full-width container" style=" z-index: 1000;overflow: hidden;"
                     v-if="firstComponent&&showComponentKey===0">
                    <component :is="firstComponent" :key="path"/>
                </div>
            </transition>
            <transition name="right-in">
                <div class="full-height full-width container" style=" z-index: 1000;"
                     v-if="secondComponent&&showComponentKey===1">
                    <component :is="secondComponent" :key="path"/>
                </div>
            </transition>
        </div>
    </transition>

</template>

<script setup>

import {computed, defineAsyncComponent, onMounted, ref, shallowRef, watch} from "vue";
import {useStore} from "vuex";

const showComponentKey = ref(null)
const firstComponent = shallowRef(null)
const secondComponent = shallowRef(null)
const path = ref(null)
const store = useStore()
const overlayComponentStack = computed(() => store.getters['application/overlayComponentStack'])
const shownComponent = computed(() => store.getters["application/topOverlayComponent"])
watch(shownComponent, (newVal, oldVal) => {
    if (newVal && newVal.componentName) {
        try {
            const stackSize = overlayComponentStack.value.length;
            if (stackSize > 1) {
                const lastComponentName = overlayComponentStack.value[stackSize - 2].componentName
                if (lastComponentName) {
                    if (showComponentKey.value === 0) {
                        // Now component1 is shown, change to component2
                        showComponentKey.value = 1
                        setTimeout(() => {
                            secondComponent.value = defineAsyncComponent(() => import(`../components/${newVal.componentName}.vue`))
                            firstComponent.value = defineAsyncComponent(() => import(`../components/${lastComponentName}.vue`))
                        }, 0)
                    } else if (showComponentKey.value === 1) {
                        // Now component2 is shown, change to component1
                        showComponentKey.value = 0
                        setTimeout(() => {
                            firstComponent.value = defineAsyncComponent(() => import(`../components/${newVal.componentName}.vue`))
                            secondComponent.value = defineAsyncComponent(() => import(`../components/${lastComponentName}.vue`))
                        }, 0)
                    }
                }
            } else {
                showComponentKey.value = 0
                firstComponent.value = defineAsyncComponent(() => import(`../components/${newVal.componentName}.vue`))
                secondComponent.value = null
            }
        } catch {
            console.warn(`component not found:${newVal.componentName}`)
        }
    } else {
        firstComponent.value = null
    }
})


</script>

<style scoped>
.container {
    top: 0;
    position: absolute;
}
</style>
