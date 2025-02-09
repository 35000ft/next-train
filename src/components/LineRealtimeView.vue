<template>
    <div ref="container" class="container">
        <canvas id="metroCanvas" width="300" height="800"></canvas>
    </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {useStore} from "vuex";

const store = useStore()

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
    ]
}

const lineInfoLoader = async (lineId) => {
    if (lineId) {
        return await store.dispatch('railsystem/getLine', {lineId})
    }
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

    function drawLine(_ctx, color, width, from, to) {
        _ctx.beginPath();
        _ctx.moveTo(from.x, from.y);
        _ctx.lineTo(to.x, to.y);
        _ctx.strokeStyle = color;
        _ctx.lineWidth = width;
        _ctx.stroke();
    }

    function drawRoundedLShape(_ctx, color, lineWidth, from, to) {
        const cornerRadius = 30; // 圆角半径
        const isRight = to.x > from.x; // 是否向右绘制
        const midX = isRight ? from.x + cornerRadius : from.x - cornerRadius;
        const midY = to.y - cornerRadius;
        console.log('min', midX, midY, cornerRadius)
        _ctx.beginPath();
        _ctx.moveTo(from.x, from.y);

        // 画竖线
        _ctx.lineTo(from.x, midY);

        // 画圆角
        _ctx.arcTo(from.x, to.y, midX, to.y, cornerRadius);
        // 画横线
        _ctx.moveTo(midX, to.y);
        _ctx.lineTo(to.x, to.y);

        _ctx.strokeStyle = color;
        _ctx.lineWidth = lineWidth;
        _ctx.stroke();
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

    const lineData = await lineInfoLoader(config.lineId);
    const stations = lineData.stations;
    const lineColor = lineData.color;
    const padding = 50;
    const width = canvas.width / 2;
    const lineWidth = 10;
    const SEGMENT_LENGTH = 100; // 站点间距

    const mainLineX = width
    // 计算主线站点坐标
    const stationPositions = {};
    stations.forEach((station, index) => {
        const x = width;
        const y = padding + index * SEGMENT_LENGTH;
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

    canvas.height = lineHeight + padding;
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    // **绘制支线**
    if (config.extraLines) {
        for (const extra of config.extraLines) {
            const extraLineData = extraLineDataMap[extra.lineId];
            const extraStations = extraLineData.stations;
            const extraColor = extraLineData.color;

            // 找到交汇站点
            const intersection = extraStations.find(s => stationPositions[s.id]);
            if (!intersection) continue;

            const intersectionPoint = stationPositions[intersection.id];

            // 计算支线终点坐标
            const branchStations = getBranchStations(extraStations, intersection.id, extra.showAll);
            const branchEndPosition = calcBranchEndPosition(intersectionPoint, branchStations, extra.type, SEGMENT_LENGTH, extra.direction, canvas);

            if (!branchEndPosition) continue;

            // 画支线
            if (extra.type === 'TROUGH') {
                drawLine(ctx, extraColor, lineWidth, intersectionPoint, branchEndPosition);
            } else {
                //画一条圆角L形 终点位置为branchEndPosition 是一个对象{x,y}
                drawRoundedLShape(ctx, extraColor, lineWidth, intersectionPoint, branchEndPosition);
            }
            // 画支线站点
            branchStations.forEach((station, i) => {
                drawStation(ctx, mainLineX, intersectionPoint.y + i * SEGMENT_LENGTH, extraColor);
            })
        }
    }

    // **绘制主线**
    drawLine(ctx, lineColor, lineWidth, {x: width, y: padding}, {
        x: width,
        y: padding + (stations.length - 1) * SEGMENT_LENGTH
    });

    // **绘制主线站点**
    stations.forEach(({id}, index) => {
        const isIntersection = intersections.has(id)
        drawStation(ctx, width, padding + index * SEGMENT_LENGTH, lineColor, isIntersection);
    });
}

function calcBranchEndPosition(intersectionPoint, branchStations, positionType, segmentLength, direction = "", canvas) {
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
        let [yDirection, xDirection] = direction.split('-')
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
    }
    //TODO
    return endPosition
}

onMounted(() => {
    const canvasId = 'metroCanvas'
    const canvas = document.getElementById(canvasId)
    drawMetroLine(canvas, drawConfig)
    resizeCanvas(canvas, {width: container.value.clientWidth})
})
</script>

<style scoped>
.container {
    height: 80vh;
    overflow-y: auto;
}
</style>
