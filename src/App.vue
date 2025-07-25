<template>
    <router-view/>
    <OverlayContainer/>
</template>

<script setup>
import {onMounted} from "vue";
import {useQuasar} from "quasar";
import OverlayContainer from "layouts/OverlayContainer.vue";
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// 修复 Leaflet 默认图标路径（Vite/Webpack下会丢失）
import marker2x from 'leaflet/dist/images/marker-icon-2x.png'
import marker from 'leaflet/dist/images/marker-icon.png'
import shadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: marker2x,
    iconUrl: marker,
    shadowUrl: shadow,
})
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
