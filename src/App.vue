<template>
    <router-view/>
    <OverlayContainer/>
</template>

<script setup>
import {onMounted} from "vue";
import {useQuasar} from "quasar";
import OverlayContainer from "layouts/OverlayContainer.vue";

defineOptions({
    name: 'App'
});
const $q = useQuasar()

onMounted(() => {
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--q-primary').trim()
    if (!$q.dark.isActive) {
        document.documentElement.style.setProperty('--q-primary-d', primaryColor);
    } else {
        document.documentElement.style.setProperty('--q-normal', '#ffffff');
        document.documentElement.style.setProperty('--q-background', '#3e3e3e');
        document.documentElement.style.setProperty('--q-background-grey', '#222222');
        document.documentElement.style.setProperty('--q-background-grey-2', '#222222');
        document.documentElement.style.setProperty('--q-grey', '#dcdcdc');
    }
})
</script>
