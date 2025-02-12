<template>
    <div ref="container" class="container" style="position:absolute;z-index:10;left:0;">
        <canvas ref="metroCanvas" id="metroCanvas" width="360" height="800" @click="handleCanvasClick"></canvas>
        <span @click="handleShowTrainInfoDetail(train)"
              class="pentagon"
              style="width: 80px;position: absolute;display: flex;justify-content: center;align-items: center;"
              v-for="train in downTrains" :key="train.id"
              :style="{top:train.yPosition+'px',height:TRAIN_ICON_HEIGHT+'px',left:trainXPosition+'px'}">
                <span>
                    <svg class="icon" viewBox="0 0 1024 1024"
                         xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                        <path
                            d="M824.11102 0c58.806857 0 106.496 47.438367 106.496 105.931755v659.121633a106.119837 106.119837 0 0 1-92.682449 105.033143L992.653061 1024h-100.414694l-153.829877-153.014857h-452.858776L131.740735 1024H31.346939l155.982367-155.167347a106.119837 106.119837 0 0 1-84.992-103.779265V105.952653C102.337306 47.417469 150.047347 0 208.833306 0h615.277714z m35.505633 576.741878H173.327673v188.31151c0 19.497796 15.882449 35.317551 35.505633 35.317551h615.277714c19.602286 0 35.505633-15.819755 35.505633-35.317551v-188.31151z m-556.115592 70.614204c16.906449 0 32.538122 8.986122 40.980898 23.531102a46.874122 46.874122 0 0 1 0 47.083102 47.375673 47.375673 0 0 1-40.980898 23.552 47.20849 47.20849 0 0 1-47.333877-47.083102 47.20849 47.20849 0 0 1 47.333877-47.083102z m425.963102 0c16.906449 0 32.538122 8.986122 40.980898 23.531102a46.874122 46.874122 0 0 1 0 47.083102 47.375673 47.375673 0 0 1-40.980898 23.552 47.20849 47.20849 0 0 1-47.333877-47.083102 47.20849 47.20849 0 0 1 47.333877-47.083102z m-248.476734-400.195919H173.306776v258.946613h307.638857v-258.925715z m378.629224 0H551.977796v258.946613h307.617959v-258.925715zM824.11102 70.635102H208.833306c-19.602286 0-35.505633 15.819755-35.505633 35.317551v70.635102h686.28898v-70.635102c0-19.497796-15.882449-35.317551-35.505633-35.317551z"
                            fill="#111111">
                        </path>
                    </svg>
                </span>
        </span>

        <span @click="handleShowTrainInfoDetail(train)"
              style="width: 80px;position: absolute;background-color: #00b0ff;display: block;"
              v-for="train in upTrains" :key="train.id"
              :style="{top:train.yPosition+'px',height:TRAIN_ICON_HEIGHT+'px',right:trainXPosition+'px'}">
                TEST
        </span>
    </div>

</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import {useStore} from "vuex";
import {drawRoundedLShape, drawRoundedRect} from "src/utils/canvas-utils";
import _ from "lodash";
import {diff, getNowByTimezone} from "src/utils/time-utils";

const store = useStore()
const metroCanvas = ref(null)

function resizeCanvas(canvas, {width, height}) {
    if (typeof width === "number" && width > 0) {
        canvas.width = width
    } else {
        canvas.width = window.innerWidth * 0.95;
    }
    if (typeof height === "number" && height > 0) {
        canvas.height = height
    }
}

const handleShowTrainInfoDetail = (trainInfo) => {
    if (trainInfo) {
        store.commit('application/SET_SHOWN_TRAININFO', {trainInfo})
    }
}
const trainXPosition = computed(() => {
    if (metroCanvas.value) {
        return Math.round(metroCanvas.value.width / 2) - 95
    } else {
        return 0
    }
})
const container = ref(null)

const downTrains = computed(() => {
    return onServiceTrains.value.filter(it => it.direction === 0)
})
const upTrains = computed(() => {
    return onServiceTrains.value.filter(it => it.direction === 1)
})
const drawConfig = {
    "lineId": "51",
    "railsystemCode": "NJMTR",
    "reverse": false,
    "extraLines": [
        {
            "lineId": "57",
            "type": "TROUGH",
            "showAll": true
        },
        {
            "lineId": "59",
            "type": "BRANCH",
            "direction": "DOWN-RIGHT"
        },
        {
            "lineId": "53",
            "type": "BRANCH",
            "direction": "DOWN-LEFT"
        },
        {
            "lineId": "5",
            "type": "INTERSECTION",
            "direction": "RIGHT"
        },
    ]
}

