<template>
    <q-card style="width: 90vw; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column;">
        <q-card-section>
            <div class="text-h6">{{ stationData?.id ? '编辑车站' : '创建车站' }}</div>
        </q-card-section>
        <q-separator/>

        <q-tabs v-if="stationData?.id" v-model="activeTab" dense align="left" class="q-px-md">
            <q-tab name="basic" label="基本信息"/>
            <q-tab name="transfer" label="换乘信息"/>
        </q-tabs>
        <q-separator v-if="stationData?.id"/>

        <q-card-section style="flex: 1; overflow-y: auto;">
            <!-- 基本信息 -->
            <q-tab-panels v-if="stationData?.id" v-model="activeTab" animated>
                <q-tab-panel name="basic" class="q-pa-none">
                    <StationBasicForm
                        :station-data="stationData"
                        :initial="props.initial"
                        @close="emits('close')"
                        @saved="emits('saved', $event)"
                    />
                </q-tab-panel>
                <q-tab-panel name="transfer" class="q-pa-none">
                    <TransferInfoPanel :station-id="stationData.id"/>
                </q-tab-panel>
            </q-tab-panels>

            <!-- 新建车站时不显示 tabs -->
            <StationBasicForm
                v-if="!stationData?.id"
                :station-data="stationData"
                :initial="props.initial"
                @close="emits('close')"
                @saved="emits('saved', $event)"
            />
        </q-card-section>
    </q-card>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {fetchStation} from 'src/apis/railsystem';
import {useQuasar} from 'quasar';
import StationBasicForm from 'components/form/StationBasicForm.vue';
import TransferInfoPanel from 'components/form/TransferInfoPanel.vue';

const $q = useQuasar()
const props = defineProps({
    initial: Object
});
const emits = defineEmits(['saved', 'close']);
const stationData = ref({})
const activeTab = ref('basic')

async function init() {
    let dialog
    if (props.initial?.id) {
        try {
            dialog = $q.dialog({
                message: '加载车站中',
                persistent: true,
                ok: false,
                progress: true,
                style: 'width: 250px; height: 200px; background-color: rgba(0, 0, 0, 0.6);color: #ffffff;',
            })
            const station = await fetchStation(props.initial.id, true)
            Object.assign(stationData.value, station)
        } catch (err) {
            $q.notify.error('加载车站失败')
        } finally {
            dialog?.hide()
        }
    } else if (props.initial instanceof Object) {
        Object.assign(stationData.value, props.initial)
    }
}

onMounted(() => {
    init()
});
</script>
