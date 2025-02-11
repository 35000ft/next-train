<template>
    <div ref="container" class="container" style="position:absolute;z-index:10;left:0;">
        <canvas ref="metroCanvas" id="metroCanvas" width="360" height="800" @click="handleCanvasClick"></canvas>
    </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {useStore} from "vuex";
import {drawRoundedLShape, drawRoundedRect} from "src/utils/canvas-utils";
import _ from "lodash";

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

const container = ref(null)

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

function addClickableArea(rect, callBack) {

}

/**
 * 获取分支站点列表
 */
function getBranchStations(stations, intersectionId, showAll) {
    if (showAll) return stations;
    const interIndex = stations.findIndex(s => s.id === intersectionId);
    return [stations[interIndex]];
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
        addClickableArea({from: {x: textStartX, y: textStartY}});
    }

    function drawStationName(_ctx, station, position) {
        const {name} = station
        const fontSize = 14;

        _ctx.font = `${fontSize}px Arial`;
        _ctx.textBaseline = "middle";
        _ctx.textAlign = "left";

        // 填充文本
        _ctx.fillStyle = 'black';
        _ctx.fillText(name, position.x, position.y);
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
    const stations = lineInfo.stations;
    const lineColor = lineInfo.color;
    const width = canvas.width / 2;
    const lineWidth = 10;
    const SEGMENT_LENGTH = 100; // 站点间距

    const mainLineX = width
    // 计算主线站点坐标
    const stationPositions = {};
    stations.forEach((station, index) => {
        const x = width;
        const y = yPadding + index * SEGMENT_LENGTH;
        stationPositions[station.id] = {x, y, index};
    });

    // **预加载支线数据，避免重复调用 `lineInfoLoader`**
    const extraLineDataMap = {};
    if (config.extraLines) {
        for (const extra of config.extraLines) {
            extraLineDataMap[extra.lineId] = await lineInfoLoader(extra.lineId);
        }
    }

    // 计算 `canvas.height`
    let lineHeight = (stations.length - 1) * SEGMENT_LENGTH;
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
                }
            })
        }
    }

    // **绘制主线**
    drawLine(ctx, lineInfo, lineWidth, {x: width, y: yPadding}, {
        x: width,
        y: yPadding + (stations.length - 1) * SEGMENT_LENGTH
    })

    stationCirclesToDraw.forEach(params => {
        drawStation(ctx, ...params)
    })
    // **绘制主线站点**
    stations.forEach((station, index) => {
        const isIntersection = intersections.has(station.id)
        const stationY = yPadding + index * SEGMENT_LENGTH
        drawStation(ctx, width, stationY, lineColor, isIntersection);
        drawStationName(ctx, station, {x: xPadding, y: stationY + 16})
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

onMounted(() => {
    const canvasId = 'metroCanvas'
    const canvas = document.getElementById(canvasId)
    drawMetroLine(canvas, drawConfig)
    const canvasWidth = window.innerWidth >= 350 ? window.innerWidth : 358
    resizeCanvas(canvas, {width: canvasWidth})
})

const handleCanvasClick = _.debounce((event) => {
    if (!metroCanvas.value) return
    const canvas = metroCanvas.value
    const rect = canvas.getBoundingClientRect()

    // 获取点击位置（相对于 canvas 内部）
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top

}, 100)
</script>

<style scoped>
.container {
    height: 80vh;
    overflow-y: auto;
}
</style>
