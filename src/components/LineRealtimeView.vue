<template>
    <bottom-modal :display="display" @close="handleClose" :content-height="'90vh'" :content-width="'100vw'"
                  name="line-realtime-view"
                  :after-close="afterClose">
        <template v-slot:default>
            <div ref="container" class="container" style="position:absolute;left:0;">
                <span @click="handleShowTrainInfoDetail(train)"
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
                {{
                    t(`trainCategory.${TRAIN_CATEGORY[train.category].code}`)
                }} · {{ train.schedule.slice(-1)[0].stationName }}
            </span>
        </span>

                <span @click="handleShowTrainInfoDetail(train)"
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
                {{
                    t(`trainCategory.${TRAIN_CATEGORY[train.category].code}`)
                }} · {{ train.schedule.slice(-1)[0].stationName }}
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
        </template>
    </bottom-modal>

</template>

<script setup>
import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useStore} from "vuex";
import {drawRoundedLShape, drawRoundedRect} from "src/utils/canvas-utils";
import _ from "lodash";
import {diff, getNowByTimezone} from "src/utils/time-utils";
import {categoryParser, TRAIN_CATEGORY, trainLineOfStopParser} from "../models/Train";
import {useI18n} from "vue-i18n";
import BottomModal from "components/BottomModal.vue";
import Canvas2SVG from 'canvas2svg';
import {useQuasar} from "quasar";

let positions = []
const TRAIN_ICON_HEIGHT = 70
const TRAIN_ICON_WEIGHT = 80
let prefix = null
const onServiceTrains = ref({})
let positionMap = new Map()
const emit = defineEmits(['close'])
const stationMap = ref(new Map())
const container = ref(null)
const display = ref(false)
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
    const trainLines = trainLineOfStopParser(train)
    if (trainLines.length === 1) {
        return lineInfo.color || '#6c6c6c'
    } else {
        const _trainCategory = categoryParser(train.category)
        return (_trainCategory && _trainCategory.bgColor) || '#6c6c6c'
    }
}

const handleRefresh = () => {
    initTrains().then(_ => {
        $q.notify.ok('列车信息已更新')
    })
}

//TODO
const saveLineTemplate = () => {
    const scale = 3
    const domNode = document.getElementById('line-template-svg')
    if (!domNode) return
    // const newCanvas = document.createElement('canvas');
    // newCanvas.width = domNode.width * scale;
    // newCanvas.height = domNode.height * scale;
    // drawMetroLine(newCanvas, drawConfig.value, scale).then(r => {
    //     const imageDataUrl = newCanvas.toDataURL('image/png');
    //     const link = document.createElement('a');
    //     link.href = imageDataUrl;
    //     link.download = 'high-res-image.png';
    //     link.click();
    // })
}

