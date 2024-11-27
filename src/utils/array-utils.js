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
