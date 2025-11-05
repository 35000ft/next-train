<template>
    <q-card style="width: 90vw; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column;">
        <q-card-section>
            <div class="text-h6">{{ data?.id ? '编辑时刻表' : '创建时刻表' }}</div>
        </q-card-section>
        <q-separator/>
        <q-card-section style="flex: 1; overflow-y: auto;">
            <q-form @submit.prevent="submitForm" ref="stationForm">
                <q-input
                    v-model="data.name"
                    label="版本"
                    :rules="[val => !!val || '时刻表版本不能为空']"
                />

                <q-input v-model="data.remarks" label="备注"/>

                <q-input
                    v-model="data.lineId"

                    label="选择所属线路"
                    readonly
                    filled
                    :rules="[val => !!val || '所属线路不能为空']"
                    dense
                    @click="lineSelector.show()"
                >
                </q-input>

                <q-select
                    v-model="data.status"
                    :options="[
                        { label: '禁用', value: 0 },
                        { label: '启用', value: 1 }
                    ]"
                    label="状态"
                    emit-value
                    map-options
                />

                <div class="q-gutter-md row justify-end q-mt-md">
                    <q-btn v-if="props.initial?.id" label="删除" color="red-9" @click="confirmDelete"/>
                    <q-btn label="取消" flat color="grey" @click.stop="emits('close')"/>
                    <q-btn label="保存" type="submit" color="primary" :loading="loading"/>
                </div>
            </q-form>
        </q-card-section>
    </q-card>
    <line-selector ref="lineSelector" :railsystem-code="props.initial?.railsystemCode"/>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue';
import {deleteStation, preDeleteStation} from 'src/apis/railsystem';
import {useQuasar} from "quasar";
import {
    createSchedule,
    fetchSchedule,
    updateSchedule
} from "src/apis/reailtime";
import {useStore} from "vuex";
import LineSelector from "components/input/LineSelector.vue";

const $q = useQuasar()
const props = defineProps({
    initial: Object
});
const store = useStore()
const emits = defineEmits(['saved', 'close']);
const data = ref({})
const loading = ref(false)
const lineSelector = ref(null)
const datePopupRef = ref(null)

async function init() {
    const dialog = $q.dialog({
        message: '加载中',
        persistent: true,
        ok: false,
        progress: true,
        style: 'width: 250px; height: 200px; background-color: rgba(0, 0, 0, 0.6);color: #ffffff;',
    })
    if (props.initial?.id) {
        try {
            const temp = await fetchSchedule(props.initial.id)
            Object.assign(data.value, temp,)
        } catch (err) {
            console.error('加载时刻表失败:', err)
            $q.notify.error('加载失败')
        } finally {
            dialog?.hide()
        }
    }
    // 新增时刻表规则 如果传入了时刻表id 则获取时刻表
    else if (props.initial?.selectedLineId) {
        try {
            const line = await store.dispatch('railsystem/getLine', {lineId: props.initial.selectedLineId})
        } catch (err) {
            console.error('加载线路失败:', err)
        } finally {
            dialog?.hide()
        }
    }
}

onMounted(() => {
    init()
});

async function submitForm() {
    let result;
    try {
        loading.value = true
        const payload = {...data.value}
        if (payload.id) {
            result = await updateSchedule(payload.id, payload);
            $q.notify.ok('修改时刻表成功')
        } else {
            result = await createSchedule(payload);
            $q.notify.ok('新增时刻表成功')
        }
        data.value = {}
        emits('close')
    } catch (err) {
        $q.notify.error('保存时刻表失败')
        console.error('Failed to save schedule:', err);
    } finally {
        loading.value = false
    }
    emits('saved', result);

}

const confirmDelete = async () => {
    const stationId = props.initial?.id
    let dialog
    let authCode
    let hintHtml = ''
    dialog = $q.dialog({
        message: '删除前检查中...',
        persistent: true,
        ok: false,
        progress: true,
        style: 'width: 250px; height: 200px; background-color: rgba(0, 0, 0, 0.6);color: #ffffff;',
    })
    try {
        const preCheck = await preDeleteStation(stationId)
        authCode = preCheck?.authCode
        const connectedLines = preCheck?.notMatchedConditions?.line
        if (connectedLines && connectedLines?.length > 0) {
            hintHtml = `<div>该车站关联了${connectedLines.length}条线路:</div>`
            connectedLines.forEach((item, index) => {
                hintHtml += `<div>${index + 1}. ${item.name} ${item.enName} ${item.code}</div>`
            })
        }
    } catch (e) {
        $q.notify.error("删除前检查失败")
        return
    } finally {
        dialog.hide()
    }
    if (!authCode) {
        return
    }
    $q.dialog({
        title: '确认删除？',
        message: `<div>确定要删除该车站？</div>${hintHtml}`,
        persistent: true,
        ok: {
            label: '删除',
            color: 'red-9',
            flat: false,
            textColor: 'white'
        },
        cancel: {
            label: '取消',
            color: 'primary'
        },
        html: true
    }).onOk(() => {
        doDelete()
    }).onCancel(() => {

    })
    const doDelete = async () => {
        if (!authCode) {
            const preCheck = await preDeleteStation(stationId)
            authCode = preCheck?.authCode
        }

        if (authCode) {
            deleteStation(stationId, authCode).then(r => {
                $q.notify.ok('删除车站成功')
            }).catch(e => {
                console.error('删除车站失败:', e)
                $q.notify.error('删除车站失败, 请稍后重试')
            })
        } else {
            $q.notify.error('删除车站失败, 请稍后重试')
        }
    }
}


</script>
<style scoped>


</style>
