<template>
    <bottom-modal :display="display" @close="handleClose" :content-height="'90vh'" :content-width="'100vw'"
                  name="line-realtime-view"
                  :after-close="afterClose">
        <template v-slot:default>
            <div ref="container" class="container" style="position:absolute;left:0;">
                <span @click="handleClickTrainIcon(train)"
                      class="pentagon down-pentagon"
                      style="width: 80px;position: absolute;display: flex;justify-content: center;"
                      v-for="train in upTrains" :key="train.id"
                      :style="{top:train.yPosition+'px',height:TRAIN_ICON_HEIGHT+'px',right:train.xPosition+'px'}">
                <span>
                <svg width="25" height="40" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" class="icon"
                     version="1.1">
                    <g>
                        <path
                            d="m824.11102,0c58.80686,0 106.496,47.43837 106.496,105.93175l0,659.12164a106.11984,106.11984 0 0 1 -92.68245,105.03314l154.72849,153.91347l-100.41469,0l-153.82988,-153.01486l-452.85878,0l-153.80897,153.01486l-100.3938,0l155.98237,-155.16735a106.11984,106.11984 0 0 1 -84.992,-103.77926l0,-659.10074c0,-58.53518 47.71004,-105.95265 106.496,-105.95265l615.27771,0zm35.50563,576.74188l-686.28898,0l0,188.31151c0,19.49779 15.88245,35.31755 35.50564,35.31755l615.27771,0c19.60229,0 35.50563,-15.81976 35.50563,-35.31755l0,-188.31151zm-556.11559,70.6142c16.90645,0 32.53812,8.98612 40.9809,23.5311a46.87412,46.87412 0 0 1 0,47.08311a47.37567,47.37567 0 0 1 -40.9809,23.552a47.20849,47.20849 0 0 1 -47.33388,-47.08311a47.20849,47.20849 0 0 1 47.33388,-47.0831zm425.9631,0c16.90645,0 32.53813,8.98612 40.9809,23.5311a46.87412,46.87412 0 0 1 0,47.08311a47.37567,47.37567 0 0 1 -40.9809,23.552a47.20849,47.20849 0 0 1 -47.33387,-47.08311a47.20849,47.20849 0 0 1 47.33387,-47.0831zm-248.47673,-400.19592l-307.68065,0l0,258.94662l307.63885,0l0,-258.92572l0.0418,-0.0209zm378.62922,0l-307.63885,0l0,258.94662l307.61796,0l0,-258.92572l0.02089,-0.0209zm-35.50563,-176.52506l-615.27771,0c-19.60229,0 -35.50564,15.81976 -35.50564,35.31755l0,70.63511l686.28898,0l0,-70.63511c0,-19.49779 -15.88245,-35.31755 -35.50563,-35.31755z"
                            fill="#111111" id="svg_1"/>
                        <rect id="svg_2" height="260.99999" width="309.99999" y="244.89238" x="173.2361"
                              :fill="train.lineColor"/>
                        <rect id="svg_3" height="260.99999" width="309.99999" y="244.89238" x="551.2361"
                              :fill="train.lineColor"/>
                    </g>
                </svg>
            </span>
            <span
                class="show-in-2-lines train-direction-info-text"
                style="bottom: 0;
                   padding-top:1px;
                   border-bottom-left-radius: 15px;
                   border-bottom-right-radius: 15px"
                :style="{backgroundColor:train.lineColor}"
            >
                {{ train.overviewText }}
            </span>
        </span>

                <span @click="handleClickTrainIcon(train)"
                      class="pentagon up-pentagon"
                      style="width: 80px;position: absolute;display: flex;justify-content: center;"
                      v-for="train in downTrains" :key="train.id"
                      :style="{top:train.yPosition+'px',height:TRAIN_ICON_HEIGHT+'px',left:train.xPosition+'px'}">
            <span
                class="show-in-2-lines train-direction-info-text"
                style="padding-top: 3px;
                top: 0;
                border-top-left-radius: 15px;
                border-top-right-radius: 15px"
                :style="{backgroundColor:train.lineColor}">
                {{ train.overviewText }}
            </span>

            <span style="margin-top: 30px;">
                <svg width="25" height="40" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" class="icon"
                     version="1.1">
                    <g>
                        <path
                            d="m824.11102,0c58.80686,0 106.496,47.43837 106.496,105.93175l0,659.12164a106.11984,106.11984 0 0 1 -92.68245,105.03314l154.72849,153.91347l-100.41469,0l-153.82988,-153.01486l-452.85878,0l-153.80897,153.01486l-100.3938,0l155.98237,-155.16735a106.11984,106.11984 0 0 1 -84.992,-103.77926l0,-659.10074c0,-58.53518 47.71004,-105.95265 106.496,-105.95265l615.27771,0zm35.50563,576.74188l-686.28898,0l0,188.31151c0,19.49779 15.88245,35.31755 35.50564,35.31755l615.27771,0c19.60229,0 35.50563,-15.81976 35.50563,-35.31755l0,-188.31151zm-556.11559,70.6142c16.90645,0 32.53812,8.98612 40.9809,23.5311a46.87412,46.87412 0 0 1 0,47.08311a47.37567,47.37567 0 0 1 -40.9809,23.552a47.20849,47.20849 0 0 1 -47.33388,-47.08311a47.20849,47.20849 0 0 1 47.33388,-47.0831zm425.9631,0c16.90645,0 32.53813,8.98612 40.9809,23.5311a46.87412,46.87412 0 0 1 0,47.08311a47.37567,47.37567 0 0 1 -40.9809,23.552a47.20849,47.20849 0 0 1 -47.33387,-47.08311a47.20849,47.20849 0 0 1 47.33387,-47.0831zm-248.47673,-400.19592l-307.68065,0l0,258.94662l307.63885,0l0,-258.92572l0.0418,-0.0209zm378.62922,0l-307.63885,0l0,258.94662l307.61796,0l0,-258.92572l0.02089,-0.0209zm-35.50563,-176.52506l-615.27771,0c-19.60229,0 -35.50564,15.81976 -35.50564,35.31755l0,70.63511l686.28898,0l0,-70.63511c0,-19.49779 -15.88245,-35.31755 -35.50563,-35.31755z"
                            fill="#111111" id="svg_1"/>
                        <rect id="svg_2" height="260.99999" width="309.99999" y="244.89238" x="173.2361"
                              :fill="train.lineColor"/>
                        <rect id="svg_3" height="260.99999" width="309.99999" y="244.89238" x="551.2361"
                              :fill="train.lineColor"/>
                    </g>
                </svg>
            </span>
        </span>
            </div>

            <span class="tool-wrapper" @click="handleRefresh"
                  style="z-index: 20;position: absolute;right: 20px;bottom: 150px;font-size: 32px;color: var(--q-primary)">
                <q-icon name="update"/>
            </span>
            <span class="tool-wrapper" @click="saveLineTemplate"
                  style="z-index: 20;position: absolute;right: 20px;bottom: 200px;font-size: 28px;color: var(--q-primary)">
                <q-icon name="fa fa-download"/>
            </span>
        </template>
    </bottom-modal>
    <MultipleTrainSelector ref="multipleTrainSelector" @select="handleShowTrainInfoDetail"/>
