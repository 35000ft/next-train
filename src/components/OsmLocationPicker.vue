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
    readonly: Boolean
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

onMounted(() => {
    map = L.map(mapContainer.value).setView([34.0522, 118.2437], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    if (props.modelValue) {
        const [lat, lng] = props.modelValue.split(',').map(Number);
        const latlng = L.latLng(lat, lng);
        marker = L.marker(latlng).addTo(map);
        map.setView(latlng, 15);
    }

    if (!props.readonly) {
        map.on('click', (e) => {
            const latlng = e.latlng;
            const value = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
            marker?.setLatLng(latlng) || (marker = L.marker(latlng).addTo(map));
            emit('update:modelValue', value);
        });
    }
});
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
