import {dijkstra, findAllPaths, findTransfers} from "src/utils/route-algorithm";
import dayjs from "dayjs";
import {trainLineOfStopParser} from "src/models/Train";
import _ from "lodash";
import {diff} from "src/utils/time-utils";

// 主站 ID 前缀，用于在图中区分主站节点与普通站点节点
export const MAIN_STATION_PREFIX = "M"

/**
 * 将原始图数据初始化为 Dijkstra 可用的加权图。
 * 原始数据中，同一条物理线路上的相邻站点用正距离连接；
 * 换乘关系（transferId 存在）会在主站（M前缀）与相关子站之间建立 0 权边，
 * 使得算法把换乘视为无额外距离（实际换乘代价在后续 schedule 阶段计算）。
 */
function initGraph(rawGraph, fromMainId, toMainId, viaIds = []) {
    const subIdToMainMap = new Map()
    const graph = Object.entries(rawGraph)
        .map(([k, v]) => {
            return v.map(it => [k, ...it])
        })
        .flat()
        .reduce((acc, cur) => {
            let [mainStationId, fromId, toId, distance, transferId, lineId] = cur
            const _mainStationId = MAIN_STATION_PREFIX + mainStationId
            acc[fromId] = acc[fromId] || {}
            if (transferId) {
                // 换乘边：当前站点 -> 主站 -> 目标子站，均为 0 权
                acc[fromId][_mainStationId] = 0
                acc[_mainStationId] = acc[_mainStationId] || {}
                const subStationToId = toId.split('-')[0]

                acc[subStationToId] = acc[subStationToId] || {}

                acc[_mainStationId][subStationToId] = 0
                acc[subStationToId][_mainStationId] = 0

                const subStationFromId = fromId.split('-')[0]
                acc[subStationFromId] = acc[subStationFromId] || {}
                acc[subStationFromId][_mainStationId] = 0
                return acc
            }
            // 记录子站到主站/线路的映射，供后续 parseRoute 还原线路使用
            subIdToMainMap.set(fromId, {
                mainStationId,
                lineId
            })
            acc[fromId][toId] = distance
            return acc
        }, {})

    // 将终点（及途经点）的主站与图中相关子站用 0 权边相连，
    // 这样 Dijkstra 可以从虚拟主站节点进入/离开真实线路
    const toMainStationIds = [toMainId, ...viaIds]
    for (const mainStationId of toMainStationIds) {
        const _toMainId = MAIN_STATION_PREFIX + mainStationId
        Array.from(new Set(rawGraph[mainStationId].map(it => it[0]))).forEach(it => {
            graph[_toMainId] = graph[_toMainId] || {}
            graph[_toMainId][it] = 0

            graph[it] = graph[it] || {}
            graph[it][_toMainId] = 0
        })
    }

    // 同理，将起点（及途经点）的主站与图中相关子站用 0 权边相连
    const fromMainStationIds = [fromMainId, ...viaIds]
    for (const mainStationId of fromMainStationIds) {
        const _fromMainId = MAIN_STATION_PREFIX + mainStationId
        Array.from(new Set(rawGraph[mainStationId].map(it => it[0]))).forEach(it => {
            graph[_fromMainId] = graph[_fromMainId] || {}
            graph[_fromMainId][it] = 0
        })
    }

    return {
        graph,
        subIdToMainMap
    }
}

/**
 * 将 Dijkstra 返回的原始节点路径（如 ['M180','193','194','195','196','M65']）
 * 解析为按线路分段的结果，每段包含 lineId、stationIds（主站ID列表）、subStationIds（子站ID列表）。
 * 后续还会合并可顺向接续的同线路段。
 */
