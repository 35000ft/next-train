<template>
    <div>
        <!-- 输入框 -->
        <q-input
            v-if="showInput"
            v-model="modelValueFormatted"
            :label="multiple ? '坐标列表' : '坐标 (纬度, 经度)'"
            readonly
        />

        <!-- 小地图 -->
        <div v-if="showInput" style="height: 250px; margin-top: 8px; cursor: pointer;">
            <l-map
                v-model:zoom="zoomSmall"
                :center="centerSmall"
                style="height: 100%; width: 100%;"
                @click="openDialog"
            >
                <l-tile-layer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                <l-marker
                    v-for="(coord, idx) in coordsParsed"
                    :key="idx"
                    :lat-lng="coord"
                >
                    <l-popup v-if="multiple">{{ idx + 1 }}</l-popup>
                </l-marker>
            </l-map>
        </div>

        <!-- 大地图 -->
        <q-dialog v-model="showBigMapDialog" persistent maximized>
            <div style="width: 100vw; height: 100vh;">
                <l-map
                    v-model:zoom="zoomLarge"
                    :center="centerLarge"
                    style="height: 100vh; width: 100vw;"
                    @click="handleMapClick"
                >
                    <l-tile-layer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />
                    <l-marker
                        v-for="(coord, idx) in coordsParsed"
                        :key="idx"
                        :lat-lng="coord"
                    >
                        <l-tooltip :options="{ permanent: true }">
                            {{ idx + 1 }}
                        </l-tooltip>
                    </l-marker>
                </l-map>

                <div
                    style="position: fixed;z-index: 1000;margin: 0;width: 100%;">
                    <q-card-actions align="right">
                        <q-btn flat icon="close" color="primary" @click="handleCloseBigMap"/>
                    </q-card-actions>
                    <div style="background: rgba(255, 255, 255, 0.8);">
                        <slot name="default"/>
                    </div>
                </div>
            </div>
        </q-dialog>
    </div>
</template>

<script setup>
import {ref, watch, computed} from "vue";
import {LMap, LTileLayer, LMarker, LPopup, LTooltip} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";

const props = defineProps({
    modelValue: [String, Array],
    readonly: Boolean,
    multiple: {type: Boolean, default: false},
    showInput: {type: Boolean, default: false},
    format: {type: String, default: "lat-lon"},
    display: {type: Boolean, default: false}
});
const emit = defineEmits(["update:modelValue", "close"]);

const showBigMapDialog = ref(false);

const modelValueFormatted = ref(
    props.multiple ? JSON.stringify(props.modelValue || []) : props.modelValue || ""
);

watch(
    () => props.modelValue,
    () => {
        modelValueFormatted.value = props.multiple
            ? JSON.stringify(props.modelValue || [])
            : props.modelValue || "";
    },
    {deep: true}
);

function parseCoordinates(value, format) {
    if (!value) return null;
    const parts = value.split(",").map((p) => p.trim());
    if (parts.length !== 2) return null;
    let [lat, lon] = parts.map(Number);
    if (isNaN(lat) || isNaN(lon)) return null;
    if (format === "lon-lat") [lat, lon] = [lon, lat];
    return [lat, lon];
}

function formatCoordinates(latlng, format) {
    const lat = latlng.lat.toFixed(6);
    const lon = latlng.lng.toFixed(6);
    return format === "lon-lat" ? `${lon}, ${lat}` : `${lat}, ${lon}`;
}

function handleMapClick(e) {
    if (props.readonly) return;
    const {latlng} = e;
    const value = formatCoordinates(latlng, props.format);
    if (props.multiple) {
        const arr = Array.isArray(props.modelValue) ? [...props.modelValue, value] : [value];
        emit("update:modelValue", arr);
    } else {
        emit("update:modelValue", value);
        handleCloseBigMap();
    }
}


function openDialog() {
    if (props.readonly) return;
    showBigMapDialog.value = true;
}

function handleCloseBigMap() {
    emit("close");
    if (!props.multiple) {
        showBigMapDialog.value = false;
    }
}

const coordsParsed = computed(() => {
    const coords = props.multiple
        ? props.modelValue || []
        : props.modelValue
            ? [props.modelValue]
            : [];
    return coords.map((c) => parseCoordinates(c, props.format)).filter(Boolean);
});

// 小地图默认中心
const zoomSmall = ref(12);
const centerSmall = ref([32.3022, 118.2533]);

// 大地图默认中心
const zoomLarge = ref(12);
const centerLarge = ref([32.3022, 118.2533]);

watch(coordsParsed, (coords) => {
    if (coords.length > 0) {
        centerSmall.value = coords[0];
        centerLarge.value = coords[0];
    }
});

watch(() => props.display, (val) => {
    if (val) openDialog();
    else showBigMapDialog.value = false;
});
</script>
<style scoped>


</style>
