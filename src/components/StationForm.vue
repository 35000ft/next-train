<template>
    <q-form @submit.prevent="submitForm">
        <q-input v-model="name" label="车站名称" required class="q-mb-md"/>
        <q-btn :label="id ? '保存修改' : '添加车站'" type="submit" color="primary"/>
    </q-form>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {createStation, updateStation} from 'src/apis/railsystem';

const props = defineProps({
    lineId: {
        type: [String, Number],
        required: true
    },
    initial: Object // 可选，用于编辑模式
});
const emits = defineEmits(['saved']);

const name = ref('');
const id = ref(null);

onMounted(() => {
    if (props.initial) {
        id.value = props.initial.id;
        name.value = props.initial.name || '';
    }
});

async function submitForm() {
    try {
        let result;
        const payload = {
            line_id: props.lineId,
            name: name.value
        };
        if (id.value) {
            result = await updateStation(id.value, payload);
        } else {
            result = await createStation(payload);
        }
        emits('saved', result);
        name.value = '';
        id.value = null;
    } catch (err) {
        console.error('保存车站失败:', err);
    }
}
</script>
