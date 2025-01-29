/**
 * Array to map
 * @param {Array}_array
 * @param {String?}keyName
 * @returns {Map|undefined}
 */
export function arr2Map(_array, keyName) {
    if (!_array instanceof Array) {
        return null
    }
    return _array.reduce((acc, item) => {
        if (keyName) {
            acc.set(item[keyName], item)
        } else {
            acc.set(item, item)
        }
        return acc;
    }, new Map());

}


export function contains(_list, target) {
    if (_list instanceof Array) {
        return _list.indexOf(target) !== -1
    }
    return false
}

export function findLongestCommonSubarray(arr1, arr2) {
    const m = arr1.length;
    const n = arr2.length;

    // 创建一个二维数组来存储公共子数组的长度
    const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(0));
    let maxLength = 0; // 记录最长公共子数组的长度
    let endIndex = 0;  // 记录最长公共子数组的结束位置

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (arr1[i - 1] === arr2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1; // 如果当前元素相等，则在前一个基础上加1
                if (dp[i][j] > maxLength) {
                    maxLength = dp[i][j]; // 更新最大长度
                    endIndex = i - 1;    // 更新结束位置
                }
            } else {
                dp[i][j] = 0; // 如果当前元素不相等，则重置为0
            }
        }
    }

    // 根据结束位置和最大长度提取最长公共子数组
    if (maxLength === 0) {
        return []; // 如果没有公共子数组，返回空数组
    }
    return arr1.slice(endIndex - maxLength + 1, endIndex + 1);
}