</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useStore} from "vuex";
import {drawMetroLine} from "src/utils/canvas-utils";
import _ from "lodash";
import {diff, diffFromNow} from "src/utils/time-utils";
import {categoryParser, TRAIN_CATEGORY} from "src/models/Train";
import {useI18n} from "vue-i18n";
import BottomModal from "components/common/BottomModal.vue";
import Canvas2SVG from 'canvas2svg';
import {useQuasar} from "quasar";
import {arr2Map} from "src/utils/array-utils";
import MultipleTrainSelector from "components/input/MultipleTrainSelector.vue";

const LINE_TEMPLATE_DOC_ID = 'line-template-svg'
let positions = []
const TRAIN_ICON_HEIGHT = 70
let prefix = null
const onServiceTrains = ref({})
let positionMap = new Map()
const emit = defineEmits(['close'])
const stationMap = ref(new Map())
const container = ref(null)
const display = ref(false)
const multipleTrainSelector = ref(null)
const $q = useQuasar()
const handleClose = () => {
    display.value = false
}
const store = useStore()
const isFromUrl = ref(false)
const shownLineId = computed(() => {
    return store.getters['application/shownLineRealtime']
})
watch(shownLineId, (newVal, oldVal) => {
    if (newVal) {
        display.value = true
        init()
    }
})
const CANVAS_BASE_WIDTH = computed(() => {
    return window.innerWidth <= 500 ? window.innerWidth : 500
})

