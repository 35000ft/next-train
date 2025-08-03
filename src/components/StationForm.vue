<template>
    <q-card style="width: 90vw; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column;">
        <q-card-section>
            <div class="text-h6">{{ stationData?.id ? '编辑车站' : '创建车站' }}</div>
        </q-card-section>
        <q-separator/>
        <q-card-section style="flex: 1; overflow-y: auto;">
            <q-form @submit.prevent="submitForm" ref="stationForm">
                <q-input v-model="stationData.code" label="车站代码"/>

                <q-input
                    v-model="stationData.name"
                    label="名称"
                    :rules="[val => !!val || '名称不能为空']"
                />

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

                <q-input v-model="stationData.category" label="分类"/>

                <osm-location-picker
                    v-model="stationData.location"
                />

                <div class="q-gutter-md row justify-end q-mt-md">
                    <q-btn label="取消" flat color="grey"/>
                    <q-btn label="保存" type="submit" color="primary"/>
                </div>
            </q-form>
        </q-card-section>
    </q-card>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {createStation, updateStation} from 'src/apis/railsystem';
import {useStore} from "vuex";
import OsmLocationPicker from "components/OsmLocationPicker.vue";

const props = defineProps({
    initial: Object // 可选，用于编辑模式
});
const emits = defineEmits(['saved']);
const store = useStore()
const stationData = ref({})

onMounted(async () => {
    if (props.initial) {
        stationData.value = await store.dispatch('railsystem/getStation', {stationId: props.initial.id})
    }
});

async function submitForm() {
    try {
        let result;
        const payload = {};
        if (id.value) {
            result = await updateStation(id.value, payload);
        } else {
            result = await createStation(payload);
        }
        emits('saved', result);
    } catch (err) {
        console.error('保存车站失败:', err);
    } finally {
        stationData.value = null
    }
}
</script>