function parseRoute(subIdToMainMap, path) {
    let result = []
    const {lineId, mainStationId} = subIdToMainMap.get(path[1])
    result.push({lineId, stationIds: [mainStationId], subStationIds: [path[1]]})
    for (const subStationId of path.slice(2, -1)) {
        const last = result.slice(-1)[0]
        if (subStationId.startsWith(MAIN_STATION_PREFIX)) {
            //TODO：当前未处理路径中出现主站前缀节点的场景
        } else {
            const {lineId, mainStationId} = subIdToMainMap.get(subStationId)
            if (!lineId) continue
            if (last.lineId === lineId) {
                const preStationId = last.stationIds[last.stationIds.length - 1]
                if (preStationId !== mainStationId) {
                    last.stationIds.push(mainStationId)
                    last.subStationIds.push(subStationId)
                } else {
                    result.push({lineId, stationIds: [mainStationId], subStationIds: [subStationId]})
                }
            } else {
                result.push({lineId, stationIds: [mainStationId], subStationIds: [subStationId]})
            }
        }
    }
    // Merge Line：相邻两段 lineId 相同且可顺向接续时合并为一段
    result = result.reduce((acc, cur) => {
        if (acc.length === 0) {
            acc.push(cur)
        } else {
            const last = acc.slice(-1)[0]
            if (last.lineId === cur.lineId) {
                if (last.stationIds.length < 2 || cur.stationIds.length < 2) {
                    throw new Error(`Invalid station sequence: last.stationIds (${last.stationIds}) or cur.stationIds (${cur.stationIds}) length is less than 2.`)
                }
                // 判断是否可以顺向接续：前一段倒数第二站 != 后一段第二站 才可接续
                if (last.stationIds[last.stationIds.length - 2] !== cur.stationIds[1]) {
                    last.stationIds.push(...cur.stationIds.slice(1))
                } else {
                    acc.push(cur)
                }
            } else {
                acc.push(cur)
            }
        }
        return acc
    }, [])
    return result
}


/**
 * 规划从 fromMainId 到 toMainId 的所有可行路径方案。
 * 先求最短路径作为基准，再用 findAllPaths 枚举候选路径，
 * 对每条候选路径调用 planOnePathSolution 生成具体车次方案，并通过 cb 实时回调。
 */
export async function planRoute(rawGraph, fromMainId, toMainId, trainGetter, transferInfoGetter, depTime = dayjs(), cb) {
    console.log('Plan route:', fromMainId, toMainId, depTime)
    const {graph, subIdToMainMap} = initGraph(rawGraph, fromMainId, toMainId)
    const start = MAIN_STATION_PREFIX + fromMainId;
    const end = MAIN_STATION_PREFIX + toMainId;
    const shortest = dijkstra(graph, start, end)

    shortest['transfers'] = findTransfers(graph, shortest['path'])
    const planPromises = []
    const allSolutions = []

    const pathCb = ({path, distance}) => {
        const parsedPath = parseRoute(subIdToMainMap, path)
        const onePathPromise = planOnePathSolution(
            {
                distance,
                path,
                parsedPath
            },
            depTime,
            trainGetter,
            transferInfoGetter,
        ).then(solutions => {
            console.log('Path:', parsedPath, 'Solutions:', solutions)
            allSolutions.push(...solutions)
            for (const solution of solutions) {
                cb(solution)
            }
            return solutions
        }).catch(e => {
            console.warn('Fail to plan:' + e)
        })
        planPromises.push(onePathPromise)
    }
    await findAllPaths(graph, start, end, pathCb, shortest)
    return Promise.all(planPromises).then(res => {
        return allSolutions
    })
}

/**
 * 对单条物理路径（parsedPath）搜索所有可行的列车组合方案。
 * 维护一个 Pareto 前沿解集（用 Map，key 为 solution.id）：
 * 若新方案比已有方案更优（dep 不更早且 arr 更早），则淘汰旧方案；
 * 若新方案不被任何已有方案支配，则加入。
 */
async function planOnePathSolution({distance, path, parsedPath}, depTime, trainGetter, transferInfoGetter) {
    const {lineId, stationIds} = parsedPath[0]
    // 使用 Map 而非 Set：以 solution.id 为键，避免对象引用比较导致去重失效
    const solutions = new Map()
    const allPromises = []
    await trainGetter({lineId, stationId: stationIds[0], depTime}).then(trainInfoList => {
        console.log('PlanOnePathSolution Candidate trainInfoList:', trainInfoList, 'Station ID:', stationIds[0], 'depTime', depTime,)
        const promises = trainInfoList.map(t => recursivePlan(t, parsedPath, depTime, trainGetter, transferInfoGetter, [],
            (segments) => {
                const solution = toSolution(segments, distance)
                if (solutions.size === 0) {
                    solutions.set(solution.id, solution)
                    return
                }
                // 淘汰被新方案严格支配的旧方案（arr 更晚且 dep 不更早）
                const toDeleteIds = []
                for (const [id, it] of solutions) {
                    if (it.arrTime.isAfter(solution.arrTime) && diff(it.depTime, solution.depTime) >= 0) {
                        toDeleteIds.push(id)
                    }
                }
                if (toDeleteIds.length > 0) {
                    toDeleteIds.forEach(id => solutions.delete(id))
                    solutions.set(solution.id, solution)
                } else {
                    // 若已有同 dep 且 arr 更早的方案，则新方案不加入
                    let hasBetter = false
                    for (const it of solutions.values()) {
                        if (diff(solution.depTime, it.depTime) === 0 && diff(solution.arrTime, it.arrTime) > 0) {
                            hasBetter = true
                            break
                        }
                    }
                    if (!hasBetter) {
                        solutions.set(solution.id, solution)
                    }
                }
            }))
        allPromises.push(...promises)
    })
    await Promise.all(allPromises)

    console.log('One Path Solutions', parsedPath, solutions)
    return Array.from(solutions.values())
}