function afterClose() {
    if (isFromUrl.value) {
        if (prefix) {
            router.push(prefix)
        } else {
            router.push('/')
        }
    }
    isFromUrl.value = false
    store.commit('application/SET_SHOWN_LINE_REALTIME', {lineId: null})
    emit('close')
}

const {t} = useI18n()
const calcTrainLineColor = (train, lineInfo) => {
    if (!train) return '#6c6c6c'
    const baseColor = lineInfo.color || '#6c6c6c'

    const _trainCategory = categoryParser(train.category)
    if (_trainCategory !== TRAIN_CATEGORY.LOCAL) {
        return (_trainCategory && _trainCategory.bgColor) || baseColor
    }
    return baseColor
}

const handleRefresh = () => {
    initTrains().then(_ => {
        $q.notify.ok('列车信息已更新')
    })
}

const saveLineTemplate = () => {
    const scale = 3
    drawMetroLine(drawConfig.value, {
        scaleFactor: scale,
        canvasWidth: CANVAS_BASE_WIDTH.value,
        addClickableArea,
        handleClicKStation,
        lineInfoLoader,
        stationMap: stationMap.value,
        handleClickLine,
        getBranchStations,
        stationGetter: (stationId) => store.dispatch('railsystem/getStation', {stationId})
    }).then(svgDoc => {
        const svgData = new XMLSerializer().serializeToString(svgDoc.documentElement)
        const svgBlob = new Blob([svgData], {type: 'image/svg+xml'})
        const svgUrl = URL.createObjectURL(svgBlob)

        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)

            // Export canvas to PNG
            const pngData = canvas.toDataURL('image/png')

            // Create a download link
            const link = document.createElement('a')
            link.href = pngData
            link.download = 'line-template.png'
            link.click()
        };
        img.src = svgUrl
    })
}
const handleClickTrainIcon = (trainInfo) => {
    if (trainInfo) {
        const positionTrains = positionMap.get(trainInfo.positionKey)
        if (positionTrains.length === 1) {
            handleShowTrainInfoDetail(trainInfo)
        } else if (positionTrains.length > 1) {
            multipleTrainSelector.value.show(positionTrains)
        }
    }
}
const handleShowTrainInfoDetail = (trainInfo) => {
    if (trainInfo) {
        store.commit('application/SET_SHOWN_TRAININFO', {trainInfo})
    }
}
const trainXPosition = computed(() => {
    return Math.round(CANVAS_BASE_WIDTH.value / 2) - 95
})

const downTrains = computed(() => {
    if (drawConfig.value) {
        const direction = drawConfig.value.reverse ? 1 : 0
        return Array.from(Object.values(onServiceTrains.value)).filter(it => it.direction === direction)
    } else {
        return []
    }
})
const upTrains = computed(() => {
    if (drawConfig.value) {
        const direction = drawConfig.value.reverse ? 0 : 1
        return Array.from(Object.values(onServiceTrains.value)).filter(it => it.direction === direction)
    } else {
        return []
    }
})


const lineInfoLoader = async (lineId) => {
    if (lineId) {
        return await store.dispatch('railsystem/getLine', {lineId})
    }
}


function addClickableArea(rect, callBack, ...params) {
    positions.push({
        area: rect,
        callBack,
        params: params
    })
}

/**
 * 获取分支站点列表
 */
function getBranchStations(stations, intersectionId, extraLineConfigType) {
    const interIndex = stations.findIndex(s => s.id === intersectionId);
    if (extraLineConfigType === 'THROUGH') {
        return stations.slice(interIndex)
    } else {
        return [stations[interIndex]]
    }
}

function handleClicKStation(station) {
    if (station && station.id) {
        store.dispatch('application/showStationRealtimeModal', {stationId: station.id})
    }
}

const handleClickLine = _.debounce((lineId) => {
    if (lineId) {
        loadDrawConfig(lineId).then(_ => {
            store.commit('application/SET_SHOWN_LINE_REALTIME', {lineId})
        }).catch((e) => {
            $q.notify.info('该线路暂不支持线路实况')
        })
    }
}, 1000)


