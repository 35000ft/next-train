<template>
    <transition name="right-in-right-out">
        <div class="full-height full-width container" style=" z-index: 1000;overflow: hidden;"
             v-back="handleBack"
             v-if="firstComponent||secondComponent">
            <transition name="right-in-right-out">
                <div class="full-height full-width container" style=" z-index: 1000;overflow: hidden;"
                     v-if="firstComponent&&showComponentKey===0">
                    <component :is="firstComponent" :key="firstComponentId"/>
                </div>
            </transition>
            <transition name="right-in">
                <div class="full-height full-width container" style=" z-index: 1000;"
                     v-if="secondComponent&&showComponentKey===1">
                    <component :is="secondComponent" :key="secondComponentId"/>
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
const firstComponentId = shallowRef(null)
const secondComponentId = shallowRef(null)
const store = useStore()
const initTime = ref(null)
const overlayComponentStack = computed(() => store.getters['application/overlayComponentStack'])
const shownComponent = computed(() => store.getters["application/topOverlayComponent"])
watch(shownComponent, (newVal, oldVal) => {
    if (newVal && newVal.componentName) {
        try {
            const stackSize = overlayComponentStack.value.length;
            if (stackSize > 1) {
                const lastComponent = overlayComponentStack.value[stackSize - 2]
                if (lastComponent) {
                    if (showComponentKey.value === 0) {
                        // Now component1 is shown, change to component2
                        showComponentKey.value = 1
                        setTimeout(() => {
                            secondComponentId.value = newVal.id
                            firstComponentId.value = lastComponent.id
                            secondComponent.value = defineAsyncComponent(() => import(`../components/${newVal.componentName}.vue`))
                            firstComponent.value = defineAsyncComponent(() => import(`../components/${lastComponent.componentName}.vue`))
                        }, 0)
                    } else if (showComponentKey.value === 1) {
                        // Now component2 is shown, change to component1
                        showComponentKey.value = 0
                        setTimeout(() => {
                            firstComponentId.value = newVal.id
                            secondComponentId.value = lastComponent.id
                            firstComponent.value = defineAsyncComponent(() => import(`../components/${newVal.componentName}.vue`))
                            secondComponent.value = defineAsyncComponent(() => import(`../components/${lastComponent.componentName}.vue`))
                        }, 0)
                    }
                }
            } else {
                showComponentKey.value = 0
                firstComponentId.value = newVal.id
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

onMounted(() => {
    const time = new Date().getTime();
    console.log('OverlayContainer init, ', time)
    initTime.value = time
})
const handleBack = ({from, to}) => {
    console.log('from:' + from, 'to:' + to, shownComponent.value,)
    store.dispatch('application/popOverlay', {id: shownComponent.value.id})
}
</script>

<style scoped>
.container {
    top: 0;
    position: absolute;
}
</style>
