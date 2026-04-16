<template>
    <q-card style="width: 90vw; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column;">
        <q-card-section>
            <div class="text-h6">{{ lineData?.id ? '编辑线路' : '新建线路' }}</div>
        </q-card-section>

        <q-separator/>

        <q-card-section style="flex: 1; overflow-y: auto;">
            <q-form @submit.prevent="submitForm" ref="formRef">
                <!-- 线路名称 -->
                <q-input
                    v-model="lineData.name"
                    required
                    :rules="[val => !!val || 'Line name can not be empty']"
                    class="q-mb-md"
                    label-slot>
                    <template #label>
                        <span>线路名称 <span class="text-negative">*</span></span>
                    </template>
                </q-input>

                <q-input
                    v-model="lineData.code"
                    label="线路代码"
                    class="q-mb-md"
                />

                <q-input
                    v-model="lineData.enName"
                    label="英文名称"
                    class="q-mb-md"
                />

                <q-select
                    v-model="lineData.status"
                    :options="statusOptions"
                    label="线路状态"
                    class="q-mb-md"
                    required
                    map-options
                />

                <!-- 线路类别 -->
                <q-select
                    v-model="lineData.category"
                    :options="categoryOptions"
                    label="线路类别"
                    class="q-mb-md"
                    required
                />

                <!-- 环线选择 -->
                <q-checkbox
                    v-model="lineData.isCircle"
                    label="是否为环线"
                    class="q-mb-md"
                />

                <!-- 线路颜色选择 -->
                <q-item-label class="q-mt-sm">线路颜色</q-item-label>
                <q-color
                    v-model="lineData.color"
                    label="选择颜色"
                    format-model="hex"
                    display-mode="compact"
                    class="q-mb-md"
                />

                <q-expansion-item expand-separator default-opened>
                    <template v-slot:header>
                        <q-item-label class="q-mt-sm text-weight-bold">车站列表</q-item-label>
                        <q-space/>
                        <q-checkbox v-model="enableDistanceLock" label="距离联动"></q-checkbox>
                    </template>
                    <!-- 车站列表 -->
                    <q-btn label="快速添加车站" color="primary">
                        <q-popup-proxy>
                            <q-card style="min-width: 320px; max-width: 90vw;">
                                <q-card-section>
                                    <div class="text-h6 text-center text-primary">快速添加车站</div>
                                </q-card-section>
                                <q-card-section>
                                    <q-input
                                        v-model="quickImportStationText"
                                        type="textarea"
                                        hint="支持空格、逗号或换行分隔"
                                        outlined
                                        style="--q-field-control-bg: #f0f0f0;"
                                    />
                                </q-card-section>
                                <q-card-section v-if="quickAddMatchResult" class="q-pt-none">
                                    <q-banner
                                        dense
                                        :class="quickAddMatchResult.unmatchedCount > 0 ? 'bg-orange-1 text-orange-10' : 'bg-green-1 text-green-10'"
                                        rounded
                                    >
                                        <div class="text-caption">
                                            <div>匹配成功: {{ quickAddMatchResult.matchedCount }} 个</div>
                                            <div v-if="quickAddMatchResult.unmatchedCount > 0">
                                                未匹配: {{ quickAddMatchResult.unmatchedCount }} 个（已添加为新增车站）
                                            </div>
                                        </div>
                                    </q-banner>
                                </q-card-section>
                                <q-card-actions align="right">
                                    <q-btn
                                        label="匹配"
                                        color="primary"
                                        :loading="quickAddLoading"
                                        @click="handleQuickAddStations(quickImportStationText)"
                                    />
                                </q-card-actions>
                            </q-card>
                        </q-popup-proxy>
                    </q-btn>
                    <q-item class="row text-primary">
                        <q-item-section class="col-1">序号</q-item-section>
                        <q-item-section class="col-3">车站名</q-item-section>
                        <q-item-section>前站距离(m)</q-item-section>
                        <q-item-section>下站距离(m)</q-item-section>
                    </q-item>
                    <draggable
                        v-model="lineStations"
                        item-key="id"
                        tag="q-list"
                        class="q-mb-md"
                        handle=".drag-handle"
                    >
                        <template #item="{ element, index }">
                            <q-item class="row">
                                <q-item-section class="col-1 items-center justify-center drag-handle"
                                                style="text-align: center;">
                                    <q-avatar color="primary" text-color="white" size="24px"
                                              @click="callSetStationIndex(index)">
                                        {{ index + 1 }}
                                    </q-avatar>
                                </q-item-section>
                                <q-item-section class="col-3">
                                    <span>{{ element.name }}</span>
                                    <span v-if="!!element.isNew" style="color: var(--q-green)">*{{ t('_new') }}</span>
                                </q-item-section>
                                <q-item-section>
                                    <q-input v-model="element.preDistance" type="number" :disable="index===0"
                                             @update:model-value="(val)=>handleDistanceChange(index,val,'previous')"/>
                                </q-item-section>
                                <q-item-section>
                                    <q-input v-model="element.nextDistance" type="number"
                                             @update:model-value="(val)=>handleDistanceChange(index,val,'next')"
                                             :disable="index===lineStations.length-1"/>
                                </q-item-section>
                                <q-item-section side>
                                    <q-btn
                                        dense
                                        flat
                                        icon="delete"
                                        color="negative"
                                        @click="removeStation(index)"
                                    />
                                    <q-btn
                                        v-if="element.isNew"
                                        dense
                                        flat
                                        icon="add"
                                        color="green"
                                        @click="_createStation({name:element.name})"
                                    />
                                </q-item-section>
                            </q-item>
                        </template>
                    </draggable>
                    <div class="row q-gutter-sm justify-around" style="margin-top: 5px;">
                        <q-btn
                            label="添加车站"
                            icon="playlist_add"
                            color="blue"
                            @click="addStation"
                        />
                        <q-btn
                            label="创建车站"
                            color="green"
                            icon="add"
                            @click="_createStation"
                        />
                        <q-btn
                            label="地图选点"
                            color="green"
                            icon="map"
                            @click="showStationLocationPicker"
                        />
                        <q-btn
                            icon="restore"
                            label="恢复车站"
                            color="grey"
                            @click="restoreStations"
                        />
                    </div>
                </q-expansion-item>


                <!-- 保存按钮 -->
                <div class="q-gutter-md row justify-end q-mt-md">
                    <q-btn v-if="props.initial?.id" label="删除" color="red-9" @click="confirmDelete"/>
                    <q-btn label="取消" flat color="grey" @click.stop="emits('close')"/>
                    <q-btn label="保存" type="submit" color="primary" :loading="loading"/>
                </div>
            </q-form>
        </q-card-section>
    </q-card>
    <station-selector ref="stationSelector" :railsystem-code="lineData?.railsystemCode" @select="handleSelectStation"
                      :multiple="true"/>
    <q-dialog v-model="showStationForm" v-if="!!(props.initial?.id)">
        <station-form :initial="createStationInitial" @saved="handleSavedStation"/>
    </q-dialog>
    <q-dialog v-model="showSetStationIndex">
        <q-card>
            <q-card-section>
                <div class="flex" style="align-items: center; gap: 4px;">
                    <span>当前序号:</span>
                    <span class="text-bold">{{ currentStationIndex + 1 }}</span>
                    <span>最大编号: {{ lineStations.length }}</span>
                </div>
            </q-card-section>
            <q-card-section>
                <div class="flex" style="align-items: center;gap: 4px;">
                    <span>设定序号:</span>
                    <q-input v-model="newStationIndex" type="number" :min="1" :max="lineStations.length"/>
                </div>
            </q-card-section>
            <q-card-section>
                <q-btn-group style="gap: 4px;">
                    <q-btn color="green" @click.stop="handleSetStationIndex('insert')">插入</q-btn>
                    <q-btn color="red" @click.stop="handleSetStationIndex('exchange')">交换</q-btn>
                </q-btn-group>
            </q-card-section>
        </q-card>
    </q-dialog>
    <OsmLocationPicker multiple :display="displayLocationPicker"
                       :model-value="stationLocations" format="lon-lat"
                       @update:model-value="onPickStationLocation"
                       @close="displayLocationPicker=false"
    >
        <template v-slot:default>
            <div
                style="position: fixed; top: 0; height: 250px;background-color: rgba(255,255,255,0.4); backdrop-filter: blur(8px);"
                class="scroll full-width"
                v-if="batchEditStations.length>0">
                <StationBatchEditForm :stations-prop="batchEditStations" @remove="handleRemoveStation"
                                      @submit="handleBatchEditSubmit"/>
            </div>
        </template>
    </OsmLocationPicker>