async function calcTrainPosition(train) {
    const lineInfo = await lineInfoLoader(train.lineId)
    const timezone = lineInfo.stations[0].timezone
    const branchStationMap = arr2Map(drawConfig.value.branchStations || [], 'stationId')
    const nextStopIndex = train.schedule.map(stop => diffFromNow(stop.arr, 'second', timezone))
        .sort((a, b) => a - b).findIndex(it => it > 0)
    if (nextStopIndex > 0) {
        const nextStop = train.schedule[nextStopIndex]
        train.nextStop = nextStop
        const lastStop = train.schedule[nextStopIndex - 1]
        let rawYPosition
        const depDiff = diffFromNow(lastStop.dep, 'second', timezone)
        let nextStopPosition = stationMap.value.get(nextStop.stationId)
        if (depDiff < 0) {
            //在lastStop和nextStop之间
            let lastStopPosition = stationMap.value.get(lastStop.stationId)
            if (!lastStopPosition && !nextStopPosition) {
                return null
            } else if (lastStopPosition && !nextStopPosition) {
                //跨线车 本站在本线上 下站不在本线上
                const branchStation = branchStationMap.get(nextStop.stationId)
                const connectedStation = branchStation && stationMap.value.get(branchStation.connectStationId)
                if (connectedStation) {
                    nextStopPosition = connectedStation
                } else {
                    return null
                }
            } else if (nextStopPosition && !lastStopPosition) {
                //跨线车 下站在本线上 本站不在本线上
                const branchStation = branchStationMap.get(lastStop.stationId)
                const connectedStation = branchStation && stationMap.value.get(branchStation.connectStationId)
                if (connectedStation) {
                    lastStopPosition = connectedStation
                } else {
                    return null
                }
            }
            const yIndexDiff = Math.abs(nextStopPosition.yIndex - lastStopPosition.yIndex)
            if (yIndexDiff > 1) {
                const intervalTotalTime = diff(nextStop.arr, lastStop.dep)
                const intervalIndex = Math.floor((depDiff / intervalTotalTime) / (1 / yIndexDiff))
                const direction = (nextStopPosition.yPosition - lastStopPosition.yPosition) > 0 ? 1 : -1
                const segmentHeight = Math.abs(nextStopPosition.yPosition - lastStopPosition.yPosition) / yIndexDiff
                rawYPosition = lastStopPosition.yPosition + (0.5 + intervalIndex) * segmentHeight * direction
            } else {
                rawYPosition = (lastStopPosition.yPosition + nextStopPosition.yPosition) / 2
            }
        } else {
            //停在lastStop
            const lastStopPosition = stationMap.value.get(lastStop.stationId)
            if (!lastStopPosition) return null
            train.currentStop = lastStop
            rawYPosition = lastStopPosition.yPosition
        }
        const position = {}
        position.yPosition = rawYPosition - TRAIN_ICON_HEIGHT / 2
        position.xPosition = trainXPosition.value
        const key = `${train.direction}-${position.xPosition}-${position.yPosition}`
        const positionTrain = positionMap.has(key) && positionMap.get(key)[0]
        if (!positionTrain) {
            train.positionKey = key
            train.xPosition = position.xPosition
            train.yPosition = position.yPosition
            positionMap.set(key, [train])
            return position
        } else if (positionTrain.id !== train.id) {
            //位置冲突
            if (positionTrain.hash === train.hash) {
                return null
            }
            const group = positionMap.get(key)
            position.xPosition = trainXPosition.value - 20 * group.length
            train.xPosition = position.xPosition
            train.yPosition = position.yPosition
            positionMap.get(key).push(train)
            return position
        } else {
            train.xPosition = position.xPosition
            train.yPosition = position.yPosition
            return position
        }
    } else {
        return null
    }
}

const updateTrainPositions = () => {
    positionMap = new Map()
    Array.from(Object.values(onServiceTrains.value)).forEach(async t => {
        await calcTrainPosition(t).then(position => {
            if (!position) {
                if (onServiceTrains.value[t.hash]) {
                    delete onServiceTrains.value[t.hash]
                }
            } else {
                t.yPosition = position.yPosition
                t.xPosition = position.xPosition
            }
        })
    })
}

async function loadTrains(lineIds) {
    for (const lineId of lineIds) {
        if (!lineId) return
        const lineInfo = await lineInfoLoader(lineId)
        const trains = await store.dispatch('realtime/getLineOnServiceTrains', {lineId})
        for (const train of trains) {
            train.lineId = lineId
            // 是否展示车次
            train.showTrainNo = drawConfig.value.showTrainNo ? train.trainNo : null

            train.overviewText = `${t(`trainCategory.${TRAIN_CATEGORY[train.category].code}`)} · ${train.schedule.slice(-1)[0].stationName}`
            if (train.showTrainNo) {
                train.overviewText = train.overviewText + " " + train.showTrainNo
            }

            train.lineColor = calcTrainLineColor(train, lineInfo)
            positionMap = new Map()
            await calcTrainPosition(train).then(position => {
                if (position) {
                    train.yPosition = position.yPosition
                    train.xPosition = position.xPosition
                    onServiceTrains.value[train.hash] = train
                }
            })
        }
    }
}