const lineInfoLoader = async (lineId) => {
    if (lineId) {
        return await store.dispatch('railsystem/getLine', {lineId})
    }
}
const xPadding = 10
const yPadding = 50
const positions = []
const stationMap = ref(new Map())
const TRAIN_ICON_HEIGHT = 70
const SEGMENT_LENGTH = 160 // 站点间距

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
function getBranchStations(stations, intersectionId, showAll) {
    if (showAll) return stations;
    const interIndex = stations.findIndex(s => s.id === intersectionId);
    return [stations[interIndex]];
}

function handleClicKStation(station) {
    console.log('click station', station)
}

function handleClicKLine(lineId) {
    console.log('click line', lineId)
}

const onServiceTrains = ref([])


async function initTrains() {

    const lineId = props.lineIdProp
    if (!lineId) return
    const lineInfo = await lineInfoLoader(lineId)
    const currentTime = getNowByTimezone(lineInfo.stations[0].timezone)
    const trains = await store.dispatch('realtime/getLineOnServiceTrains', {lineId})


    function calcTrainPosition(train) {
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
            train.yPosition = rawYPosition - TRAIN_ICON_HEIGHT / 2
        }
    }

    trains.forEach(t => {
        calcTrainPosition(t)
    })

    onServiceTrains.value = trains
}

