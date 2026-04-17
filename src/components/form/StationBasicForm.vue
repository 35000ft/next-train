<template>
    <q-form @submit.prevent="submitForm" ref="stationForm">
        <q-input
            v-model="localData.name"
            label="名称"
            :rules="[val => !!val || '名称不能为空']"
        />
        <q-input v-model="localData.code" label="车站代码"/>
        <q-input v-model="localData.enName" label="英文名称"/>

        <q-select
            v-model="localData.status"
            :options="[
                { label: '关闭', value: 0 },
                { label: '运营中', value: 1 }
            ]"
            label="状态"
            emit-value
            map-options
        />

        <osm-location-picker
            show-input
            v-model="localData.location"
            format="lon-lat"
        />

        <div class="q-gutter-md row justify-end q-mt-md">
            <q-btn v-if="props.initial?.id" label="删除" color="red-9" @click="confirmDelete"/>
            <q-btn label="取消" flat color="grey" @click.stop="emits('close')"/>
            <q-btn label="保存" type="submit" color="primary" :loading="loading"/>
        </div>
    </q-form>
</template>

<script setup>
import {ref, watch} from 'vue';
import {createStation, deleteStation, preDeleteStation, updateStation} from 'src/apis/railsystem';
import OsmLocationPicker from 'components/input/OsmLocationPicker.vue';
import {useQuasar} from 'quasar';

const $q = useQuasar()
const props = defineProps({
    stationData: Object,
    initial: Object,
});
const emits = defineEmits(['saved', 'close']);
const localData = ref({})
const loading = ref(false)

watch(() => props.stationData, (val) => {
    if (val) Object.assign(localData.value, val)
}, {immediate: true, deep: true})

async function submitForm() {
    let result;
    try {
        loading.value = true
        const payload = {...localData.value}
        payload.railsystemCode = props.initial?.railsystemCode || props.initial?.railsystem?.code
        payload.lineId = props.initial?.line?.id
        if (!payload.railsystemCode) {
            $q.notify.error('线网代码不能为空')
            return
        }
        if (payload.id) {
            result = await updateStation(payload.id, payload);
            $q.notify.ok('编辑车站成功')
        } else {
            result = await createStation(payload);
            $q.notify.ok('创建车站成功')
        }
        emits('close')
        if (result) emits('saved', result)
    } catch (err) {
        $q.notify.error('保存车站失败')
        console.error('保存车站失败:', err);
    } finally {
        loading.value = false
    }
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
        $q.notify.error('删除前检查失败')
        return
    } finally {
        dialog.hide()
    }
    if (!authCode) return
    $q.dialog({
        title: '确认删除？',
        message: `<div>确定要删除该车站？</div>${hintHtml}`,
        persistent: true,
        ok: {label: '删除', color: 'red-9', flat: false, textColor: 'white'},
        cancel: {label: '取消', color: 'primary'},
        html: true
    }).onOk(() => {
        doDelete()
    })
    const doDelete = async () => {
        if (!authCode) {
            const preCheck = await preDeleteStation(stationId)
            authCode = preCheck?.authCode
        }
        if (authCode) {
            deleteStation(stationId, authCode).then(() => {
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