</template>

<script setup>
import {onMounted, ref} from 'vue';
import draggable from 'vuedraggable';
import {createLine, createStation, deleteLine, fetchLine, preDeleteLine, updateLine} from 'src/apis/railsystem';
import StationSelector from "components/input/StationSelector.vue";
import StationForm from "components/form/StationForm.vue";
import {RAILSYSTEM_CATEGORIES} from "src/models/Railsystem";
import {useQuasar} from "quasar";
import OsmLocationPicker from "components/input/OsmLocationPicker.vue";
import StationBatchEditForm from "components/form/StationBatchEditForm.vue";
import {useStore} from "vuex";
import {useI18n} from "vue-i18n";

const store = useStore()
const displayLocationPicker = ref(false)
const quickImportStationText = ref('')
const quickAddLoading = ref(false)
const quickAddMatchResult = ref(null)
const formRef = ref(null)
const {t} = useI18n()
const showStationForm = ref(false)
const showSetStationIndex = ref(false)
const newStationIndex = ref(1)
const currentStationIndex = ref(0)
const props = defineProps({
    initial: Object
})
const enableDistanceLock = ref(true)
const handleDistanceChange = (index, value, distanceType) => {
    if (!enableDistanceLock.value) return;
    if (isNaN(Number(value))) return
    if (distanceType === 'previous' && index > 0) {
        lineStations.value[index - 1].nextDistance = value
    } else if (distanceType === 'next' && index < lineStations.value.length - 1) {
        lineStations.value[index + 1].preDistance = value
    }
}

