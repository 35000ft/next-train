<template>
    <div v-if="localStations.length > 0" class="q-pa-md">
        <div
            v-for="(station, index) in localStations"
            :key="index"
            class="q-mb-md q-pa-sm q-border rounded-borders bg-grey-1"
        >
            <q-item class="row" style="align-items: center;">
                <!-- 显示序号 -->
                <q-item-section class="col-2">
                    <q-avatar color="primary" text-color="white" size="24px">
                        {{ index + 1 }}
                    </q-avatar>
                </q-item-section>
                <!-- 输入站点名称 -->
                <q-item-section class="col-8">
                    <q-input
                        v-model="station.name"
                        label="名称"
                        outlined
                        dense
                    />
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


        </div>

        <!-- 底部按钮 -->
        <div class="row justify-end q-gutter-sm">
            <q-btn label="取消" color="grey" flat @click="onCancel"/>
            <q-btn label="提交" color="primary" @click="onSubmit"/>
        </div>
    </div>
</template>

<script setup>
import {ref, watch} from 'vue'

const props = defineProps({
    stationsProp: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['submit', 'cancel', 'remove'])

const localStations = ref([])

watch(
    () => props.stationsProp,
    (newVal) => {
        localStations.value = JSON.parse(JSON.stringify(newVal))
    },
    {immediate: true, deep: true}
)

function onSubmit() {
    emit('submit', localStations.value)
}

function removeStation(index) {
    emit('remove', index)
}

function onCancel() {
    emit('cancel')
}
</script>

<style scoped>
.rounded-borders {
    border-radius: 8px;
}
</style>
