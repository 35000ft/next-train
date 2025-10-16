<template>
    <q-card style="width: 90vw; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column;">
        <q-card-section>
            <div class="text-h6">{{ data?.id ? '编辑时刻表规则' : '创建时刻表规则' }}</div>
        </q-card-section>
        <q-separator/>
        <q-card-section style="flex: 1; overflow-y: auto;">
            <q-form @submit.prevent="submitForm" ref="stationForm">
                <q-input
                    v-model="data.name"
                    label="规则名"
                    :rules="[val => !!val || '规则名不能为空']"
                />

                <q-input v-model="data.remarks" label="备注"/>

                <q-select
                    v-model="data.category"
                    :options="[
            { label: '工作日', value: 'WEEKDAY' },
            { label: '周末', value: 'WEEKEND' },
            { label: '节假日', value: 'HOLIDAY' },
            { label: '平日', value: 'NORMAL' },
          ]"
                    label="类型"
                    :rules="[val => !!val || '类型不能为空']"
                    option-label="label"
                    option-value="value"
                    emit-value
                    map-options
                />

                <div style="margin-bottom: 15px;margin-top: 15px;">
                    <week-period-selector v-model="data.period"/>
                </div>

                <q-input
                    v-model="dateRangeText"
                    label="选择起止时间"
                    readonly
                    filled
                    :rules="[val => !!val || '起止时间不能为空']"
                    dense
                    @click="datePopupRef.show()"
                >
                    <template #append>
                        <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale"
                                           ref="datePopupRef">
                                <q-date v-model="data.dateRange" range @update:model-value="onChangeDateRange"
                                        mask="YYYY-MM-DD"/>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>

                <q-select
                    v-model="data.scheduleId"
                    :options="scheduleOptions"
                    label="请选择时刻表"
                    use-input
                    input-debounce="300"
                    @filter="onFilter"
                    :loading="loadingSchedules"
                    emit-value
                    map-options
                    option-label="label"
                    option-value="value"
                    @popup-show="loadScheduleDropdown"
                />

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
</template>

<script setup>
import {ref, onMounted, watch} from 'vue';
import {deleteStation, preDeleteStation} from 'src/apis/railsystem';
import {useQuasar} from "quasar";
import {
    createScheduleRule,
    fetchSchedule,
    fetchScheduleDropdown,
    fetchScheduleRule,
    updateScheduleRule
} from "src/apis/reailtime";
import WeekPeriodSelector from "components/WeekPeriodSelector.vue";

const $q = useQuasar()
const props = defineProps({
    initial: Object
});
const emits = defineEmits(['saved', 'close']);
const data = ref({})
const loading = ref(false)
const loadingSchedules = ref(false)
const scheduleOptions = ref([])
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
            const temp = await fetchScheduleRule(props.initial.id)
            scheduleOptions.value = [{
                label: temp.scheduleVersion,
                value: temp.scheduleId,
            }]
            Object.assign(data.value, temp,)
        } catch (err) {
            console.error('加载时刻表规则失败:', err)
            $q.notify.error('加载失败')
        } finally {
            dialog?.hide()
        }
    }
    // 新增时刻表规则 如果传入了时刻表id 则获取时刻表
    else if (props.initial?.selectedScheduleId) {
        try {
            const schedule = await fetchSchedule(props.initial.selectedScheduleId)
            scheduleOptions.value = [{
                label: schedule.version,
                value: schedule.id,
            }]
            data.value = {
                scheduleId: schedule.id,
                category: 'NORMAL',
                status: 1
            }
        } catch (err) {
            console.error('加载时刻表失败:', err)
        } finally {
            dialog?.hide()
        }
    }
}

onMounted(() => {
    init()
});
const dateRangeText = ref(null)

async function submitForm() {
    let result;
    try {
        loading.value = true
        const payload = {...data.value}
        payload.fromDate = data.value.dateRange.from
        payload.toDate = data.value.dateRange.to
        if (payload.id) {
            result = await updateScheduleRule(payload.id, payload);
            $q.notify.ok('修改时刻表规则成功')
        } else {
            result = await createScheduleRule(payload);
            $q.notify.ok('新增时刻表规则成功')
        }
        data.value = {}
        emits('close')
    } catch (err) {
        $q.notify.error('保存时刻表规则失败')
        console.error('Failed to save schedule rule:', err);
    } finally {
        loading.value = false
    }
    emits('saved', result);

}

watch(() => data.value.category, val => {
    if (val === "WEEKDAY") {
        data.value.period = [1, 2, 3, 4, 5]
    } else if (val === "WEEKEND") {
        data.value.period = [6, 7]
    } else if (val === "NORMAL") {
        data.value.period = [1, 2, 3, 4, 5, 6, 7]
    }
})
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

function onChangeDateRange(dateRange) {
    dateRangeText.value = `${dateRange.from} ~ ${dateRange.to}`
}

const loadScheduleDropdown = async (keyword = '') => {
    console.log('Load schedule drop down')
    loadingSchedules.value = true
    try {
        const res = await fetchScheduleDropdown({
            version: keyword,
            systemCode: props.initial?.railsystemCode,
        })
        scheduleOptions.value = res.map(it => {
            return {label: it.version, value: it.id}
        })
    } catch (error) {
        console.error('获取时刻表下拉框失败', error)
    } finally {
        loadingSchedules.value = false
    }
}

// 当用户输入时触发过滤
const onFilter = (val, update) => {
    update(() => {
        if (val !== '') {
            loadScheduleDropdown(val)
        }
    })
}
</script>
