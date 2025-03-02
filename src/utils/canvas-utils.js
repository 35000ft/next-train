export function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
}

export function drawRoundedLShape(_ctx, color, lineWidth, from, to, config = {cornerRadius: 30}) {
    const {cornerRadius} = config
    const isRight = to.x > from.x // 是否向右绘制
    const isUp = to.y < from.y
    const midX = isRight ? from.x + cornerRadius : from.x - cornerRadius
    const midY = isUp ? to.y + cornerRadius : to.y - cornerRadius
    _ctx.beginPath();
    _ctx.moveTo(from.x, from.y);

    // 画竖线
    _ctx.lineTo(from.x, midY);
    // 画圆角
    if (!isRight && isUp) {
        // 向左上画支线
        _ctx.moveTo(midX, to.y);
        _ctx.arcTo(from.x, to.y, from.x, midY, cornerRadius);
    } else if (isRight && !isUp) {
        // 向右下画支线
        _ctx.moveTo(midX, to.y);
        _ctx.arcTo(from.x, to.y, from.x, midY, cornerRadius);
    } else {
        _ctx.arcTo(from.x, to.y, midX, to.y, cornerRadius);
    }
    // 画横线
    _ctx.moveTo(midX, to.y);
    _ctx.lineTo(to.x, to.y);

    _ctx.strokeStyle = color;
    _ctx.lineWidth = lineWidth;
    _ctx.stroke();
}

export /**
 *
 * @param config 绘制配置
 * @param scaleFactor 放大倍数
 * @returns {Promise<void>}
 */
async function drawMetroLine(config, {
    scaleFactor = 1,
    addClickableArea,
    handleClicKStation,
    lineInfoLoader,
    stationMap,
    handleClickLine,
    getBranchStations,
    stationGetter,
}) {
    const SEGMENT_LENGTH = 160 * scaleFactor // 站点间距
    const xPadding = 10 * scaleFactor
    const yPadding = 80 * scaleFactor
    const branchRadius = 30 * scaleFactor
    const promises = []

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

    function drawStationName(_ctx, station, position, config = {}) {
        const {name} = station
        const fontSize = 15 * scaleFactor;

        _ctx.font = `bold ${fontSize}px Helvetica Neue`;
        _ctx.textBaseline = "middle";
        _ctx.textAlign = "left";
        const textWidth = _ctx.measureText(name).width
        const textHeight = fontSize

        if (config.moveCenter) {
            position.x = position.x - textWidth / 2
        }
        if (config.moveRight) {
            position.x = _ctx.width - xPadding - textWidth
        }

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
        return endPosition
    }


    const lineInfo = await lineInfoLoader(config.lineId)
    const canvasWidth = (window.innerWidth <= 500 ? window.innerWidth : 360) * scaleFactor

    const branchStationIdSet = (config.branchStations && new Set(config.branchStations.map(s => s.stationId))) || new Set()
    const tempMainLineStations = lineInfo.stations.filter(it => !branchStationIdSet.has(it.id))

    const mainLineStations = config.reverse ? tempMainLineStations.slice().reverse() : tempMainLineStations
    const lineColor = lineInfo.color
    const halfWidth = canvasWidth / 2
    const lineWidth = 10 * scaleFactor

    const mainLineX = halfWidth
    // 计算主线站点坐标
    const stationPositions = {}
    const connectedStationIdSet = new Set()
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
    let mainLineHeight = (mainLineStations.length - 1) * SEGMENT_LENGTH
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

            if (branchEndPosition.y > mainLineHeight) {
                mainLineHeight = branchEndPosition.y
            }
        }
    }

    const canvasHeight = mainLineHeight + 2 * yPadding
    const ctx = new C2S(canvasWidth, mainLineHeight + 2 * yPadding)
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    const segmentsCount = mainLineHeight / SEGMENT_LENGTH
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
                        stationMap.set(station.id, station)
                    }
                }
            })
        }
    }

    if (config.branchStations) {
        for (const branchStationConfig of config.branchStations) {
            const index = mainLineStations.findIndex(it => it.id === branchStationConfig.connectStationId)
            const fromY = yPadding + index * SEGMENT_LENGTH
            const horizonLineWidth = 150 * scaleFactor
            const cornerRadius = 50 * scaleFactor
            let toX = branchStationConfig.direction === 'LEFT' ? mainLineX - horizonLineWidth : mainLineX + horizonLineWidth
            let toY = fromY + SEGMENT_LENGTH / 2
            let stationNameY = toY - 20 * scaleFactor
            connectedStationIdSet.add(branchStationConfig.connectStationId)
            if (branchStationConfig.shape === 'Y') {
                drawRoundedLShape(ctx, lineColor, lineWidth, {x: mainLineX, y: fromY}, {
                    x: toX,
                    y: toY
                }, {cornerRadius})
                drawRoundedLShape(ctx, lineColor, lineWidth, {x: mainLineX, y: fromY + SEGMENT_LENGTH}, {
                    x: toX,
                    y: toY
                }, {cornerRadius})
            } else if (branchStationConfig.shape === 'LU') {
                drawRoundedLShape(ctx, lineColor, lineWidth, {x: mainLineX, y: fromY}, {
                    x: toX,
                    y: toY
                }, {cornerRadius})
            } else if (branchStationConfig.shape === 'LD') {
                toY = toY - SEGMENT_LENGTH
                stationNameY = toY + 20 * scaleFactor
                drawRoundedLShape(ctx, lineColor, lineWidth, {x: mainLineX, y: fromY}, {
                    x: toX,
                    y: toY
                }, {cornerRadius})
            }
            stationCirclesToDraw.push([toX, toY, lineColor])
            const p = stationGetter(branchStationConfig.stationId).then(_station => {
                drawStationName(ctx, _station, {x: toX, y: stationNameY}, {moveCenter: true})
            })
            promises.push(p)
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

        const moveRight = connectedStationIdSet.has(station.id)
        drawStationName(ctx, station, {x: xPadding, y: stationY + 16 * scaleFactor}, {moveRight})
        station.yPosition = stationY
        station.yIndex = index
        stationMap.set(station.id, station)
    });

    await Promise.all(promises)
    const parser = new DOMParser()
    return parser.parseFromString(ctx.getSerializedSvg(), 'image/svg+xml')
}
