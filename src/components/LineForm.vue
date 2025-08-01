<template>
    <q-form @submit.prevent="submitForm">
        <q-input v-model="name" label="线路名称" required class="q-mb-md"/>

        <q-item-label class="q-mt-sm">车站列表</q-item-label>
        <draggable v-model="stations" item-key="id" tag="q-list" class="q-mb-md">
            <template #item="{ element, index }">
                <q-item>
                    <q-item-section>{{ element.name }}</q-item-section>
                    <q-item-section side>
                        <q-btn dense flat icon="delete" color="negative" @click="removeStation(index)"/>
                    </q-item-section>
                </q-item>
            </template>
        </draggable>

        <q-select
            v-model="selectedStation"
            :options="unselectedStations.map(s => ({ label: s.name, value: s }))"
            label="添加车站"
            emit-value
            map-options
            use-input
            fill-input
            clearable
            class="q-mb-md"
        />
        <q-btn label="添加车站" color="secondary" @click="addStation" :disable="!selectedStation" flat/>

        <q-btn label="保存线路" type="submit" color="primary" class="q-mt-md"/>
    </q-form>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';
import draggable from 'vuedraggable';
import {fetchLine, updateLine, createLine} from 'src/apis/railsystem';

const props = defineProps({
    railsystemId: {
        type: [String, Number],
        required: true
    },
    initial: Object
});
const emits = defineEmits(['saved']);

const name = ref('');
const id = ref(null);
const stations = ref([]); // 当前已选车站
const allStations = ref([]); // 所有可选车站（从 line.stations 加载）
const selectedStation = ref(null);

onMounted(async () => {
    if (props.initial?.id) {
        try {
            const line = await fetchLine(props.initial.id);
            id.value = line.id;
            name.value = line.name;
            stations.value = [...line.stations];
            allStations.value = [...line.stations];
        } catch (err) {
            console.error('加载线路失败:', err);
        }
    } else {
        name.value = '';
        id.value = null;
        stations.value = [];
        allStations.value = []; // 空也行
    }
});

const unselectedStations = computed(() =>
    allStations.value.filter(s => !stations.value.some(st => st.id === s.id))
);

function addStation() {
    if (selectedStation.value && !stations.value.find(s => s.id === selectedStation.value.id)) {
        stations.value.push(selectedStation.value);
        selectedStation.value = null;
    }
}

function removeStation(index) {
    stations.value.splice(index, 1);
}

async function submitForm() {
    try {
        const payload = {
            railsystem_id: props.railsystemId,
            name: name.value,
            station_ids: stations.value.map(s => s.id)
        };
        let saved;
        if (id.value) {
            saved = await updateLine(id.value, payload);
        } else {
            saved = await createLine(payload);
        }
        emits('saved', saved);
    } catch (err) {
        console.error('保存失败:', err);
    }
}
</script>

<style scoped>
.q-list {
    border: 1px solid #ccc;
    border-radius: 4px;
    min-height: 50px;
}
</style>