onMounted(() => {
})

async function loadDrawConfig(lineId) {
    const template = await store.dispatch('railsystem/getLineCanvasConfig', {lineId})
    if (template) {
        return template
    } else {
        return Promise.reject(`No template for lineId:${lineId}`)
    }
}

const drawConfig = ref(null)

async function initTrains() {
    if (drawConfig.value) {
        const throughLineIds = drawConfig.value.extraLines.filter(it => it.type === 'THROUGH').map(it => it.lineId)
        return loadTrains([shownLineId.value, ...throughLineIds]).then(_ => {
            updateTrainPositions()
        })
    }
}

let updateTrainInterval

function init() {
    const lineId = shownLineId.value
    if (!lineId) return
    onServiceTrains.value = {}
    positionMap = new Map()
    positions = []

    updateTrainInterval = setInterval(() => {
        initTrains()
    }, 16000)

    loadDrawConfig(lineId).then(_drawConfig => {
        drawConfig.value = _drawConfig
        drawMetroLine(_drawConfig, {
            addClickableArea,
            canvasWidth: CANVAS_BASE_WIDTH.value,
            handleClicKStation,
            lineInfoLoader,
            stationMap: stationMap.value,
            handleClickLine,
            getBranchStations,
            stationGetter: (stationId) => store.dispatch('railsystem/getStation', {stationId})
        }).then(svgDoc => {
            const oldNode = container.value.querySelector(`#${LINE_TEMPLATE_DOC_ID}`)
            if (oldNode) {
                oldNode.remove()
            }
            svgDoc.documentElement.setAttribute('id', LINE_TEMPLATE_DOC_ID)
            svgDoc.documentElement.addEventListener('click', handleCanvasClick)
            container.value.appendChild(svgDoc.documentElement)
        })
        initTrains()
    })
}

onBeforeUnmount(() => {
    clearInterval(updateTrainInterval)
})

const handleCanvasClick = _.debounce((event) => {
    const svg = document.getElementById(LINE_TEMPLATE_DOC_ID)
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    // 获取点击位置（相对于 target 内部）
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top
    const clickedPosition = positions.find(({area}) => {
        if (clickX >= area.from.x && clickX <= area.to.x) {
            if (clickY >= area.from.y && clickY <= area.to.y) {
                return true
            }
        }
        return false
    })
    if (clickedPosition) {
        if (clickedPosition.callBack) {
            clickedPosition.callBack(...clickedPosition.params)
        }
    }

}, 100)
</script>

<style scoped>
.container {
    height: 80vh;
    overflow-y: auto;
}

.pentagon {
    position: relative;
    background-color: var(--q-background);
    box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3); /* 给五边形添加阴影 */
}

.down-pentagon {
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
}

.down-pentagon::before {
    content: '';
    position: absolute;
    top: -20px; /* 三角形的位置 */
    left: 50%;
    transform: translateX(-50%);
    border-left: 40px solid transparent; /* 左侧透明边 */
    border-right: 40px solid transparent; /* 右侧透明边 */
    border-bottom: 20px solid var(--q-background-grey); /* 三角形的高度 */
}

.up-pentagon {
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
}

.up-pentagon::before {
    content: '';
    position: absolute;
    bottom: -20px; /* 三角形的位置 */
    left: 50%;
    transform: translateX(-50%);
    border-left: 40px solid transparent; /* 左侧透明边 */
    border-right: 40px solid transparent; /* 右侧透明边 */
    border-top: 20px solid var(--q-background-grey); /* 三角形的高度 */
}

.train-direction-info-text {
    position: absolute;
    font-weight: bold;
    height: 30px;
    color: white;
    font-size: 12px;
    padding-left: 3px;
    padding-right: 3px;
    line-height: 14px;
    width: 100%;
    text-align: center;

}

.tool-wrapper {
    color: var(--q-normal);
    background-color: var(--q-background);
    box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3);
    height: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    position: absolute;
    right: 0;
    bottom: 40px;
    transition: 0.5s;
    opacity: 50%;
}

.tool-wrapper:active {
    opacity: 100%;

}
</style>
