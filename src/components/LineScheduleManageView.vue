<template>
    <OverlayView name="LineScheduleManageView">
        <template v-slot:header-center>
            <div style="max-width: 300px;" class="auto-scroll-container">
                <div class="text-center">线路时刻表</div>
            </div>
        </template>
        <template v-slot:default>
            <div style="overflow-y: auto;height: 90vh">
                <div style="height: 10px;"></div>
                <q-list style="max-width: 400px;">
                    <div style="margin: 0 20px; display: flex;gap: 10px;">
                        <q-avatar size="36px" color="primary" text-color="white"
                                  @click="handleAddScheduleRule"
                                  icon="rule">
                            <q-badge floating rounded color="green">
                                <q-icon name="add" size="8px" color="white"/>
                            </q-badge>
                        </q-avatar>
                        <q-avatar class="interactive" size="36px" color="primary" text-color="white"
                                  icon="departure_board">
                            <q-badge floating rounded color="green">
                                <q-icon name="add" size="8px" color="white"/>
                            </q-badge>
                        </q-avatar>
                    </div>
                    <div style="background-color: var(--q-background-grey-2);
                        border: 1px solid var(--q-grey-2);
                        margin: 10px;
                        border-radius: 10px;"
                         v-for="(group,index) in lineSchedules"
                         :key="index"
                    >
                        <q-expansion-item expand-separator popup :class="group.timeClass"
                                          style="max-width: 400px; margin: 0">
                            <template v-slot:header>
                                <q-item-section avatar>
                                    <q-avatar icon="event"/>
                                </q-item-section>
                                <q-item-section class="interactive">
                                    <div class="text-weight-bold" style="font-size: 18px;"
                                         v-if="!!group.fromDate || !!group.toDate">
                                        <div>{{ group.fromDate }}</div>
                                        <div>{{ group.toDate }}</div>
                                    </div>
                                    <div v-else class="text-weight-bold" style="font-size: 18px;">未设定规则</div>
                                </q-item-section>
                                <q-item-section>
                                    <div class="rounded-icon circle" style="font-size: 14px;color: white;">
                                        {{ group.schedules.length }}条
                                    </div>
                                </q-item-section>
                            </template>
                            <q-list style="color: var(--q-normal);">
                                <q-item v-for="(item,index) in group.schedules" :key="'item'+index" class="row">
                                    <q-item-section
                                        style="display: flex;flex-direction: row; gap: 5px;justify-content: flex-start; align-items: center;"
                                        class="col-9">
                                        <div class="row" style="gap: 5px;">
                                            <div class="text-bold col-12" style="font-size: 16px;">
                                                {{ item.schedule.version }}
                                            </div>
                                            <div v-if="item.category"
                                                 :class="item.category?.toLowerCase() || ''"
                                                 class="rounded-icon schedule-item-attr">
                                                {{ item.category }}
                                            </div>
                                            <div v-if="item.name"
                                                 class="rounded-icon text-white bg-primary text-no-wrap ellipsis"
                                                 style="max-width: 100px;">
                                                {{ item.name }}
                                            </div>
                                        </div>
                                    </q-item-section>
                                    <q-item-section style="width: 60px;">
                                        <div
                                            style="display: flex; gap: 5px; width: 100%; height: 100%;flex-wrap: wrap;">
                                            <q-avatar class="interactive" size="25px"
                                                      text-color="white"
                                                      :color="!!item.scheduleRuleId?'primary':'grey'"
                                                      @click="handleEditScheduleRule(item.scheduleRuleId)"
                                                      icon="rule">
                                                <q-badge floating rounded
                                                         :color="!!item.scheduleRuleId?'green':'red'"
                                                >
                                                    <q-icon name="fa fa-pen-to-square" size="6px" color="white"/>
                                                </q-badge>
                                            </q-avatar>

                                            <!-- 编辑时刻表 -->
                                            <q-avatar class="interactive" size="25px" color="primary"
                                                      text-color="white"
                                                      @click="handleEditSchedule(item?.schedule)"
                                                      icon="departure_board">
                                                <q-badge floating rounded color="green">
                                                    <q-icon name="fa fa-pen-to-square" size="6px" color="white"/>
                                                </q-badge>
                                            </q-avatar>
                                            <!-- 查看时刻表详情 -->
                                            <q-avatar class="interactive" size="25px" color="primary"
                                                      text-color="white"
                                                      @click="handleShowScheduleDetail(item?.schedule)"
                                                      icon="fa-solid fa-info">
                                                <q-badge floating rounded color="green">
                                                    <q-icon name="departure_board" size="6px" color="white"/>
                                                </q-badge>
                                            </q-avatar>

                                            <!-- 为时刻表添加时刻表规则 -->
                                            <q-avatar class="interactive" size="25px" color="primary"
                                                      text-color="white"
                                                      @click="handleAddScheduleRule(item?.schedule?.id)"
                                                      icon="add">
                                                <q-badge floating rounded color="green">
                                                    <q-icon name="rule" size="6px" color="white"/>
                                                </q-badge>
                                            </q-avatar>
                                        </div>
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </q-expansion-item>
                    </div>
                </q-list>
            </div>
            <q-dialog v-model="showScheduleRuleForm">
                <schedule-rule-form
                    :initial="{id:selectedScheduleRuleId, railsystemCode:_line.railsystemCode,lineId:_line?.realId,
                                selectedScheduleId:selectedScheduleId}"/>
            </q-dialog>
            <q-dialog v-model="showScheduleForm">
                <schedule-form
                    :initial="{id:selectedScheduleId,  selectedLineId:_line?.realId}"/>
            </q-dialog>
        </template>
    </OverlayView>

