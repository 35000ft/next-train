/**
 * 找出所有路径
 * @param {{}} graph
 * @param {String} start
 * @param {String} end
 * @param {Array} path
 * @param {Map[Number:Boolean]} visited 记录访问过的节点
 * @param cb
 * @returns {Promise<Array>}
 */
let visited

export async function findAllPaths(graph, start, end, cb, path = []) {
    if (!visited) {
        visited = new Map(Object.keys(graph).map(e => [e.toString(), false]))
    }
    visited.set(start, true)
    path.push(start)
    if (start === end) {
        console.log('start === end', path)
        cb(path)
    } else if (graph[start]) {
        for (let k of Object.keys(graph[start])) {
            k = k.toString()
            if (!visited.get(k)) {
                await findAllPaths(graph, k, end, cb, path)
            }
        }
    }
    // 回溯，撤销当前节点的访问状态和路径
    visited.set(start, false)
    path.pop()
}

export function findShortestPath(graph, start, end, via) {
    return [...via, end].map(v => {
        const route = dijkstra(graph, start, v)
        start = v
        return route
    }).reduce((e1, e2) => {
        return {
            distance: e1.distance + e2.distance,
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
    const transferInfo = {}
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
                path.unshift(currentNode)
                currentNode = predecessors[currentNode]
            }
            path.unshift(startNode)
            return {
                distance: weightings[endNode],
                path: path.map(e => parseInt(e)),
            }
        }
        // 更新当前节点相邻节点的距离
        unvisitedNodes.splice(unvisitedNodes.indexOf(currentNode), 1)
        for (let neighbor in graph[currentNode]) {
            let weighting = graph[currentNode][neighbor]
            const transfer = getTransfer(currentNode, predecessors[currentNode], neighbor)
            if (transfer != null) {
                weighting += transfer.time
                transferInfo[currentNode] = transfer
            }
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
