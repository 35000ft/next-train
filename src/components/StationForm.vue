<template>
    <q-card style="width: 90vw; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column;">
        <q-card-section>
            <div class="text-h6">{{ stationData?.id ? '编辑车站' : '创建车站' }}</div>
        </q-card-section>
        <q-separator/>
        <q-card-section style="flex: 1; overflow-y: auto;">
            <q-form @submit.prevent="submitForm" ref="stationForm">
                <q-input
                    v-model="stationData.name"
                    label="名称"
                    :rules="[val => !!val || '名称不能为空']"
                />
                <q-input v-model="stationData.code" label="车站代码"/>

                <q-input v-model="stationData.enName" label="英文名称"/>

                <q-select
                    v-model="stationData.status"
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
                    v-model="stationData.location"
                    format="lon-lat"
                />

                <div class="q-gutter-md row justify-end q-mt-md">
                    <q-btn label="取消" flat color="grey"/>
                    <q-btn label="保存" type="submit" color="primary" :loading="loading"/>
                </div>
            </q-form>
        </q-card-section>
    </q-card>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {createStation, fetchStation, updateStation} from 'src/apis/railsystem';
import OsmLocationPicker from "components/OsmLocationPicker.vue";
import {RAILSYSTEM_CATEGORIES} from "src/models/Railsystem";
import {useQuasar} from "quasar";

const $q = useQuasar()
const props = defineProps({
    initial: Object
});
const emits = defineEmits(['saved']);
const stationData = ref({})
const loading = ref(false)
ref(RAILSYSTEM_CATEGORIES);
onMounted(async () => {
    let dialog
    if (props.initial?.id) {
        try {
            dialog = $q.dialog({
                // 配置模态框
                message: '加载车站中',
                persistent: true,
                ok: false,
                progress: true,
                // 可自定义样式
                style: 'width: 250px; height: 200px; background-color: rgba(0, 0, 0, 0.6);color: #ffffff;',
            })
            const line = await fetchStation(props.initial.id, true)
            Object.assign(stationData.value, line,)
        } catch (err) {
            $q.notify.error('加载线路失败')
            return
        } finally {
            dialog?.hide()
        }
    }
    stationData.value.railsystem = props.initial?.railsystem
});

async function submitForm() {
    let result;
    try {
        loading.value = true
        const payload = {...stationData.value}
        payload.railsystemId = payload.railsystem?.id
        if (!payload.railsystemId) {
            $q.notify.error('线网ID不能为空')
            return
        }
        console.log('payload', payload,)
        if (payload.id) {
            result = await updateStation(payload.id, payload);
            $q.notify.ok('创建车站成功成功')
        } else {
            result = await createStation(payload);
            $q.notify.ok('保存线路成功')
        }
    } catch (err) {
        $q.notify.ok('保存车站失败')
        console.error('保存车站失败:', err);
    } finally {
        loading.value = false
    }
    emits('saved', result);

}
</script>
