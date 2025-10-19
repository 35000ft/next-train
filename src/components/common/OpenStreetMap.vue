<template>
    <l-map
        style="height: 500px; width: 100%;"
        :zoom="zoom"
        :center="centerPoint"
    >
        <l-tile-layer
            :url="tileUrl"
            :attribution="tileAttr"
        />
        <l-marker :lat-lng="centerPoint">
            <l-popup>{{ props.pointName }}</l-popup>
        </l-marker>
    </l-map>
</template>

<script setup>
import {computed} from 'vue'
import 'leaflet/dist/leaflet.css'
import {LMap, LTileLayer, LMarker, LPopup} from '@vue-leaflet/vue-leaflet'

const defaultLocation = [32.04386, 118.778934]
const props = defineProps({
    center: {
        type: Array || String || Object,
    },
    pointName: {
        type: String,
        default: 'Point on Map'
    },
    zoom: {
        type: Number,
        default: 12
    },
    tileUrl: {
        type: String,
        default: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    },
    tileAttr: {
        type: String,
        default: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
})
const centerPoint = computed(() => {
    if (!props.center) {
        return defaultLocation
    }
    if (props.center instanceof Array && props.center.length === 2) {
        return props.center
    } else if (typeof props.center === "string") {
        const temp = props.center.split(',')
        if (temp.length === 2) {
            const numberTemp = temp.map(it => Number(it)).filter(it => !isNaN(it))
            if (numberTemp.length === 2) {
                return numberTemp
            }
            console.warn('Invalid coord', props.center)
        }
    } else if (typeof props.center === "object") {
        if (!isNaN(Number(props.center.lon)) && !isNaN(Number(props.center.lat))) {
            return [Number(props.center.lat), Number(props.center.lon)]
        }
    }
    return defaultLocation
})
</script>