const callSetStationIndex = (currentIndex) => {
    showSetStationIndex.value = true
    currentStationIndex.value = currentIndex
}
const handleSetStationIndex = (changeType) => {
    const targetIndex = newStationIndex.value - 1
    const currentIndex = currentStationIndex.value
    const toMove = lineStations.value[currentIndex]
    if (changeType === "insert") {
        lineStations.value.splice(currentIndex, 1)
        lineStations.value.splice(targetIndex, 0, toMove)
    } else if (changeType === 'exchange') {
        lineStations.value[currentIndex] = lineStations.value[targetIndex]
        lineStations.value[targetIndex] = toMove
    }
}

const emits = defineEmits(['saved'])
const stationSelector = ref(null)
const $q = useQuasar()
const loading = ref(false)
const rawStations = ref([])
const lineStations = ref([])
const statusOptions = ref([
    {label: '关闭', value: 0},
    {label: '运营中', value: 1}
])
const categoryOptions = RAILSYSTEM_CATEGORIES;
const lineData = ref({
    status: 1,
})
const createStationInitial = ref({lineId: lineData.value?.id})
const batchEditStations = ref([])
const stationLocations = ref([])
onMounted(async () => {
    let dialog
    if (!!(props.initial?.id)) {
        try {
            dialog = $q.dialog({
                message: '加载线路中',
                persistent: true,
                ok: false,
                progress: true,
                style: 'width: 250px; height: 200px; background-color: rgba(0, 0, 0, 0.6);color: #ffffff;',
            })
            const line = await fetchLine(props.initial.id, true)
            Object.assign(lineData.value, line,)
            rawStations.value = [...line.stations]
            lineStations.value = [...line.stations]
        } catch (err) {
            $q.notify.error('加载线路失败')
        } finally {
            dialog?.hide()
        }
    } else {
        if (props.initial instanceof Object) {
            Object.assign(lineData.value, props.initial)
        }
        rawStations.value = []
        lineStations.value = []
    }
    lineData.value.railsystem = props.initial?.railsystem
})

const handleSelectStation = async (stations) => {
    if (stations instanceof Array) {
        stations.forEach(it => {
            lineStations.value.push(it)
        })
    }
}

const restoreStations = () => {
    lineStations.value = [...rawStations.value]
}

function addStation() {
    stationSelector.value.showSelector('addLineStation')
}

function handleSavedStation(savedStation) {
    const newItemIndex = lineStations.value.findIndex(it => savedStation.name === it.name && it?.isNew)
    if (newItemIndex !== -1) {
        // Replace the new station to saved station
        lineStations.value[newItemIndex] = savedStation
    } else {
        lineStations.value.push(savedStation)
    }
}

function _createStation(data) {
    if (data instanceof Object) {
        createStationInitial.value = {
            ...createStationInitial.value,
            ...data,
        }
    }
    createStationInitial.value.railsystem = lineData.value?.railsystem
    showStationForm.value = true
}

function showStationLocationPicker() {
    displayLocationPicker.value = true
}

const handleRemoveStation = (index) => {
    stationLocations.value.splice(index, 1)
    batchEditStations.value.splice(index, 1)
}

