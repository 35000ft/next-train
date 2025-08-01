<template>
    <q-page padding>
        <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">线路线网管理</div>
            <q-btn label="新建线网" color="primary" @click="openCreateRailsystem"/>
        </div>

        <q-card flat bordered class="q-pa-md q-mb-md">
            <q-item-label header>线网列表</q-item-label>
            <q-list>
                <q-item
                    v-for="rs in railsystems"
                    :key="rs.code"
                    clickable
                    @click="editRailsystem(rs)"
                >
                    <q-item-section>{{ rs.name }}</q-item-section>
                </q-item>
            </q-list>
        </q-card>

        <q-card v-if="selectedRailsystem" flat bordered class="q-pa-md q-mb-md">
            <q-item-label header>线路列表（{{ selectedRailsystem.name }}）</q-item-label>
            <q-list>
                <q-item
                    v-for="line in lines"
                    :key="line.id"
                    clickable
                    @click="selectLine(line)"
                >
                    <q-item-section>{{ line.name }}</q-item-section>
                </q-item>
            </q-list>
        </q-card>

        <q-card v-if="selectedLine" flat bordered class="q-pa-md q-mb-md">
            <line-form :railsystem-id="selectedRailsystem.id" :initial="selectedLine" @saved="reloadLines"/>
        </q-card>

        <q-card v-if="selectedLine" flat bordered class="q-pa-md">
            <station-form :line-id="selectedLine.id"/>
        </q-card>

        <!-- 弹出创建/编辑线网 -->
        <q-dialog v-model="showRailsystemForm">
            <railsystem-form :initial="editingRailsystem" @saved="onRailsystemSaved"/>
        </q-dialog>
    </q-page>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import RailsystemForm from 'components/RailsystemForm.vue';
import LineForm from 'components/LineForm.vue';
import StationForm from 'components/StationForm.vue';
import {listRailsystem, fetchLines} from 'src/apis/railsystem';

const railsystems = ref([]);
const selectedRailsystem = ref(null);
const selectedLine = ref(null);
const lines = ref([]);

const showRailsystemForm = ref(false);
const editingRailsystem = ref(null);

function openCreateRailsystem() {
    editingRailsystem.value = null;
    showRailsystemForm.value = true;
}

function editRailsystem(rs) {
    editingRailsystem.value = rs;
    showRailsystemForm.value = true;
    selectRailsystem(rs);
}

async function loadRailsystems() {
    railsystems.value = await listRailsystem();
}

async function selectRailsystem(rs) {
    selectedRailsystem.value = rs;
    selectedLine.value = null;
    lines.value = await fetchLines(rs.code);
}

function selectLine(line) {
    selectedLine.value = line;
}

async function reloadLines() {
    if (selectedRailsystem.value) {
        lines.value = await fetchLines(selectedRailsystem.value.code);
    }
}

function onRailsystemSaved() {
    showRailsystemForm.value = false;
    loadRailsystems();
}

onMounted(() => {
    loadRailsystems();
});
</script>
