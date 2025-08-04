<template>
    <q-card style="width: 90vw; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column;">
        <q-card-section>
            <div class="text-h6">{{ lineData?.id ? '编辑线路' : '新建线路' }}</div>
        </q-card-section>

        <q-separator/>

        <q-card-section style="flex: 1; overflow-y: auto;">
            <q-form @submit.prevent="submitForm">
                <!-- 线路名称 -->
                <q-input
                    v-model="lineData.name"
                    label="线路名称"
                    required
                    class="q-mb-md"
                />

                <q-input
                    v-model="lineData.code"
                    label="线路代码"
                    class="q-mb-md"
                />

                <!-- 线路英文名称 -->
                <q-input
                    v-model="lineData.enName"
                    label="英文名称"
                    class="q-mb-md"
                />

                <!-- 线路状态 -->
                <q-select
                    v-model="lineData.status"
                    :options="statusOptions"
                    label="线路状态"
                    class="q-mb-md"
                    required
                />

                <!-- 线路类别 -->
                <q-select
                    v-model="lineData.category"
                    :options="categoryOptions"
                    label="线路类别"
                    class="q-mb-md"
                    required
                />

                <!-- 环线选择 -->
                <q-checkbox
                    v-model="lineData.isCircle"
                    label="是否为环线"
                    class="q-mb-md"
                />

                <!-- 线路颜色选择 -->
                <q-item-label class="q-mt-sm">线路颜色</q-item-label>
                <q-color
                    v-model="lineData.color"
                    label="选择颜色"
                    format-model="hex"
                    display-mode="compact"
                    class="q-mb-md"
                />

                <q-expansion-item expand-separator default-opened>
                    <template v-slot:header>
                        <q-item-label class="q-mt-sm text-weight-bold">车站列表</q-item-label>
                    </template>
                    <!-- 车站列表 -->
                    <draggable
                        v-model="allStations"
                        item-key="id"
                        tag="q-list"
                        class="q-mb-md"
                    >
                        <template #item="{ element, index }">
                            <q-item class="row">
                                <q-item-section class="col-2">
                                    <q-avatar color="primary" text-color="white" size="24px">
                                        {{ index + 1 }}
                                    </q-avatar>
                                </q-item-section>
                                <q-item-section>{{ element.name }}</q-item-section>
                                <q-item-section side>
                                    <q-btn
                                        dense
                                        flat
                                        icon="delete"
                                        color="negative"
                                        @click="removeStation(index)"
                                    />
                                </q-item-section>
                            </q-item>
                        </template>
                    </draggable>
                    <div class="row q-gutter-sm justify-around" style="margin-top: 5px;">
                        <q-btn
                            label="添加车站"
                            color="blue"
                            @click="addStation"
                        />
                        <q-btn
                            label="创建车站"
                            color="green"
                            @click="createStation"
                        />
                        <q-btn
                            label="默认车站"
                            color="grey"
                            @click="restoreStations"
                        />
                    </div>
                </q-expansion-item>


                <!-- 保存按钮 -->
                <div class="q-mt-md">
                    <q-btn
                        label="保存线路"
                        type="submit"
                        :loading="loading"
                        color="primary"
                    />
                </div>
            </q-form>
        </q-card-section>
    </q-card>
    <station-selector ref="stationSelector" :railsystem-code="lineData?.railsystemCode" @select="handleSelectStation"/>
    <q-dialog v-model="showStationForm">
        <station-form :initial="{}"/>
    </q-dialog>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import draggable from 'vuedraggable';
import {fetchLine, updateLine, createLine} from 'src/apis/railsystem';
import StationSelector from "components/StationSelector.vue";
import StationForm from "components/StationForm.vue";
import {RAILSYSTEM_CATEGORIES} from "src/models/Railsystem";
import {useQuasar} from "quasar";

const showStationForm = ref(false)
const props = defineProps({
    initial: Object
})
const emits = defineEmits(['saved']);
const stationSelector = ref(null)
const loading = ref(false)
const $q = useQuasar()
const rawStations = ref([]); // 当前已选车站
const allStations = ref([]); // 所有可选车站（从 line.stations 加载）
const statusOptions = ref([
    {label: '关闭', value: 0},
    {label: '运营中', value: 1}
]);

const categoryOptions = RAILSYSTEM_CATEGORIES;
const lineData = ref({})
onMounted(async () => {
    if (props.initial?.id) {
        try {
            const line = await fetchLine(props.initial.id);
            Object.assign(lineData.value, line,)

            rawStations.value = [...line.stations];
            allStations.value = [...line.stations];
        } catch (err) {
            console.error('加载线路失败:', err);
        }
    } else {
        rawStations.value = [];
        allStations.value = [];
    }
});

const handleSelectStation = async ({station, event}) => {
    if (station) {
        allStations.value.push(station)
    }
}

const restoreStations = () => {
    allStations.value = [...rawStations.value]
}

function addStation() {
    stationSelector.value.showSelector('addLineStation')
}

function createStation() {
    showStationForm.value = true
}


function removeStation(index) {
    allStations.value.splice(index, 1);
}

async function submitForm() {
    try {
        loading.value = true
        const payload = {};
        let saved;
        if (id.value) {
            saved = await updateLine(id.value, payload);
            $q.notify.ok('保存线路成功')
        } else {
            saved = await createLine(payload);
            $q.notify.ok('创建线路成功')
        }
        emits('saved', saved)
    } catch (err) {
        console.error('保存线路失败:', err)
        $q.notify.error('保存线路失败')
    } finally {
        lineData.value = {}
        loading.value = false
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