const handleQuickAddStations = async (text) => {
    text = String(text || '')
    if (!text || text === "") {
        return
    }
    const railsystemCode = props.initial?.railsystem?.code
    if (!railsystemCode) {
        $q.notify.error('无法匹配: 线网代码缺失')
        return
    }

    quickAddLoading.value = true
    quickAddMatchResult.value = null

    try {
        let names = []
        if (text.indexOf('\n') !== -1) {
            names = text.split('\n')
        } else if (text.indexOf(',') !== -1) {
            names = text.split(',')
        } else if (text.indexOf(' ') !== -1) {
            names = text.split(' ')
        } else {
            names = [text]
        }
        names = names.map(it => it.trim()).filter(it => it.length > 0)
        const matchedStations = await store.dispatch('railsystem/matchStationByNames', {names, railsystemCode})
        if (matchedStations) {
            const matched = []
            const unmatched = []
            for (const [name, station] of matchedStations.entries()) {
                if (station?.isNew) {
                    unmatched.push(station)
                } else {
                    matched.push(station)
                }
            }

            quickAddMatchResult.value = {
                matchedCount: matched.length,
                unmatchedCount: unmatched.length
            }

            if (matched.length > 0) {
                lineStations.value.push(...matched)
            }

            if (unmatched.length > 0) {
                lineStations.value.push(...unmatched)
                quickImportStationText.value = unmatched.map(it => it.name).join(' ')
                $q.notify.warn(`成功匹配 ${matched.length} 个车站，${unmatched.length} 个未匹配，已添加为新增车站`)
            } else {
                quickImportStationText.value = ''
                $q.notify.ok(`快速添加车站成功: ${matched.length} 个`)
            }
        } else {
            $q.notify.error('快速添加车站失败')
        }
    } catch (err) {
        console.error('快速添加车站失败:', err)
        $q.notify.error('快速添加车站失败: ' + (err.message || ''))
    } finally {
        quickAddLoading.value = false
    }
}

const handleBatchEditSubmit = async (batchStations) => {
    stationLocations.value = []
    batchEditStations.value = []
    displayLocationPicker.value = false
    if (batchStations instanceof Array) {
        const railsystemCode = props.initial?.railsystem?.code
        if (!railsystemCode) {
            $q.notify.error('无法创建车站: 线网ID获取失败')
            return
        }
        const dialog = $q.dialog({
            message: '创建车站中...',
            persistent: true,
            ok: false,
            progress: true,
            style: 'width: 250px; height: 200px; background-color: rgba(0, 0, 0, 0.6);color: #ffffff;',
        })

        //TODO Batch create API
        const promises = batchStations.map(it =>
            createStation({
                name: it.name,
                location: it.location,
                railsystemCode,
                lineId: lineData.value?.id
            }))
        await Promise.all(promises).then(_ => {
            $q.notify.ok('创建车站成功')
        }).catch(e => {
            console.error('批量创建车站失败', e)
            $q.notify.error('创建车站失败!')
        }).finally(_ => {
            dialog.hide()
        })
    }
}

function removeStation(index) {
    lineStations.value.splice(index, 1);
}

async function submitForm() {
    if (formRef.value) {
        const valid = await formRef.value.validate();
        if (!valid) {
            return
        }
    }
    try {
        loading.value = true
        const payload = {
            ...lineData.value
        }
        payload.railsystemId = lineData.value?.railsystem?.id
        payload.status = payload?.status?.value
        payload.category = payload?.category?.value
        lineStations.value.forEach(it => {
            if (it?.isNew) {
                $q.notify.error("请先创建所有带*新增车站")
                throw new Error("Can not submit:contain new station")
            }
        })
        payload.stations = lineStations.value.map(it => {
            return {
                id: it.id,
                nextDistance: it?.nextDistance,
                preDistance: it?.preDistance,
            }
        })
        let saved
        if (lineData.value?.id) {
            saved = await updateLine(lineData.value?.id, payload);
            $q.notify.ok('保存线路成功')
        } else {
            saved = await createLine(payload);
            $q.notify.ok('创建线路成功')
        }
        emits('saved', saved)
    } catch (err) {
        console.error('保存线路失败:', err)
        $q.notify.error('保存线路失败')
    } finally {
        loading.value = false
    }
}

const onPickStationLocation = (locationArr) => {
    if (locationArr?.length > 0) {
        stationLocations.value = locationArr
        batchEditStations.value = locationArr.map(it => {
            return {
                name: '',
                location: it
            }
        })
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
        const preCheck = await preDeleteLine(stationId)
        authCode = preCheck?.authCode
        const connectedLines = preCheck?.notMatchedConditions?.station
        if (connectedLines && connectedLines?.length > 0) {
            hintHtml = `<div>该线路关联了${connectedLines.length}个车站:</div>`
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
        message: `<div>确定要删除该线路？</div>${hintHtml}`,
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
            const preCheck = await preDeleteLine(stationId)
            authCode = preCheck?.authCode
        }

        if (authCode) {
            deleteLine(stationId, authCode).then(r => {
                $q.notify.ok('删除线路成功')
            }).catch(e => {
                console.error('删除线路失败:', e)
                $q.notify.error('删除线路失败, 请稍后重试')
            })
        } else {
            $q.notify.error('删除线路失败, 请稍后重试')
        }
    }
}

</script>

<style scoped>
.q-list {
    border: 1px solid #ccc;
    border-radius: 4px;
    min-height: 50px;
}

.square-dialog .q-card {
    width: 100px; /* 设置宽度 */
    height: 100px; /* 设置高度 */
    max-width: 100%; /* 防止超出屏幕 */
    max-height: 100%; /* 防止超出屏幕 */
}
</style>
