<template>
    <q-page padding>
        <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">线路线网管理</div>
            <q-btn label="新建线网" color="primary" @click="openCreateRailsystem"/>
        </div>

        <q-card flat bordered class="q-pa-md q-mb-md">
            <q-item-label header>线网列表</q-item-label>

            <q-tree
                :nodes="railsystems"
                node-key="id"
                :lazy-load="true"
                @lazy-load="loadRailLines"
                label-key="label"
                default-expand-all
            >
                <template v-slot:default-header="props">
                    <div class="row items-center q-gutter-sm" style="width: 100%;">
                        <div>{{ props.node.label }}</div>
                        <q-space/>
                        <q-btn
                            flat
                            dense
                            icon="fa fa-plus"
                            size="sm"
                            @click.stop="addLine(props.node)"
                        />
                        <q-btn
                            flat
                            dense
                            icon="fa fa-pen-to-square"
                            size="sm"
                            @click.stop="editNode(props.node)"
                        />
                    </div>
                </template>
                <!-- 为所有 line 节点定义专属模板 -->
                <template v-slot:header-line="{ node }">
                    <div @click.stop class="row q-gutter-sm " style="width: 100%">
                        <LineIcon :line="node.lineData"/>
                        <q-space/>
                        <q-btn
                            size="small"
                            flat
                            dense
                            icon="fa fa-pen-to-square"
                            @click.stop.prevent="editLine(node)"
                        />
                    </div>
                </template>
            </q-tree>
        </q-card>


        <q-dialog v-model="showLineForm" @close="()=>{selectedLine=null}">
            <line-form :initial="selectedLine" @saved="reloadLines"/>
        </q-dialog>

        <!-- 弹出创建/编辑线网 -->
        <q-dialog v-model="showRailsystemForm">
            <railsystem-form :initial="editingRailsystem" @saved="onRailsystemSaved"/>
        </q-dialog>

    </q-page>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import RailsystemForm from 'components/RailsystemForm.vue';
import LineForm from 'components/LineForm.vue';
import {fetchLines, listRailsystem} from 'src/apis/railsystem';
import {useStore} from "vuex";
import {useQuasar} from "quasar";
import LineIcon from "components/LineIcon.vue";

const $q = useQuasar()
const railsystems = ref([]);
const selectedRailsystem = ref(null);
const selectedLine = ref(null);
const lines = ref([]);

const showRailsystemForm = ref(false);
const showLineForm = ref(false);
const editingRailsystem = ref(null);
const store = useStore()

function openCreateRailsystem() {
    editingRailsystem.value = null;
    showRailsystemForm.value = true;
}

function editRailsystem(rs) {
    editingRailsystem.value = rs;
    showRailsystemForm.value = true;
    selectRailsystem(rs);
}

function addLine(node) {
    showLineForm.value = true
    selectedLine.value = {
        railsystem: node.railsystem
    }
}


async function loadRailsystems() {
    const rawList = await listRailsystem();

    railsystems.value = rawList.map(rs => ({
        id: `rs_${rs.id}`,         // 唯一ID
        label: rs.name,              // 展示名称
        railsystemCode: rs.code,
        railsystem: rs,
        lazy: true,
    }));
}

async function selectRailsystem(rs) {
    selectedRailsystem.value = rs;
    selectedLine.value = null;
    lines.value = await fetchLines(rs.code);
}

function editNode(node) {
    if (node.isLine) {
        editLine(node);
    } else {
        editRailsystem(node);
    }
}

async function loadRailLines({node, key, done, fail}) {
    try {
        const lines = await store.dispatch('railsystem/getRailSystemLines', {
            railsystemCode: node.railsystemCode
        });
        const childNodes = lines.map(line => ({
            id: `line_${line.id}`,
            label: line.name,
            lineData: line,
            lazy: false,
            children: [],
            header: 'line',
        }));
        console.log('child', childNodes)
        done(childNodes);
    } catch (err) {
        fail();
    }
}

function editLine(node) {
    showLineForm.value = true
    selectedLine.value = node.lineData;
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
