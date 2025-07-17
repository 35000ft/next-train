function Util_getTimeInTimeZone(timeZone, date = new Date(), format = 'YYYY-MM-DD HH:mm:ss') {
    const options = {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    };
    const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(date)
        .reduce((acc, part) => {
            if (part.type !== 'literal') {
                acc[part.type] = part.value;
            }
            return acc;
        }, {});
    return format
        .replace('YYYY', parts.year)
        .replace('MM', parts.month)
        .replace('DD', parts.day)
        .replace('HH', parts.hour)
        .replace('mm', parts.minute)
        .replace('ss', parts.second);
}

/**
 * @typedef {Object} FetchOptions
 * @property {boolean} [noCache] - 是否跳过缓存
 * @property {boolean} [parseToJson] - 是否将结果转换为 JSON 对象
 */
/**
 * 解决跨域、非HTTPS请求问题  ⚠ 仅限GET请求
 * @param url 请求的url
 * @param {FetchOptions} [options] - 请求选项
 * @returns {Promise<*>} - 返回原始字符串或解析后的 JSON 对象
 * @constructor
 */
async function Util_fetchThroughAllOrigins(url, options) {
    const PROXY_URL_BASE = 'https://api.allorigins.win/get?url='
    let proxyUrl = `${PROXY_URL_BASE}${encodeURIComponent(url)}`
    if (options?.noCache) {
        proxyUrl += `&t=${Date.now()}`
    }
    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`AllOrigins proxy error: ${response.status}`);
        }
        const json = await response.json();
        if (!json?.contents) {
            throw new Error(`Empty contents returned from AllOrigins.`);
        }
        // 默认转json
        if (typeof options?.parseToJson !== "boolean") {
            return JSON.parse(json.contents)
        } else {
            return options.parseToJson ? JSON.parse(json.contents) : json.contents;
        }
    } catch (err) {
        console.error('Fetch error via AllOrigins:', err);
        throw err; // 可视需求决定是否抛出错误
    }

}