const handleShowTrainInfoDetail = (trainInfo) => {
    if (trainInfo) {
        store.commit('application/SET_SHOWN_TRAININFO', {trainInfo})
    }
}
const trainXPosition = computed(() => {
    const domNode = document.getElementById('line-template-svg')
    if (domNode) {
        const width = domNode.getBoundingClientRect().width
        return Math.round(width / 2) - 95
    } else {
        return 0
    }
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
    const currentTime = getNowByTimezone(lineInfo.stations[0].timezone)
    const nextStopIndex = train.schedule.map(stop => diff(stop.arr, currentTime))
        .sort((a, b) => a - b).findIndex(it => it > 0)
    if (nextStopIndex > 0) {
        const nextStop = train.schedule[nextStopIndex]
        train.nextStop = nextStop
        const lastStop = train.schedule[nextStopIndex - 1]
        let rawYPosition
        if (diff(currentTime, lastStop.dep) > 0) {
            //在lastStop和nextStop之间
            rawYPosition = (stationMap.value.get(lastStop.stationId).yPosition
                + stationMap.value.get(nextStop.stationId).yPosition) / 2
        } else {
            //停在lastStop
            train.currentStop = lastStop
            rawYPosition = stationMap.value.get(lastStop.stationId).yPosition
        }
        const position = {}
        position.yPosition = rawYPosition - TRAIN_ICON_HEIGHT / 2
        position.xPosition = trainXPosition.value
        const key = `${train.direction}-${position.xPosition}-${position.yPosition}`
        const positionTrain = positionMap.get(key)
        if (!positionTrain) {
            positionMap.set(key, train)
        } else if (positionTrain.id !== train.id) {
            //位置冲突
            if (positionTrain.hash === train.hash) {
                return null
            }
            position.xPosition = position.xPosition - TRAIN_ICON_WEIGHT - 5
        }
        return position
    } else {
        return null
    }
}

const updateTrainPositions = () => {
    Array.from(Object.values(onServiceTrains.value)).forEach(t => {
        calcTrainPosition(t).then(position => {
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
        trains.forEach(t => {
            t.lineId = lineId
            t.lineColor = calcTrainLineColor(t, lineInfo)
            calcTrainPosition(t).then(position => {
                if (position) {
                    t.yPosition = position.yPosition
                    t.xPosition = position.xPosition
                    onServiceTrains.value[t.hash] = t
                }
            })
        })
    }
}

/**
 *
 * @param config 绘制配置
 * @param scaleFactor 放大倍数
 * @returns {Promise<void>}
 */
async function drawMetroLine(config, scaleFactor = 1) {
    const SEGMENT_LENGTH = 160 * scaleFactor // 站点间距
    const xPadding = 10 * scaleFactor
    const yPadding = 80 * scaleFactor
    const branchRadius = 30 * scaleFactor

    function drawLine(_ctx, lineInfo, width, from, to) {
        const {color, name} = lineInfo
        _ctx.beginPath()
        _ctx.moveTo(from.x, from.y)
        _ctx.lineTo(to.x, to.y)
        _ctx.strokeStyle = color
        _ctx.lineWidth = width
        _ctx.stroke()
    }

    function drawLineName(_ctx, lineInfo, position) {
        const {color, name} = lineInfo
        // 计算文本框位置
        const textPadding = 4 * scaleFactor;
        const fontSize = 10 * scaleFactor;
        const radius = 9 * scaleFactor;

        _ctx.font = `${fontSize}px Arial`;
        _ctx.textBaseline = "middle";
        _ctx.textAlign = "center";

        const textWidth = _ctx.measureText(name).width + textPadding * 4;
        const textHeight = fontSize + textPadding * 2;

        const isLeft = position.x === 0
        // 矩形框位置：在 `to` 点上方
        const rectX = isLeft ? xPadding : position.x - textWidth - xPadding;
        const rectY = isLeft ? position.y + 10 * scaleFactor : position.y - textHeight - 10 * scaleFactor; // 适当上移，避免重叠
        // 画圆角矩形
        _ctx.beginPath();
        _ctx.lineWidth = 2 * scaleFactor
        _ctx.strokeStyle = color;
        _ctx.fillStyle = color;
        drawRoundedRect(_ctx, rectX, rectY, textWidth, textHeight, radius);
        _ctx.fill();
        _ctx.stroke();

        // 填充文本
        _ctx.fillStyle = '#ffffff';
        const textStartX = isLeft ? (textWidth / 2) + xPadding : (position.x - textWidth / 2 - xPadding)
        const textStartY = rectY + textHeight / 2
        _ctx.fillText(name, textStartX, textStartY)

        addClickableArea({
            from: {x: rectX, y: rectY},
            to: {x: rectX + textWidth + 2 * xPadding, y: rectY + textHeight}
        }, handleClickLine, lineInfo.id)
    }

    function drawStationName(_ctx, station, position) {
        const {name} = station
        const fontSize = 15 * scaleFactor;

        _ctx.font = `bold ${fontSize}px Helvetica Neue`;
        _ctx.textBaseline = "middle";
        _ctx.textAlign = "left";
        const textWidth = _ctx.measureText(name).width
        const textHeight = fontSize

        // 填充文本
        _ctx.fillStyle = '#4f716f';
        _ctx.fillText(name, position.x, position.y)

        const textStartX = position.x
        const textStartY = position.y
        addClickableArea({
            from: {x: textStartX, y: textStartY},
            to: {x: textStartX + textWidth, y: textStartY + textHeight}
        }, handleClicKStation, station)
    }

    function drawStation(_ctx, x, y, color, isHalf = false) {
        _ctx.beginPath();
        _ctx.arc(x, y, lineWidth / 2, isHalf ? Math.PI : 0, isHalf ? 0 : Math.PI * 2,);
        _ctx.fillStyle = "white";
        _ctx.fill();
        _ctx.strokeStyle = color;
        _ctx.lineWidth = 2 * scaleFactor;
        _ctx.stroke();
    }

    function findInteractionPoint(targetIntersectionId, stations) {
        return stations.find(s => {
            if (targetIntersectionId) {
                return s.id === targetIntersectionId
            } else {
                return stationPositions[s.id]
            }
        })
    }

    function calcBranchEndPosition(intersectionPoint, branchStations, positionType, segmentLength, direction) {
        const {x, y, index} = intersectionPoint
        const endPosition = {}
        if (positionType === 'THROUGH') {
            endPosition.x = x
            if (index === 0) {
                endPosition.y = y - segmentLength * (branchStations.length - 1)
            } else {
                endPosition.y = y + segmentLength * (branchStations.length - 1)
            }
        } else if (positionType === 'BRANCH') {
            let [yDirection, xDirection] = (direction && direction.split('-')) || [null, null]
            if (!['DOWN', 'UP'].includes(yDirection)) {
                yDirection = 'DOWN'
            }
            if (yDirection === 'DOWN') {
                endPosition.y = y + 50 * scaleFactor
            } else {
                endPosition.y = y - 50 * scaleFactor
            }

            if (!['RIGHT', 'LEFT'].includes(xDirection)) {
                xDirection = 'RIGHT'
            }
            if (xDirection === 'RIGHT') {
                endPosition.x = canvasWidth
            } else {
                endPosition.x = 0
            }
        } else if (positionType === 'INTERSECTION') {
            if (!direction || direction === 'RIGHT') {
                endPosition.y = intersectionPoint.y
                endPosition.x = canvasWidth
            } else if (direction === 'LEFT') {
                endPosition.y = intersectionPoint.y
                endPosition.x = 0
            }
        } else if (positionType === 'X-INTERSECTION') {
            endPosition.y = intersectionPoint.y
            endPosition.x = 0
        }
        //TODO
        return endPosition
    }


    const lineInfo = await lineInfoLoader(config.lineId)
    const canvasWidth = window.innerWidth <= 500 ? window.innerWidth : 360
    const mainLineStations = config.reverse ? lineInfo.stations.slice().reverse() : lineInfo.stations
    const lineColor = lineInfo.color
    const halfWidth = canvasWidth / 2
    const lineWidth = 10 * scaleFactor

    const mainLineX = halfWidth
    // 计算主线站点坐标
    const stationPositions = {}
    mainLineStations.forEach((station, index) => {
        const x = halfWidth
        const y = yPadding + index * SEGMENT_LENGTH
        stationPositions[station.id] = {x, y, index}
    })

    // **预加载支线数据，避免重复调用 `lineInfoLoader`**
    const extraLineDataMap = {};
    if (config.extraLines) {
        for (const extra of config.extraLines) {
            extraLineDataMap[extra.lineId] = await lineInfoLoader(extra.lineId);
        }
    }

    // 计算 `canvasHeight`
    let lineHeight = (mainLineStations.length - 1) * SEGMENT_LENGTH
    const intersections = new Set()
    if (config.extraLines) {
        for (const extraLineConfig of config.extraLines) {
            const extraLineData = extraLineDataMap[extraLineConfig.lineId]
            const extraStations = extraLineData.stations

            // 找到交汇站点
            const intersection = findInteractionPoint(extraLineConfig.intersectionId, extraStations)
            if (!intersection) continue
            intersections.add(intersection.id)
            const intersectionPoint = stationPositions[intersection.id]

            // 计算支线终点坐标
            const branchStations = getBranchStations(extraStations, intersection.id, extraLineConfig.type)
            const branchEndPosition = calcBranchEndPosition(intersectionPoint, branchStations, extraLineConfig.type, SEGMENT_LENGTH, extraLineConfig.direction);

            if (branchEndPosition.y > lineHeight) {
                lineHeight = branchEndPosition.y
            }
        }
    }
    const canvasHeight = lineHeight + 2 * yPadding
    const ctx = new C2S(canvasWidth, lineHeight + 2 * yPadding)
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    const segmentsCount = lineHeight / SEGMENT_LENGTH
    for (let i = 0; i < segmentsCount; i++) {
        if (i % 2 === 0) {
            ctx.fillStyle = "#efefef"
        } else {
            ctx.fillStyle = '#ffffff'
        }
        ctx.fillRect(0, yPadding + (i * SEGMENT_LENGTH), canvasWidth, SEGMENT_LENGTH); // (x, y, width, height)
    }

    const stationCirclesToDraw = []

    // **绘制支线**
    if (config.extraLines) {
        for (const extraLineConfig of config.extraLines) {
            const extraLineInfo = extraLineDataMap[extraLineConfig.lineId];
            const extraStations = extraLineInfo.stations;
            const extraColor = extraLineInfo.color;

            // 找到交汇站点
            const intersectionStation = findInteractionPoint(extraLineConfig.intersectionId, extraStations)
            if (!intersectionStation) continue;

            const intersectionPoint = stationPositions[intersectionStation.id];
            // 计算支线终点坐标
            const branchStations = getBranchStations(extraStations, intersectionStation.id, extraLineConfig.type)
            const branchEndPosition = calcBranchEndPosition(intersectionPoint, branchStations, extraLineConfig.type, SEGMENT_LENGTH, extraLineConfig.direction);

            if (!branchEndPosition) continue;

            // 画支线
            if (extraLineConfig.type === 'THROUGH') {
                drawLine(ctx, extraLineInfo, lineWidth, intersectionPoint, branchEndPosition);
                drawLineName(ctx, extraLineInfo, {x: canvasWidth, y: intersectionPoint.y + 30 * scaleFactor})
                drawLineName(ctx, lineInfo, {x: canvasWidth, y: intersectionPoint.y + 10 * scaleFactor})
            } else if (extraLineConfig.type === 'BRANCH') {
                //画一条圆角L形 终点位置为branchEndPosition 是一个对象{x,y}
                drawRoundedLShape(ctx, extraColor, lineWidth, intersectionPoint, branchEndPosition, {cornerRadius: branchRadius});
                drawLineName(ctx, extraLineInfo, branchEndPosition)
            } else if (extraLineConfig.type === 'INTERSECTION') {
                if (!extraLineConfig.direction) {
                    drawLine(ctx, extraLineInfo, lineWidth, {x: 0, y: intersectionPoint.y}, {
                        x: canvasWidth,
                        y: intersectionPoint.y
                    })
                } else {
                    drawLine(ctx, extraLineInfo, lineWidth, intersectionPoint, branchEndPosition)
                }
                drawLineName(ctx, extraLineInfo, branchEndPosition)
            } else if (extraLineConfig.type === 'X-INTERSECTION') {
                const directions = extraLineConfig.direction.split('@')

                const branchEndPosition1 = calcBranchEndPosition(intersectionPoint, branchStations, 'BRANCH', SEGMENT_LENGTH, directions[0])
                const branchEndPosition2 = calcBranchEndPosition(intersectionPoint, branchStations, 'BRANCH', SEGMENT_LENGTH, directions[1])
                drawRoundedLShape(ctx, extraColor, lineWidth, intersectionPoint, branchEndPosition1, {
                    cornerRadius: branchRadius,
                    intersectionStation
                })
                drawRoundedLShape(ctx, extraColor, lineWidth, intersectionPoint, branchEndPosition2, {
                    cornerRadius: branchRadius,
                    intersectionStation
                })
                const rightEnd = branchEndPosition2.x > branchEndPosition1.x ? branchEndPosition2 : branchEndPosition1
                drawLineName(ctx, extraLineInfo, rightEnd)
            }
            // 画支线站点
            branchStations.forEach((station, i) => {
                const stationY = intersectionPoint.y + i * SEGMENT_LENGTH
                stationCirclesToDraw.push([mainLineX, stationY, extraColor])
                if (extraLineConfig.type === 'THROUGH') {
                    drawStationName(ctx, station, {x: xPadding, y: stationY + 16 * scaleFactor})
                    if (i > 0) {
                        station.yPosition = stationY
                        stationMap.value.set(station.id, station)
                    }
                }
            })
        }
    }

    // **绘制主线**
    drawLine(ctx, lineInfo, lineWidth, {x: halfWidth, y: yPadding}, {
        x: halfWidth,
        y: yPadding + (mainLineStations.length - 1) * SEGMENT_LENGTH
    })

    stationCirclesToDraw.forEach(params => {
        drawStation(ctx, ...params)
    })
    // **绘制主线站点**
    mainLineStations.forEach((station, index) => {
        const isIntersection = intersections.has(station.id)
        const stationY = yPadding + index * SEGMENT_LENGTH
        drawStation(ctx, halfWidth, stationY, lineColor, isIntersection);
        drawStationName(ctx, station, {x: xPadding, y: stationY + 16 * scaleFactor})
        station.yPosition = stationY
        stationMap.value.set(station.id, station)
    });

    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(ctx.getSerializedSvg(), 'image/svg+xml')
    const id = 'line-template-svg'
    const oldNode = container.value.querySelector(`#${id}`)
    if (oldNode) {
        oldNode.remove()
    }
    svgDoc.documentElement.setAttribute('id', id)
    svgDoc.documentElement.addEventListener('click', handleCanvasClick)
    container.value.appendChild(svgDoc.documentElement)
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
        drawMetroLine(_drawConfig)
        initTrains()
    })
}

onBeforeUnmount(() => {
    clearInterval(updateTrainInterval)
})

const handleCanvasClick = _.debounce((event) => {
    const svg = document.getElementById('line-template-svg')
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
