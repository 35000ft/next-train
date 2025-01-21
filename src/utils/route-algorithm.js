/**
 * 找出所有路径
 * @param {{}} graph
 * @param {String} start
 * @param {String} end
 * @param {Array} path
 * @param {Map[Number:Boolean]} visited 记录访问过的节点
 * @param cb
 * @param minCostPlan 最短路径的距离/成本
 */
export async function findAllPaths(graph, start, end, cb, minCostPlan, path = [], visited) {
    if (!visited) {
        visited = new Map(Object.keys(graph).map(e => [e.toString(), false]))
    }
    visited.set(start, true)
    path.push(start)

    function stopRoute() {
        path.pop()
        visited.set(start, false)
    }

    if (path.length >= 3) {
        const n1 = path.slice(-3)[0]
        const n2 = path.slice(-2)[0]
        const n3 = path.slice(-1)[0]
        if (graph[n1][n2] === 0 && graph[n2][n3] === 0) {
            path.pop()
            visited.set(start, false)
            return
        }
    }

    // 如果当前路径的总代价已经大于最短路径的代价，可以停止
    const currentCost = path.reduce((acc, node, idx) => {
        if (idx === 0) return 0
        const fromNode = path[idx - 1]
        const d = graph[fromNode][node]
        return acc + d
    }, 0)

    const transfers = findTransfers(graph, path)
    //如果换乘次数比最小成本方案的换乘次数多2次及以上 则停止查找当前路径
    let transferCountDiff = transfers.length - minCostPlan.transfers.length;
    if (transferCountDiff > 2) {
        stopRoute()
        return
    } else if (transferCountDiff === 2) {
        if (currentCost > minCostPlan.distance * 1.05) {
            stopRoute()
            return
        }
    }

    //如果当前成本大于最小成本的1.2倍 则停止查找当前路径
    if (currentCost > minCostPlan.distance * 1.2) {
        stopRoute()
        return
    }


    if (start === end) {
        cb(path)
    } else if (graph[start]) {
        for (let k of Object.keys(graph[start])) {
            k = k.toString()
            if (!visited.get(k)) {
                await findAllPaths(graph, k, end, cb, minCostPlan, path, visited)
            }
        }
    }
    // 回溯，撤销当前节点的访问状态和路径
    visited.set(start, false)
    path.pop()
}

export function findTransfers(graph, path) {
    if (path.length <= 2) return []
    return path.slice(0, -1).reduce((acc, node, idx) => {
        if (idx < 2) return []
        const fromNode = path[idx - 1]
        const d = graph[fromNode][node]
        if (d === 0) {
            acc.push([fromNode, node])
        }
        return acc
    }, [])
}

export function findShortestPath(graph, start, end, via = []) {
    return [...via, end].map(v => {
        const route = dijkstra(graph, start, v)
        start = v
        return route
    }).reduce((e1, e2) => {
        return {
            distances: e1.distance + e2.distance,
            path: [...e1.path, ...e2.path.slice(1)]
        }
    })
}

/**
 * @author: ChatGPT 3.5
 * @param  {{}} graph
 * @param  {String} startNode 出发站id
 * @param  {String} endNode  到达站id
 * @returns {{path: number[], distance: *}|{path: *[], distance: number}}
 */
export function dijkstra(graph, startNode, endNode) {
    startNode = startNode.toString()
    endNode = endNode.toString()
    // 初始化距离和前驱节点
    const weightings = {}
    const predecessors = {}
    for (let node in graph) {
        weightings[node] = Infinity
        predecessors[node] = null
    }
    weightings[startNode] = 0
    // 创建一个未处理节点的队列
    const unvisitedNodes = Object.keys(graph)
    // 找到当前距离最短的节点
    while (unvisitedNodes.length > 0) {
        let currentNode = unvisitedNodes.reduce((minNode, node) => {
            return weightings[node] < weightings[minNode] ? node : minNode
        }, unvisitedNodes[0])
        // 如果到达终点，则返回最短路径
        if (currentNode === endNode) {
            let path = []
            while (currentNode !== startNode) {
                if (!currentNode) {
                    console.warn('currentNode is null ', predecessors, path)
                    break
                }
                path.unshift(currentNode)
                currentNode = predecessors[currentNode]
            }
            path.unshift(startNode)
            return {
                distance: weightings[endNode],
                path: path,
            }
        }
        // 更新当前节点相邻节点的距离
        unvisitedNodes.splice(unvisitedNodes.indexOf(currentNode), 1)
        for (let neighbor in graph[currentNode]) {
            let weighting = graph[currentNode][neighbor]
            let totalDistance = weightings[currentNode] + weighting
            if (totalDistance < weightings[neighbor]) {
                weightings[neighbor] = totalDistance
                predecessors[neighbor] = currentNode
            }
        }
    }
    // 如果无法到达终点，则返回空路径
    return {
        distance: Infinity,
        path: []
    }
}