/**
 * 在候选车次中，找出那些出发时间早于正常换乘时间、可能来不及搭乘的车次。
 * 用于给用户提供“换乘时间不足”的提示信息。
 */
function findLessTransferTimeTrains(trains, lastArrTime, normalDepTime, getOnStationId) {
    const lessTransferTimeTrains = []
    for (const trainInfo of trains) {
        // 查找上车站在列车时刻表中的 index
        const stopStationIds = trainInfo.schedule.map(it => it.stationId)
        const _getOnIndex = stopStationIds.indexOf(getOnStationId)
        if (_getOnIndex === -1) {
            continue
        }
        const getOnStop = trainInfo.schedule[_getOnIndex]
        if (!getOnStop) continue
        if (!getOnStop.dep.isAfter(normalDepTime)) {
            // 正常换乘时间之前的列车，计算实际换乘时间并加入结果
            trainInfo.transferTime = Math.abs(diff(getOnStop.dep, lastArrTime, 'second'))
            trainInfo.depStop = getOnStop
            lessTransferTimeTrains.push(trainInfo)
        }
    }
    return lessTransferTimeTrains
}

/**
 * 根据 parsedPath 中的一段线路，在列车时刻表中找到上车站和下车站的索引。
 * 使用 Map 预建 stationId -> {first, last} 索引，避免反复 indexOf/lastIndexOf 扫描。
 * 返回：[getOnIndex, getOffIndex, curPathStationOffset, currentPathIndex]
 */
async function findGetOnOffIndex(trainInfo, path) {
    let isFind = false
    let getOffIndex = -1
    let getOnIndex = -1
    let curPathStationOffset
    let currentPathIndex = -1

    // 预建索引：每个 stationId 在 schedule 中首次出现和最后一次出现的下标
    const stopStationIndexMap = new Map()
    trainInfo.schedule.forEach((stop, idx) => {
        if (!stopStationIndexMap.has(stop.stationId)) {
            stopStationIndexMap.set(stop.stationId, {first: idx, last: idx})
        } else {
            stopStationIndexMap.get(stop.stationId).last = idx
        }
    })

    for (let i = 0; i < path.length; i++) {
        // 当前路径段的主车站 ID 列表
        const {stationIds} = path[i]

        // 查找下车站：从 stationIds 尾部向前遍历，找第一个存在于列车时刻表中的站
        let getOffStationId
        for (let j = stationIds.length - 1; j >= 0; j--) {
            if (stopStationIndexMap.has(stationIds[j])) {
                getOffStationId = stationIds[j]
                break
            }
        }

        if (getOffStationId !== undefined) {
            const _curPathStationOffset = stationIds.indexOf(getOffStationId)
            if (_curPathStationOffset > 0) {
                curPathStationOffset = _curPathStationOffset
                currentPathIndex = i
                // 取该站在时刻表中最后一次出现的索引作为下车站
                getOffIndex = stopStationIndexMap.get(getOffStationId).last
            }
        }

        // 仅在第一次循环确定上车站索引
        if (i === 0) {
            const onRecord = stopStationIndexMap.get(stationIds[0])
            getOnIndex = onRecord ? onRecord.first : -1

            if (getOnIndex === -1) {
                return [-1, -1, -1, -1]
            }
            if (getOffIndex <= getOnIndex) {
                return [-1, -1, -1, -1]
            }
        }

        isFind = true
    }
    if (!isFind || getOffIndex <= getOnIndex) {
        return [-1, -1, -1, -1]
    }
    return [getOnIndex, getOffIndex, curPathStationOffset, currentPathIndex]
}

/**
 * 递归规划一条路径上的列车组合。
 * 对当前列车确定上下车站后，若未到达终点，则根据换乘信息截取剩余路径，
 * 继续枚举下一班可换乘的列车。
 */