</template>
<script setup>
import OverlayView from "components/OverlayView.vue";
import {onMounted, ref} from "vue";
import {useStore} from "vuex";
import {useQuasar} from "quasar";

import _ from "lodash";
import {fetchLineSchedules} from "src/apis/reailtime";
import {isAfterNow} from "src/utils/time-utils";
import ScheduleRuleForm from "components/ScheduleRuleForm.vue";
import ScheduleForm from "components/ScheduleForm.vue";

const selectedScheduleRuleId = ref(null)
const selectedScheduleId = ref(null)
const showScheduleRuleForm = ref(false)
const showScheduleForm = ref(false)
const props = defineProps({
    line: {
        type: Object,
    }
})
const loading = ref(true)

const store = useStore()
const $q = useQuasar()
const _line = ref(null)
const lineSchedules = ref([])
onMounted(() => {
    const params = _.clone(props)
    init(params)
})

async function loadLineSchedules(lineId, timezone) {
    if (lineId) {
        loading.value = true
        try {
            const data = await fetchLineSchedules(lineId)
            data.forEach(it => {
                it.timeClass = calcTimeClass(it?.fromDate, it?.toDate, timezone)
                it.title = calcGroupTitle(it?.fromDate, it?.toDate)
            })
            lineSchedules.value = data
        } catch (e) {
            $q.notify.error("加载线路时刻表失败")
        } finally {
            loading.value = false
        }
    }
}

function calcGroupTitle(fromDate, toDate) {
    if (!fromDate && !toDate) {
        return '未设定规则'
    }
    if (!!fromDate && !toDate) {
        return `自${fromDate.replaceAll("-", '/')}开始`
    }
    return `${fromDate.replaceAll("-", '/')} ~ ${toDate.replaceAll("-", '/')}`
}

function calcTimeClass(fromDate, toDate, timezone) {
    if (!fromDate && !toDate) {
        return 'ungrouped-schedule'
    }
    if (toDate) {
        if (isAfterNow(toDate, timezone)) {
            if (fromDate && isAfterNow(fromDate)) {
                return 'future-schedule'
            }
            // 正在使用的时刻表规则
            return 'using-schedule'
        } else {
            // 以前使用的时刻表规则
            return 'passed-schedule'
        }
    }
    if (fromDate) {
        if (isAfterNow(fromDate, timezone)) {
            return 'future-schedule'
        } else {
            return 'using-schedule'
        }
    }
    return 'normal-schedule'
}

async function init(params) {
    const {line} = params
    if (!line) {
        $q.notify.error("Initialize Failure, Missing parameter: line")
        return
    }
    _line.value = line
    const railsystem = await store.dispatch('railsystem/getRailSystem', {code: line.railsystemCode})
    loadLineSchedules(line?.id, railsystem.timezone)
}

function handleEditScheduleRule(scheduleRuleId) {
    if (!scheduleRuleId) return
    showScheduleRuleForm.value = true
    selectedScheduleRuleId.value = scheduleRuleId
}

function handleAddScheduleRule(scheduleId) {
    selectedScheduleRuleId.value = null
    selectedScheduleId.value = scheduleId
    showScheduleRuleForm.value = true
}

function handleEditSchedule(schedule) {
    if (schedule?.id) {
        showScheduleForm.value = true
        selectedScheduleId.value = schedule.id
    }
}

//TODO
function handleShowScheduleDetail(schedule) {

}
</script>

<style scoped>
.schedule-item {
    font-family: "Helvetica Neue", Helvetica, "Lucida Grande", Arial, "Hiragino Sans GB", "Microsoft Yahei", "WenQuanYi Micro Hei", sans-serif;
}

.future-schedule {
    color: #0a83e3;
}

.future-schedule .circle {
    background-color: #0a83e3;
}

.using-schedule {
    color: #0f9812;
}

.using-schedule .circle {
    background-color: #0f9812;
}

.passed-schedule {
    color: #686868;
}

.passed-schedule .circle {
    background-color: #686868;
}

.ungrouped-schedule {
    color: #c61818;
}

.ungrouped-schedule .circle {
    background-color: #c61818;
}

.sticky-header {
    position: sticky;
    top: 0; /* 确保它粘在容器顶部 */
    z-index: 10; /* 确保组头位于列表项之上 */
}

.q-list {
    background-color: transparent; /* 列表背景透明，让 q-page 的背景透出来 */
}

::v-deep .q-item {
    padding: 10px 5px; /* 增加内边距 */
    margin-bottom: 8px; /* 卡片之间的间距 */
    transition: all 0.2s;
}

::v-deep .q-item:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 悬停时增强阴影 */
    transform: translateY(-1px);
}

.rounded-icon {
    width: fit-content;
    padding: 1px 10px;
    text-align: center;
    align-items: center;
    display: inline-block;
    border-radius: 5px;
}

::v-deep .q-expansion-item--popup .q-expansion-item__container {
    border: none;
}

::v-deep .q-expansion-item--popup.q-expansion-item--expanded {
    padding-top: 0;
    padding-bottom: 0;
}

.schedule-item-attr {
    color: white;
}

.workday {
    background-color: var(--q-primary);
}

.weekend {
    background-color: var(--q-red);
}

.holiday {
    background-color: var(--q-holdiay);
}

.interactive {
    transition: .3s;
}

.interactive:active {
    background: #353535;
}
</style>