async function drawMetroLine(canvas, config) {
    if (!canvas || !config) return;
    const ctx = canvas.getContext("2d");

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
        const textPadding = 4;
        const fontSize = 10;
        const radius = 9;

        _ctx.font = `${fontSize}px Arial`;
        _ctx.textBaseline = "middle";
        _ctx.textAlign = "center";

        const textWidth = _ctx.measureText(name).width + textPadding * 4;
        const textHeight = fontSize + textPadding * 2;

        const isLeft = position.x === 0
        // 矩形框位置：在 `to` 点上方
        const rectX = isLeft ? xPadding : position.x - textWidth - xPadding;
        const rectY = isLeft ? position.y + 10 : position.y - textHeight - 10; // 适当上移，避免重叠
        // 画圆角矩形
        _ctx.beginPath();
        _ctx.lineWidth = 2;
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
        }, handleClicKLine, lineInfo.id)
    }

    function drawStationName(_ctx, station, position) {
        const {name} = station
        const fontSize = 14;

        _ctx.font = `${fontSize}px Arial`;
        _ctx.textBaseline = "middle";
        _ctx.textAlign = "left";
        const textWidth = _ctx.measureText(name).width
        const textHeight = fontSize

        // 填充文本
        _ctx.fillStyle = 'black';
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
        _ctx.lineWidth = 2;
        _ctx.stroke();
    }

    const lineInfo = await lineInfoLoader(config.lineId);
    const mainLineStations = lineInfo.stations;
    const lineColor = lineInfo.color;
    const width = canvas.width / 2;
    const lineWidth = 10;

    const mainLineX = width
    // 计算主线站点坐标
    const stationPositions = {};
    mainLineStations.forEach((station, index) => {
        const x = width;
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

    // 计算 `canvas.height`
    let lineHeight = (mainLineStations.length - 1) * SEGMENT_LENGTH;
    const intersections = new Set()
    if (config.extraLines) {
        for (const extra of config.extraLines) {
            const extraLineData = extraLineDataMap[extra.lineId];
            const extraStations = extraLineData.stations;

            // 找到交汇站点
            const intersection = extraStations.find(s => stationPositions[s.id]);
            if (!intersection) continue;
            intersections.add(intersection.id)
            const intersectionPoint = stationPositions[intersection.id];

            // 计算支线终点坐标
            const branchStations = getBranchStations(extraStations, intersection.id, extra.showAll);
            const branchEndPosition = calcBranchEndPosition(intersectionPoint, branchStations, extra.type, SEGMENT_LENGTH, extra.direction, canvas);

            if (branchEndPosition.y > lineHeight) {
                lineHeight = branchEndPosition.y;
            }
        }
    }

    canvas.height = lineHeight + yPadding;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const segmentsCount = lineHeight / SEGMENT_LENGTH
    for (let i = 0; i < segmentsCount; i++) {
        if (i % 2 === 0) {
            ctx.fillStyle = "#efefef";
        } else {
            ctx.fillStyle = '#ffffff'
        }
        ctx.fillRect(0, yPadding + (i * SEGMENT_LENGTH), canvas.width, SEGMENT_LENGTH); // (x, y, width, height)
    }

    const stationCirclesToDraw = []

    // **绘制支线**
    if (config.extraLines) {
        for (const extraLineConfig of config.extraLines) {
            const extraLineInfo = extraLineDataMap[extraLineConfig.lineId];
            const extraStations = extraLineInfo.stations;
            const extraColor = extraLineInfo.color;

            // 找到交汇站点
            const intersectionStation = extraStations.find(s => stationPositions[s.id]);
            if (!intersectionStation) continue;

            const intersectionPoint = stationPositions[intersectionStation.id];

            // 计算支线终点坐标
            const branchStations = getBranchStations(extraStations, intersectionStation.id, extraLineConfig.showAll);
            const branchEndPosition = calcBranchEndPosition(intersectionPoint, branchStations, extraLineConfig.type, SEGMENT_LENGTH, extraLineConfig.direction, canvas);

            if (!branchEndPosition) continue;

            // 画支线
            if (extraLineConfig.type === 'TROUGH') {
                drawLine(ctx, extraLineInfo, lineWidth, intersectionPoint, branchEndPosition);
                drawLineName(ctx, extraLineInfo, {x: canvas.width, y: intersectionPoint.y + 30})
                drawLineName(ctx, lineInfo, {x: canvas.width, y: intersectionPoint.y + 10})
            } else if (extraLineConfig.type === 'BRANCH') {
                //画一条圆角L形 终点位置为branchEndPosition 是一个对象{x,y}
                drawRoundedLShape(ctx, extraColor, lineWidth, intersectionPoint, branchEndPosition);
                drawLineName(ctx, extraLineInfo, branchEndPosition)
            } else if (extraLineConfig.type === 'INTERSECTION') {
                if (!extraLineConfig.direction) {
                    drawLine(ctx, extraLineInfo, lineWidth, {x: 0, y: intersectionPoint.y}, {
                        x: canvas.width,
                        y: intersectionPoint.y
                    })
                } else {
                    drawLine(ctx, extraLineInfo, lineWidth, intersectionPoint, branchEndPosition)
                }
                drawLineName(ctx, extraLineInfo, branchEndPosition)
            }
            // 画支线站点
            branchStations.forEach((station, i) => {
                const stationY = intersectionPoint.y + i * SEGMENT_LENGTH
                stationCirclesToDraw.push([mainLineX, stationY, extraColor])
                if (extraLineConfig.type === 'TROUGH') {
                    drawStationName(ctx, station, {x: xPadding, y: stationY + 16})
                    if (i > 0) {
                        station.yPosition = stationY
                        stationMap.value.set(station.id, station)
                    }
                }
            })
        }
    }

    // **绘制主线**
    drawLine(ctx, lineInfo, lineWidth, {x: width, y: yPadding}, {
        x: width,
        y: yPadding + (mainLineStations.length - 1) * SEGMENT_LENGTH
    })

    stationCirclesToDraw.forEach(params => {
        drawStation(ctx, ...params)
    })
    // **绘制主线站点**
    mainLineStations.forEach((station, index) => {
        const isIntersection = intersections.has(station.id)
        const stationY = yPadding + index * SEGMENT_LENGTH
        drawStation(ctx, width, stationY, lineColor, isIntersection);
        drawStationName(ctx, station, {x: xPadding, y: stationY + 16})
        station.yPosition = stationY
        stationMap.value.set(station.id, station)
    });
}

function calcBranchEndPosition(intersectionPoint, branchStations, positionType, segmentLength, direction, canvas) {
    const {x, y, index} = intersectionPoint
    const endPosition = {}
    if (positionType === 'TROUGH') {
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
            endPosition.y = y + 50
        } else {
            endPosition.y = y - 50
        }

        if (!['RIGHT', 'LEFT'].includes(xDirection)) {
            xDirection = 'RIGHT'
        }
        if (xDirection === 'RIGHT') {
            endPosition.x = canvas.width
        } else {
            endPosition.x = 0
        }
    } else if (positionType === 'INTERSECTION') {
        if (!direction || direction === 'RIGHT') {
            endPosition.y = intersectionPoint.y
            endPosition.x = canvas.width
        } else if (direction === 'LEFT') {
            endPosition.y = intersectionPoint.y
            endPosition.x = 0
        }
    }
    //TODO
    return endPosition
}

const props = defineProps({
    lineIdProp: {
        type: String,
    }
})

onMounted(() => {
    const canvasId = 'metroCanvas'
    const canvas = document.getElementById(canvasId)
    drawMetroLine(canvas, drawConfig)
    const canvasWidth = window.innerWidth >= 350 && window.innerWidth <= 600 ? window.innerWidth : 358
    resizeCanvas(canvas, {width: canvasWidth})

    initTrains()
})

const handleCanvasClick = _.debounce((event) => {
    if (!metroCanvas.value) return
    const canvas = metroCanvas.value
    const rect = canvas.getBoundingClientRect()

    // 获取点击位置（相对于 canvas 内部）
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
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
    background-color: var(--q-background);
    box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3); /* 给五边形添加阴影 */
}

.pentagon::before {
    content: '';
    position: absolute;
    top: -20px; /* 三角形的位置 */
    left: 50%;
    transform: translateX(-50%);
    border-left: 40px solid transparent; /* 左侧透明边 */
    border-right: 40px solid transparent; /* 右侧透明边 */
    border-bottom: 20px solid var(--q-background); /* 三角形的高度 */
}
</style>
