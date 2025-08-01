<template>
    <div>
        <q-input
            v-if="showInput"
            v-model="modelValueFormatted"
            :label="multiple ? '坐标列表' : '坐标 (纬度, 经度)'"
            readonly
        />
        <!-- 小地图 -->
        <div
            v-if="showInput"
            ref="mapContainerSmall"
            style="height: 250px; margin-top: 8px; cursor: pointer;"
            @click="openDialog"
        />
    </div>
    <!-- 大地图对话框 -->
    <q-dialog v-model="showBigMapDialog" persistent maximized>
        <div style="width: 100vw; height: 100vh;">
            <div
                ref="mapContainerLarge"
                style="width: 100%; height: 100vh;position: fixed;z-index: 0;"
            />
            <q-card-actions align="right">
                <q-btn flat label="关闭" color="primary" @click="handleCloseBigMap"/>
            </q-card-actions>
        </div>
    </q-dialog>
</template>

<script setup>
import {ref, onMounted, watch, nextTick} from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const props = defineProps({
    modelValue: [String, Array],
    readonly: Boolean,
    multiple: {
        type: Boolean,
        default: false
    },
    showInput: {
        type: Boolean,
        default: false
    },
    format: {
        type: String,
        default: 'lat-lon'
    },
    display: {
        type: Boolean,
        default: false
    }
});
const emit = defineEmits(['update:modelValue', 'close']);

// 小地图 / 大地图容器
const mapContainerSmall = ref(null);
const mapContainerLarge = ref(null);

// 对话框开关
const showBigMapDialog = ref(false);


// Leaflet map 实例
let mapSmall = null;
let mapLarge = null;
let markersSmall = [];
let markersLarge = [];

const modelValueFormatted = ref(
    props.multiple
        ? JSON.stringify(props.modelValue || [])
        : props.modelValue || ''
);

watch(
    () => props.modelValue,
    () => {
        modelValueFormatted.value = props.multiple
            ? JSON.stringify(props.modelValue || [])
            : props.modelValue || '';
        refreshMarkers(mapSmall, markersSmall);
        if (mapLarge) refreshMarkers(mapLarge, markersLarge);
    },
    {deep: true}
);

function parseCoordinates(value, format) {
    if (!value) return null;
    const parts = value.split(',').map((p) => p.trim());
    if (parts.length !== 2) return null;
    let [lat, lon] = parts.map(Number);
    if (isNaN(lat) || isNaN(lon)) return null;
    if (format === 'lon-lat') [lat, lon] = [lon, lat];
    return L.latLng(lat, lon);
}

function handleCloseBigMap() {
    emit('close')
    if (!props.multiple) {
        showBigMapDialog.value = false
        mapLarge = null
    }
}

function formatCoordinates(latlng, format) {
    const lat = latlng.lat.toFixed(6);
    const lon = latlng.lng.toFixed(6);
    return format === 'lon-lat' ? `${lon}, ${lat}` : `${lat}, ${lon}`;
}

function refreshMarkers(map, markers) {
    markers.forEach((m) => map.removeLayer(m));
    markers.length = 0;

    const coords = props.multiple
        ? props.modelValue || []
        : props.modelValue
            ? [props.modelValue]
            : [];

    coords.forEach((coord, idx) => {
        const latlng = parseCoordinates(coord, props.format);
        if (latlng) {
            const marker = L.marker(latlng, {
                icon: L.divIcon({
                    className: 'marker-label',
                    html: props.multiple
                        ? `<div style="background:#1976d2;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;">${idx + 1}</div>`
                        : ''
                })
            }).addTo(map);
            markers.push(marker);
        }
    });

    if (coords.length) {
        map.setView(parseCoordinates(coords[0], props.format), 12);
    }
}

function initMap(container, markersArr, clickHandler) {
    const map = L.map(container).setView([32.3022, 118.2533], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    refreshMarkers(map, markersArr);

    if (!props.readonly) {
        map.on('click', clickHandler);
    }

    return map;
}

function handleMapClick(e, markersArr, targetModel) {
    const latlng = e.latlng;
    const value = formatCoordinates(latlng, props.format);
    if (props.multiple) {
        const arr = Array.isArray(props.modelValue)
            ? [...props.modelValue, value]
            : [value];
        emit('update:modelValue', arr);
    } else {
        emit('update:modelValue', value)
        handleCloseBigMap()
    }
}

function openDialog() {
    if (props.readonly) return;
    showBigMapDialog.value = true;

    nextTick(() => {
        if (!mapLarge) {
            mapLarge = initMap(
                mapContainerLarge.value,
                markersLarge,
                (e) => handleMapClick(e, markersLarge, 'large')
            );
        }
        mapLarge.invalidateSize();
    });
}

watch(() => props.display, () => {
    if (props.display) {
        openDialog()
    } else {
        showBigMapDialog.value = false
        mapLarge = null
    }
})

onMounted(() => {
    if (props.showInput) {
        mapSmall = initMap(
            mapContainerSmall.value,
            markersSmall,
            () => openDialog() // 小地图点击只打开大地图
        );
    }
})


</script>

<style scoped>
.leaflet-container {
    width: 100%;
    height: 100%;
}

.marker-label {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
