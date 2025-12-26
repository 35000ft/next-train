<template>
    <q-page padding class="row" style="gap: 10px;margin-top: 50px;">
        <div style="max-width: 500px;" class="col-12 col-sm-4">
            <div class="row items-center justify-between q-mb-md">
                <div class="text-h5 text-primary" style="font-weight: bold;">线网管理</div>
                <q-btn label="新建线网" color="green" @click="openCreateRailsystem"/>
            </div>
            <q-card flat bordered class="q-pa-md q-mb-md">
                <q-item-label header>线网列表</q-item-label>

                <q-tree
                    ref="railsystemTree"
                    :nodes="railsystems"
                    v-if="railsystems?.length>0"
                    node-key="id"
                    :lazy-load="true"
                    @lazy-load="loadRailLines"
                    label-key="label"
                    default-expand-all
                >
                    <template v-slot:default-header="props">
                        <div class="row items-center q-gutter-sm" style="width: 100%;justify-content: space-around;">
                            <div class="col-6">{{ props.node.label }}</div>
                            <div class="col-5" style="text-align: right;">
                                <q-btn
                                    flat
                                    dense
                                    icon="fa fa-plus"
                                    color="green"
                                    size="sm"
                                    @click.stop="_createLine(props.node)"
                                />
                                <q-btn
                                    flat
                                    dense
                                    color="primary"
                                    icon="fa fa-pen-to-square"
                                    size="sm"
                                    @click.stop="editNode(props.node)"
                                />
                            </div>
                        </div>
                    </template>
                    <template v-slot:header-line="{ node }">
                        <div @click="toggleLine(node)" class="row q-gutter-sm " style="width: 100%">
                            <LineIcon :line="node.lineData"/>
                            <q-space/>
                            <div>
                                <q-btn
                                    flat
                                    dense
                                    icon="fa fa-plus"
                                    color="green"
                                    size="sm"
                                    @click.stop="_createStation(node)"
                                />
                                <q-btn
                                    size="small"
                                    flat
                                    dense
                                    color="primary"
                                    icon="fa fa-pen-to-square"
                                    @click.stop.prevent="editLine(node)"
                                />
                                <q-btn size="small"
                                       flat
                                       dense
                                       icon="departure_board"
                                       color="primary"
                                       @click.stop.prevent="showScheduleManageView(node)"
                                />
                            </div>
                        </div>
                    </template>
                    <template v-slot:header-station="{ node }">
                        <div class="row items-center q-gutter-sm" style="width: 100%;">
                            <div
                                style="color: var(--q-primary); font-weight: bold; font-size: 18px;">
                                {{ node?.stationData?.name }}
                            </div>
                            <q-space/>
                            <q-btn
                                size="sm"
                                flat
                                dense
                                color="primary"
                                icon="fa fa-pen-to-square"
                                @click.stop.prevent="editStation(node)"
                            />
                        </div>
                    </template>
                </q-tree>
                <div v-if="railsystems?.length===0">
                    <h5 style="color: grey">登入后检视可管理的线网</h5>
                </div>
            </q-card>
        </div>

        <q-dialog v-model="showLineForm" @close="()=>{selectedLine=null;showLineForm=false}">
            <line-form :initial="selectedLine" @saved="reloadLines"/>
        </q-dialog>
        <q-dialog v-model="showStationForm">
            <station-form :initial="selectedStation" @close="()=>{showStationForm=false;selectedStation=null}"/>
        </q-dialog>

        <!-- 弹出创建/编辑线网 -->
        <q-dialog v-model="showRailsystemForm">
            <railsystem-form :initial="selectedRailsystem" @saved="onRailsystemSaved"/>
        </q-dialog>

    </q-page>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import RailsystemForm from 'components/form/RailsystemForm.vue';
import LineForm from 'components/form/LineForm.vue';
import {fetchLines, listRailsystem} from 'src/apis/railsystem';
import {useStore} from "vuex";
import {useQuasar} from "quasar";
import LineIcon from "components/LineIcon.vue";
import StationForm from "components/form/StationForm.vue";

const $q = useQuasar()
const railsystems = ref([]);
const loading = ref(true);
const selectedRailsystem = ref(null);
const selectedLine = ref(null);
const selectedStation = ref(null);
const lines = ref([]);

const showRailsystemForm = ref(false);
const showLineForm = ref(false);
const showStationForm = ref(false);
const store = useStore()

function openCreateRailsystem() {
    selectedRailsystem.value = null;
    showRailsystemForm.value = true;
}

const railsystemTree = ref(null);

async function editRailsystem(node) {
    if (node?.railsystem) {
        selectedRailsystem.value = node?.railsystem
        showRailsystemForm.value = true
        selectedLine.value = null
        lines.value = await fetchLines(node?.railsystem?.code, true)
    }
}

function _createLine(node) {
    showLineForm.value = true
    selectedLine.value = {
        railsystem: node.railsystem
    }
}

function toggleLine(node) {
    if (node.children.length) {
        if (node.isExpanded) {
            railsystemTree.value.collapseNode(node.id);
        } else {
            railsystemTree.value.expandNode(node.id);
        }
    }
}

function _createStation(node) {
    selectedStation.value = {
        railsystem: node.railsystem,
        line: node.lineData,
    }
    showStationForm.value = true
}


async function loadRailsystems() {
    const rawList = await listRailsystem('', true);

    railsystems.value = rawList.map(rs => ({
        id: `rs_${rs.id}`,
        label: rs.name,
        railsystemCode: rs.code,
        railsystem: rs,
        lazy: true,
    }));
}

function editNode(node) {
    if (node.isLine) {
        editLine(node)
    } else {
        editRailsystem(node);
    }
}

const stationToNode = (s) => {
    return {
        id: `station_${s.id}`,
        label: s.name,
        stationData: s,
        lazy: false,
        children: [],
        header: 'station',
    }
}

async function loadRailLines({node, key, done, fail}) {
    try {
        const lines = await store.dispatch('railsystem/getRailSystemLines', {
            railsystemCode: node.railsystemCode,
            latest: true
        })
        const childNodes = lines.map(line => ({
            id: `line_${line.id}`,
            label: line.name,
            lineData: line,
            railsystem: node?.railsystem,
            lazy: false,
            children: line?.stations ? line.stations.map(stationToNode) : [],
            header: 'line',
        }));
        done(childNodes);
    } catch (err) {
        fail();
    }
}


function editLine(node) {
    showLineForm.value = true
    selectedLine.value = {
        ...node?.lineData,
        railsystem: node?.railsystem
    }
}

function showScheduleManageView(node) {
    const params = {
        line: node?.lineData,
    }
    store.dispatch('application/pushOverlay', {
        component: {componentName: "LineScheduleManageView", uri: '/manage/line-schedule', props: params}
    })
}

function editStation(node) {
    showStationForm.value = true
    selectedStation.value = node.stationData;
}

async function reloadLines() {
    if (selectedRailsystem.value) {
        lines.value = await fetchLines(selectedRailsystem.value.code, true)
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
