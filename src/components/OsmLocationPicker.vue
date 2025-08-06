<template>
    <div>
        <q-input
            v-model="modelValueFormatted"
            label="坐标 (纬度, 经度)"
            readonly
        />
        <div ref="mapContainer" style="height: 250px; margin-top: 8px;"/>
    </div>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const props = defineProps({
    modelValue: String,
    readonly: Boolean,
    format: {
        type: String,
        default: "lat-lon"
    }
});

const emit = defineEmits(['update:modelValue']);

const mapContainer = ref(null);
let map = null;
let marker = null;

const modelValueFormatted = ref(props.modelValue || '');

watch(() => props.modelValue, (val) => {
    modelValueFormatted.value = val || '';
    if (val && map && !props.readonly) {
        const [lat, lng] = val.split(',').map(Number);
        const latlng = L.latLng(lat, lng);
        marker?.setLatLng(latlng);
        map.setView(latlng, 15);
    }
});

/**
 * Parses a coordinate string based on the format prop.
 * @param {string} value - The coordinate string.
 * @param {string} format - The coordinate string.
 * @returns {L.LatLng | null} - The Leaflet LatLng object or null if parsing fails.
 */
function parseCoordinates(value, format) {
    if (!value) {
        return null;
    }
    const parts = value.split(',').map(part => part.trim());
    if (parts.length !== 2) {
        return null;
    }
    const [latStr, lonStr] = parts;
    const lat = Number(latStr);
    const lon = Number(lonStr);
    if (isNaN(lat) || isNaN(lon)) {
        return null;
    }

    if (format === 'lat-lon') {
        return L.latLng(lat, lon);
    } else if (format === 'lon-lat') {
        return L.latLng(lon, lat); // Swapping them for lon-lat format
    }
    return null;
}

/**
 * Formats a LatLng object into a string based on the format prop.
 * @param {L.LatLng} latlng - The Leaflet LatLng object.
 * @param format lan-lon lon-lat
 * @returns {string} - The formatted coordinate string.
 */
function formatCoordinates(latlng, format) {
    const lat = latlng.lat.toFixed(6);
    const lon = latlng.lng.toFixed(6);
    if (format === 'lon-lat') {
        return `${lon}, ${lat}`;
    }
    // Default to lat-lon
    return `${lat}, ${lon}`;
}

onMounted(() => {
    map = L.map(mapContainer.value).setView([34.0522, 118.2437], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    if (props.modelValue) {
        const latlng = parseCoordinates(props.modelValue, props.format);
        console.log('latlng', latlng)
        if (latlng) {
            marker = L.marker(latlng).addTo(map);
            map.setView(latlng, 15);
        }
    }

    if (!props.readonly) {
        map.on('click', (e) => {
            const latlng = e.latlng;
            const value = formatCoordinates(latlng, props.format);
            marker?.setLatLng(latlng) || (marker = L.marker(latlng).addTo(map));
            emit('update:modelValue', value);
        });
    }
});

watch(props, (newVal, oldVal) => {
    const latlng = parseCoordinates(props.modelValue, props.format);
    if (latlng) {
        marker = L.marker(latlng).addTo(map);
        map.setView(latlng, 15);
    }
})

</script>

<style scoped>
/* Leaflet 默认样式补丁（修复图标不显示问题） */
.leaflet-container {
    width: 100%;
    height: 100%;
}

.leaflet-control-attribution {
    font-size: 10px;
}
</style>
