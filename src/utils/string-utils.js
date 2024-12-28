import {pinyin} from 'pinyin-pro';

function isNumber(str) {
    if (!str) return false
    return /^(-?(0|[1-9]\d{0,18}))$/.test(str)
}

function isAlphabet(str) {
    const regex = /^[A-Za-z\s]+$/;
    return regex.test(str);
}

function isChineseChar(char) {
    const regex = /^[\u4e00-\u9fa5]+$/;
    return regex.test(char);
}

function getPinyinAbbr(str) {
    return pinyin(str, {type: 'string', separator: '', pattern: 'first', toneType: 'none'})
}

/**
 *
 * @param {String} str
 */
function getFirstLetters(str) {
    return str
        .split(' ')
        .map(it => it.slice(0, 1))
        .join('').toLowerCase()
}

function findByAbbr(targetAbbr, texts) {
    if (!texts instanceof Array || typeof targetAbbr !== "string") {
        return texts
    }
    targetAbbr = targetAbbr.toLowerCase()
    return texts.map((it, index) => {
        it = it.replace(/\s+/g, " ")
        let _abbr
        let match
        if (containsChinese(it)) {
            _abbr = getPinyinAbbr(it).toLowerCase()
            console.log('pinyin', _abbr)
            const findStartIndex = _abbr.indexOf(targetAbbr)
            if (findStartIndex !== -1) {
                match = it.slice(findStartIndex, findStartIndex + targetAbbr.length)
            }
        } else if (isAlphabet(it)) {
            _abbr = getFirstLetters(it)
            const findStartIndex = _abbr.indexOf(targetAbbr)
            if (findStartIndex !== -1) {
                match = it.split(' ').slice(findStartIndex, findStartIndex + _abbr.length - 1).join(' ')
            }
        } else {
            return null
        }
        if (match) {
            return {
                index,
                match,
                ratio: (targetAbbr.length / it.length).toFixed(4)
            }
        } else {
            return null
        }
    })
        .filter(it => it != null)
}

function containsChinese(str) {
    // 正则表达式匹配一个或多个汉字字符
    const regex = /[\u4e00-\u9fa5]+/g;
    // 测试字符串是否匹配正则表达式
    return regex.test(str);
}

/**
 * 计算给定模式字符串的部分匹配表（也称为失败函数）。
 * @param {string} pattern - 模式字符串。
 * @return {number[]} - 部分匹配表数组。
 */
function computeLPSArray(pattern) {
    let lps = [0];
    let len = 0;
    let i = 1;
    if (pattern[0] === pattern[i]) {
        lps[0] = 1;
    }
    while (i < pattern.length) {
        if (pattern[i] === pattern[len]) {
            len++;
            lps[i] = len;
            i++;
        } else {
            if (len !== 0) {
                len = lps[len - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }
    return lps;
}

/**
 * 使用 KMP 算法在给定文本中搜索模式字符串的所有出现。
 * @param {string} pat - 要搜索的模式字符串。
 * @param {string} txt - 被搜索的文本字符串。
 * @return {Object} - 包含匹配信息的对象数组，每个对象包含原始数组索引、匹配词和匹配内容占原文的比例。
 */
function KMPSearch(pat, txt) {
    let lps = computeLPSArray(pat);
    let i = 0; // index for txt
    let j = 0; // index for pat
    while (i < txt.length) {
        if (pat[j] === txt[i]) {
            i++;
            j++;
        }
        if (j === pat.length) {
            return {
                index: -1,
                match: pat, // matched word
                ratio: (pat.length / txt.length).toFixed(4) // ratio of match content to original text
            }
        } else if (i < txt.length && pat[j] !== txt[i]) {
            if (j !== 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }
    return null
}

/**
 * 使用 KMP 算法在数组的每个文本中搜索模式字符串，并返回一个 Map，其中键是数组索引，值是匹配结果对象数组。
 * @param {string[]} texts - 包含多个字符串的数组。
 * @param {string} pattern - 要搜索的模式字符串。
 * @return {Array} - 键为数组索引，值为匹配结果对象数组的 Map。
 */
function findMatches(pattern, texts) {
    const processText = (txt, index) => {
        const result = KMPSearch(pattern, txt)
        if (result == null) {
            return null
        }
        result.index = index
        return result
    }

    // 使用 flatMap 遍历 texts 数组，并对每个文本应用 processText 函数
    return texts.map((txt, index) => {
        return processText(txt, index);
    }).filter(it => it != null)
}

/**
 *
 * @param {Object} obj
 * @param {Object}  matchedData
 * @param {String}  sourcePropertyName
 * @param {String} highlightedClass
 * @return {Object} obj with highlighted info
 */
function toHighlighted(obj, matchedData, sourcePropertyName, highlightedClass) {
    const {ratio, match} = matchedData
    const _obj = Object.assign({}, obj)
    _obj.ratio = ratio
    _obj.match = match
    _obj.highlighted = obj[sourcePropertyName].replace(match, `<span class="${highlightedClass}">${match}</span>`)
    return _obj
}

/**
 * 生成名字缩写 支持中英文
 * @param {String} name
 * @param {Map} briefNameMap 用于检测冲突 冲突时再添加新的内容
 */
function genBriefName(name, briefNameMap) {
    if (!name || name.length === 0) return name
    let _newName = name.slice(0, 1)
    const suffixes = ['*', '#', '.', '**']
    for (let i = 0; i < suffixes.length; i++) {
        if (!briefNameMap.has(_newName)) {
            return _newName
        }
        _newName += suffixes[i]
    }
    console.warn('Too much brief name conflict')
    return name
}

export {isNumber, findMatches, containsChinese, findByAbbr, isAlphabet, toHighlighted, genBriefName}