async function recursivePlan(trainInfo, parsedPath, lastDepTime, trainGetter, transferInfoGetter, trains = [], cb, preTransferInfo, lessTransferTimeTrains = []) {
    let currentPathIndex = -1
    let getOffIndex = -1
    let getOnIndex = -1
    let curPathStationOffset
    const getOnOff = await findGetOnOffIndex(trainInfo, parsedPath)

    try {
        getOnIndex = getOnOff[0]
        getOffIndex = getOnOff[1]
        if (getOffIndex < 0 || getOnIndex < 0) {
            return
        }
        curPathStationOffset = getOnOff[2]
        currentPathIndex = getOnOff[3]
        if (preTransferInfo) {
            const {fromPlatform, fromId, arrTime, fromMainId, fromLineId} = preTransferInfo
            const getOnStop = trainInfo.schedule[getOnIndex]
            const transferInfo = await transferInfoGetter({
                fromId,
                fromPlatform,
                fromMainId,
                toId: parsedPath[0].subStationIds[0],
                toPlatform: getOnStop.platform,
                toMainId: getOnStop.stationId
            })
            transferInfo.type = 'transfer'
            transferInfo.depStationId = fromMainId
            transferInfo.fromLineId = fromLineId
            transferInfo.arrStationId = getOnStop.stationId
            if (arrTime.add(transferInfo.needTime, 'second').isAfter(getOnStop.dep)) {
                console.warn('Transfer time is not enough', `arrive time:${arrTime.format()}`, `dep time:${getOnStop.dep.format()}`, `transfer need time:${transferInfo.needTime}`)
                return
            }
            trains.push(transferInfo)
        }

    } catch (e) {
        console.warn('recursivePlan error', e, trainInfo, 'getOnIndex:' + getOnIndex, 'getOffIndex:' + getOffIndex,)
        return
    }

    const train = buildTrain(trainInfo, getOnIndex, getOffIndex, lessTransferTimeTrains)
    trains.push(train)
    const getOffStop = trainInfo.schedule[getOffIndex]
    const isArrived = parsedPath.length === 1 && getOffStop.stationId === parsedPath[0].stationIds.slice(-1)[0]
    if (isArrived) {
        // 到达终点，回调完整行程
        cb(trains)
        return Promise.resolve(trains)
    }

    let nextParsedPath
    let transferFromId

    // 判断当前路径段是否需要切片：
    // 若下车点不是该段最后一个站，说明该列车只覆盖了一段线路的部分区间，
    // 剩余区间需要继续由后续列车（可能同线或换乘）覆盖。
    const needSplit = curPathStationOffset < parsedPath[currentPathIndex].stationIds.length - 1
    if (needSplit) {
        nextParsedPath = _.cloneDeep(parsedPath.slice(currentPathIndex))
        nextParsedPath[0].stationIds = nextParsedPath[0].stationIds.slice(curPathStationOffset)
        nextParsedPath[0].subStationIds = nextParsedPath[0].subStationIds.slice(curPathStationOffset)
        transferFromId = parsedPath[currentPathIndex].subStationIds[curPathStationOffset]
    } else {
        nextParsedPath = _.cloneDeep(parsedPath.slice(currentPathIndex + 1))
        transferFromId = parsedPath[currentPathIndex].subStationIds.slice(-1)[0]
    }
    if (nextParsedPath.length === 0) {
        // 路径已空，视为到达终点
        cb(trains)
        return Promise.resolve(trains)
    }
    const curLineId = parsedPath[currentPathIndex].lineId
    const nextLineId = needSplit ? curLineId : nextParsedPath[0].lineId

    const currentStationId = getOffStop.stationId
    const transferFromInfo = {
        fromPlatform: getOffStop.platform,
        fromId: transferFromId,
        fromMainId: getOffStop.stationId,
        arrTime: getOffStop.arr,
        toId: nextParsedPath[0].subStationIds[0],
        fromLineId: curLineId,
    }

    try {
        const minTransfer = await transferInfoGetter(transferFromInfo);
        lastDepTime = getOffStop.arr.add(minTransfer?.needTime || 10, 'second')
        const nextTrainInfoList = await trainGetter({
            stationId: currentStationId,
            lineId: nextLineId,
            depTime: lastDepTime
        })
        const normalDepTime = getOffStop.arr.add(minTransfer.needTime, 'second')
        const lessTransferTimeTrains = findLessTransferTimeTrains(nextTrainInfoList, getOffStop.arr, normalDepTime, nextParsedPath[0].stationIds[0])

        const promises = nextTrainInfoList.map(t =>
            recursivePlan(t, nextParsedPath, lastDepTime, trainGetter, transferInfoGetter, [...trains], cb, transferFromInfo, lessTransferTimeTrains)
        )
        await Promise.all(promises)
    } catch (error) {
        console.error('Error in recursivePlan:', error)
        return Promise.reject(error)
    }
}

