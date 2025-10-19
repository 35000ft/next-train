<template>
    <div v-if="false"></div>
</template>
<script setup>
import {onMounted} from "vue";
import {useRoute} from "vue-router";
import {useStore} from "vuex";

const route = useRoute()
const store = useStore()

onMounted(() => {
    const meta = route.meta
    if (typeof meta.componentName === "string") {
        store.dispatch('application/pushOverlay', {
            component: {
                componentName: meta.componentName,
                params: route.params,
            }
        })
    }
})
</script>
<style scoped>

</style>
