import {diff} from "src/utils/time-utils";

/**
 * 给方案打标签 早到达/耗时短/少换乘/无需换乘
 * @param solutions
 */
export function tagSolutions(solutions) {
    const tagSolution = (_solutions, _tag) => {
        _solutions.forEach(it => {
            const tags = it.tags || []
            tags.push(_tag)
            it.tags = tags
        })
    }
    const leastTime = solutions.sort((o1, o2) => o1.totalTime - o2.totalTime)[0].totalTime
    const leastTimeSolutions = solutions.filter(it => it.totalTime === leastTime)
    tagSolution(leastTimeSolutions, SOLUTION_TAGS.LEAST_TIME)

    const firstArrivedTime = solutions.sort((o1, o2) => diff(o1.arrTime, o2.arrTime))[0].arrTime
    const firstArriveSolutions = solutions.filter(it => diff(firstArrivedTime, it.arrTime) === 0)
    tagSolution(firstArriveSolutions, SOLUTION_TAGS.FIRST_ARRIVED)

    const leastTransferTimes = solutions.sort((o1, o2) => o1.transferTimes - o2.transferTimes)[0].transferTimes
    const leastTransferSolutions = solutions.filter(it => it.transferTimes === leastTransferTimes)
    const leastTransferTag = leastTransferTimes === 0 ? SOLUTION_TAGS.NO_TRANSFER : SOLUTION_TAGS.LEAST_TRANSFER
    tagSolution(leastTransferSolutions, leastTransferTag)
}

export const SOLUTION_TAGS = {
    LEAST_TIME: {
        code: 'LEAST_TIME',
        color: '#28a745'
    },
    NO_TRANSFER: {
        code: 'NO_TRANSFER',
        color: '#00b2a9'
    },
    LEAST_TRANSFER: {
        code: 'LEAST_TRANSFER',
        color: '#ffc107'
    },
    FIRST_ARRIVED: {
        code: 'FIRST_ARRIVED',
        color: '#f3397a'
    },
}


