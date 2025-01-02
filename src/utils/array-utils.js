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