/**
 * 规划带途经点（viaIds）的最短路径方案。
 * 将途经点依次拼接为多段最短路径，再对整体路径生成具体车次方案。
 */
export function planShortestSolution(rawGraph, fromMainId, toMainId, viaIds = [], trainGetter, transferInfoGetter, depTime = dayjs(), cb) {
    console.log('Plan Shortest Solution:', fromMainId, toMainId, depTime)
    const {graph, subIdToMainMap} = initGraph(rawGraph, fromMainId, toMainId, viaIds)
    // 逐段求最短路径并拼接
    const {path, distance} = [...viaIds, toMainId].map(v => {
        const _fromMainId = MAIN_STATION_PREFIX + fromMainId
        const _toMainId = MAIN_STATION_PREFIX + v
        const route = dijkstra(graph, _fromMainId, _toMainId)
        fromMainId = v
        return route
    }).reduce((e1, e2) => {
        return {
            distance: e1.distance + e2.distance,
            path: [...e1.path, ...e2.path.slice(1)]
        }
    })
    const parsedPath = parseRoute(subIdToMainMap, path)
    return planOnePathSolution({distance, path, parsedPath}, depTime, trainGetter, transferInfoGetter)
        .then(solutions => {
            for (const solution of solutions) {
                cb(solution)
            }
            return solutions
        })
}

/**
 * 将一段完整的行程 segments（train + transfer 交替）转换为可展示的 solution 对象。
 * transfer 分为两类：
 * - transfer：站内换乘（depStationId === arrStationId）
 * - outerTransfer：站外换乘（需要出站再进站）
 */
function toSolution(segments, distance) {
    const transfers = segments.filter(it => it.type === 'transfer')
    const solutionId = segments.filter(it => it.type === 'train').map(it => it.trainInfo.id).join('-')
    const walkDistance = transfers.reduce((acc, cur) => {
        return acc + cur.distance
    }, 0)

    const _trains = []
    if (segments[0].type === 'train') {
        _trains.push(segments[0])
    }
    for (let i = 1; i < segments.length; i++) {
        if (segments[i].type === 'train') {
            if (segments[i - 1].type === 'transfer') {
                const transfer = segments[i - 1]
                if (transfer.depStationId !== transfer.arrStationId) {
                    segments[i].outerTransfer = transfer
                } else {
                    segments[i].transfer = transfer
                }
            }
            _trains.push(segments[i])
        }
    }
    const depInfo = segments[0]
    const arrInfo = segments.slice(-1)[0]
    return {
        id: solutionId,
        transferTimes: transfers.length,
        walkDistance,
        distance,
        totalTime: Math.abs(diff(depInfo.depTime, arrInfo.arrTime)),
        trains: _trains,
        depTime: depInfo.depTime,
        depTimezone: depInfo.depStop.timezone,
        arrTime: arrInfo.arrTime,
        arrTimezone: arrInfo.arrStop.timezone,
        depStationId: segments[0].depStationId,
        arrStationId: segments.slice(-1)[0].arrStationId,
    }
}

/**
 * 根据列车时刻表切片，构建一段乘车区间的列车对象。
 * 包含若干 getter，用于惰性访问上下车站点的名称、ID 等信息。
 */
function buildTrain(trainInfo, getOnIndex, getOffIndex, lessTransferTimeTrains) {
    const stops = trainInfo.schedule.slice(getOnIndex, getOffIndex + 1)
    return {
        depTime: stops[0].dep,
        arrTime: stops.slice(-1)[0].arr,
        get arrStationName() {
            return this.arrStop.stationName
        },
        get depStationName() {
            return this.depStop.stationName
        },
        get depStationId() {
            return this.depStop.stationId
        },
        get arrStationId() {
            return this.arrStop.stationId
        },
        terminal: trainInfo.schedule.slice(-1)[0],
        isFirstStop: getOnIndex === 0,
        get depStop() {
            return this.stops[0]
        },
        get arrStop() {
            return this.stops.slice(-1)[0]
        },
        stops: stops,
        getOnIndex,
        getOffIndex,
        trainInfo,
        lessTransferTimeTrains,
        category: trainInfo.category,
        type: 'train'
    }
}
