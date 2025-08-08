<template>
    <q-card style="width: 90vw; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column;">
        <q-card-section>
            <div class="text-h6">{{ lineData?.id ? '编辑线路' : '新建线路' }}</div>
        </q-card-section>

        <q-separator/>

        <q-card-section style="flex: 1; overflow-y: auto;">
            <q-form @submit.prevent="submitForm" ref="formRef">
                <!-- 线路名称 -->
                <q-input
                    v-model="lineData.name"
                    required
                    :rules="[val => !!val || 'Line name can not be empty']"
                    class="q-mb-md"
                    label-slot>
                    <template #label>
                        <span>线路名称 <span class="text-negative">*</span></span>
                    </template>
                </q-input>

                <q-input
                    v-model="lineData.code"
                    label="线路代码"
                    class="q-mb-md"
                />

                <q-input
                    v-model="lineData.enName"
                    label="英文名称"
                    class="q-mb-md"
                />

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
                    <q-item class="row text-primary">
                        <q-item-section>序号</q-item-section>
                        <q-item-section>车站名</q-item-section>
                        <q-item-section>前站距离(m)</q-item-section>
                        <q-item-section>下站距离(m)</q-item-section>
                    </q-item>
                    <draggable
                        v-model="allStations"
                        item-key="id"
                        tag="q-list"
                        class="q-mb-md"
                    >
                        <template #item="{ element, index }">
                            <q-item class="row">
                                <q-item-section class="col-1 items-center justify-center" style="text-align: center;">
                                    <q-avatar color="primary" text-color="white" size="24px">
                                        {{ index + 1 }}
                                    </q-avatar>
                                </q-item-section>
                                <q-item-section>{{ element.name }}</q-item-section>
                                <q-item-section>
                                    <q-input v-model="element.preDistance" type="number" :disable="index===0"/>
                                </q-item-section>
                                <q-item-section>
                                    <q-input v-model="element.nextDistance" type="number"
                                             :disable="index===allStations.length-1"/>
                                </q-item-section>
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

const formRef = ref(null);
const showStationForm = ref(false)
const props = defineProps({
    initial: Object
})
const emits = defineEmits(['saved'])
const stationSelector = ref(null)
const $q = useQuasar()
const loading = ref(false)
const rawStations = ref([])
const allStations = ref([])
const statusOptions = ref([
    {label: '关闭', value: 0},
    {label: '运营中', value: 1}
])
const categoryOptions = RAILSYSTEM_CATEGORIES;
const lineData = ref({})
onMounted(async () => {
    let dialog
    if (props.initial?.id) {
        try {
            dialog = $q.dialog({
                // 配置模态框
                message: '加载线路中',
                persistent: true,
                ok: false,
                progress: true,
                // 可自定义样式
                style: 'width: 250px; height: 200px; background-color: rgba(0, 0, 0, 0.6);color: #ffffff;',
            })
            const line = await fetchLine(props.initial.id, true)
            Object.assign(lineData.value, line,)
            rawStations.value = [...line.stations]
            allStations.value = [...line.stations]
        } catch (err) {
            $q.notify.error('加载线路失败')
        } finally {
            dialog?.hide()
        }
    } else {
        rawStations.value = []
        allStations.value = []
    }
    lineData.value.railsystem = props.initial?.railsystem
})

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
    if (formRef.value) {
        const valid = await formRef.value.validate();
        if (!valid) {
            return
        }
    }
    try {
        loading.value = true
        const payload = {
            ...lineData.value
        }
        payload.railsystemId = lineData.value?.railsystem?.id
        payload.status = payload?.status?.value
        payload.category = payload?.category?.value
        payload.stations = allStations.value.map(it => {
            return {
                id: it.id,
                nextDistance: it?.nextDistance,
                preDistance: it?.preDistance,
            }
        })
        let saved
        if (lineData.value?.id) {
            saved = await updateLine(lineData.value?.id, payload);
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

.square-dialog .q-card {
    width: 100px; /* 设置宽度 */
    height: 100px; /* 设置高度 */
    max-width: 100%; /* 防止超出屏幕 */
    max-height: 100%; /* 防止超出屏幕 */
}
</style>
