<template>
    <div>
        <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-weight-medium">换乘信息列表</div>
            <q-btn label="新增" color="primary" size="sm" icon="add" @click="openCreate"/>
        </div>

        <q-inner-loading :showing="loading"/>

        <q-list bordered separator v-if="list.length > 0">
            <q-item v-for="item in list" :key="item.id" class="q-py-sm">
                <q-item-section>
                    <q-item-label>
                        <span class="text-weight-medium">{{ getLineNameBySubStationId(item.from_id) }}</span>
                        <q-icon name="arrow_forward" size="xs" class="q-mx-xs"/>
                        <span class="text-weight-medium">{{ getLineNameBySubStationId(item.to_id) }}</span>
                    </q-item-label>
                    <q-item-label caption>
                        <span v-if="item.category">类型: {{ categoryLabelMap[item.category] || item.category }}</span>
                        <span v-if="item.distance != null" class="q-ml-sm">距离: {{ item.distance }}m</span>
                        <span v-if="item.need_time != null" class="q-ml-sm">耗时: {{ item.need_time }}s</span>
                    </q-item-label>
                    <q-item-label v-if="item.remarks" caption>备注: {{ item.remarks }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <div class="row q-gutter-xs">
                        <q-btn flat dense icon="edit" size="sm" color="primary" @click="openEdit(item)"/>
                        <q-btn flat dense icon="delete" size="sm" color="red-7" @click="confirmDelete(item)"/>
                    </div>
                </q-item-section>
            </q-item>
        </q-list>

        <div v-if="!loading && list.length === 0" class="text-grey text-center q-py-lg">
            暂无换乘信息
        </div>

        <q-dialog v-model="showForm" persistent>
            <q-card style="min-width: 350px">
                <q-card-section>
                    <div class="text-h6">{{ editing ? '编辑换乘信息' : '新增换乘信息' }}</div>
                </q-card-section>
                <q-separator/>
                <q-card-section>
                    <q-form @submit.prevent="submitForm" ref="transferForm">
                        <q-select
                            v-model="fromLine"
                            :options="stationLines"
                            option-label="label"
                            option-value="subStationId"
                            label="换出线路"
                            :rules="[val => !!val || '不能为空']"
                            emit-value
                            map-options
                        />
                        <q-select
                            v-model="toLine"
                            :options="stationLines"
                            option-label="label"
                            option-value="subStationId"
                            label="换入线路"
                            :rules="[val => !!val || '不能为空']"
                            emit-value
                            map-options
                        />
                        <q-select
                            v-model="formData.category"
                            :options="categoryOptions"
                            label="换乘类型"
                            emit-value
                            map-options
                            clearable
                        />
                        <q-input v-model.number="formData.distance" label="步行距离（米）" type="number"/>
                        <q-input v-model.number="formData.need_time" label="耗时（秒）" type="number"/>
                        <q-input v-model="formData.remarks" label="备注" type="textarea" rows="2"/>
                        <q-checkbox v-if="!editing" v-model="formData.createReverse"
                                    label="同时创建反向换乘（线路对换）"/>
                        <div class="row justify-end q-gutter-sm q-mt-md">
                            <q-btn label="取消" flat color="grey" v-close-popup/>
                            <q-btn label="保存" type="submit" color="primary" :loading="saving"/>
                        </div>
                    </q-form>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue';
import {fetchTransferInfoList, createTransferInfo, updateTransferInfo, deleteTransferInfo} from 'src/apis/metro-utils';
import {fetchStation} from 'src/apis/railsystem';
import {useQuasar} from 'quasar';

const props = defineProps({
    stationId: {type: Number, required: true}
});

const $q = useQuasar()
const list = ref([])
const stationLines = ref([])
const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)
const editing = ref(null)
const formData = ref({})
const fromLine = ref(null)
const toLine = ref(null)

const categoryOptions = [
    {label: '出站换乘', value: 'EXIT'},
    {label: '同站台换乘', value: 'SAME_PLTF'},
    {label: '节点换乘', value: 'NODE'},
    {label: '通道换乘', value: 'PASSAGE'},
    {label: '站厅换乘', value: 'HALL'}
]

const categoryLabelMap = {
    EXIT: '出站换乘',
    SAME_PLTF: '同站台换乘',
    NODE: '节点换乘',
    PASSAGE: '通道换乘',
    HALL: '站厅换乘'
}

const defaultTransferValues = {
    EXIT: {distance: 400, need_time: 300},
    SAME_PLTF: {distance: 20, need_time: 10},
    NODE: {distance: 50, need_time: 60},
    PASSAGE: {distance: 250, need_time: 120},
    HALL: {distance: 100, need_time: 90}
}

watch(() => formData.value.category, (newVal) => {
    if (newVal && defaultTransferValues[newVal]) {
        formData.value.distance = defaultTransferValues[newVal].distance
        formData.value.need_time = defaultTransferValues[newVal].need_time
    }
})

onMounted(() => loadData())

async function loadData() {
    loading.value = true
    try {
        const [transferList, station] = await Promise.all([
            fetchTransferInfoList({mainStationId: props.stationId}),
            fetchStation(props.stationId, true)
        ])
        list.value = transferList || []
        stationLines.value = (station?.lines || []).map(line => ({
            label: line.name,
            subStationId: line.subStationId,
            lineId: line.id,
            lineCode: line.code,
        }))
    } catch (e) {
        $q.notify.error('加载数据失败')
    } finally {
        loading.value = false
    }
}

function getLineNameBySubStationId(subStationId) {
    const line = stationLines.value.find(it => it.subStationId === subStationId)
    return line ? line.label : subStationId
}

function openCreate() {
    editing.value = null
    formData.value = {createReverse: false}
    fromLine.value = null
    toLine.value = null
    showForm.value = true
}

function openEdit(item) {
    editing.value = item
    fromLine.value = item.from_id || null
    toLine.value = item.to_id || null
    formData.value = {
        category: item.category,
        distance: item.distance,
        need_time: item.need_time,
        remarks: item.remarks,
    }
    showForm.value = true
}

async function submitForm() {
    saving.value = true
    try {
        const {createReverse, ...rest} = formData.value
        const payload = {
            ...rest,
            main_station_id: props.stationId,
            from_id: fromLine.value,
            to_id: toLine.value,
        }
        if (editing.value) {
            await updateTransferInfo(editing.value.id, payload)
            $q.notify.ok('更新成功')
        } else {
            await createTransferInfo(payload)
            if (createReverse) {
                await createTransferInfo({
                    ...payload,
                    from_id: toLine.value,
                    to_id: fromLine.value,
                })
                $q.notify.ok('创建成功（含反向）')
            } else {
                $q.notify.ok('创建成功')
            }
        }
        showForm.value = false
        await loadData()
    } catch (e) {
        $q.notify.error('保存失败')
    } finally {
        saving.value = false
    }
}

function confirmDelete(item) {
    $q.dialog({
        title: '确认删除？',
        message: `删除 ${getLineNameBySubStationId(item.from_id)} → ${getLineNameBySubStationId(item.to_id)} 的换乘信息？`,
        ok: {label: '删除', color: 'red-9'},
        cancel: {label: '取消', color: 'primary'},
    }).onOk(async () => {
        try {
            await deleteTransferInfo(item.id)
            $q.notify.ok('删除成功')
            await loadData()
        } catch (e) {
            $q.notify.error('删除失败')
        }
    })
}
</script>
