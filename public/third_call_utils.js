/**
 * 获取指定时区的格式化时间字符串。
 *
 * @function Util_getTimeInTimeZone
 * @param {string} timeZone - 时区名称（如 'Asia/Shanghai', 'UTC', 'America/New_York'）。
 * @param {Date} [date=new Date()] - 要格式化的日期对象，默认为当前时间。
 * @param {string} [format='YYYY-MM-DD HH:mm:ss'] - 时间格式模板。支持占位符：
 *   - YYYY: 年
 *   - MM: 月（两位）
 *   - DD: 日（两位）
 *   - HH: 小时（24小时制，两位）
 *   - mm: 分钟（两位）
 *   - ss: 秒（两位）
 * @returns {string} 指定格式的时间字符串（对应时区）。
 *
 * @example
 * Util_getTimeInTimeZone('Asia/Shanghai'); // '2025-07-17 14:30:45'
 * Util_getTimeInTimeZone('UTC', new Date(), 'YYYY-MM-DDTHH:mm:ss'); // '2025-07-17T06:30:45'
 */
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
        throw err;
    }

}

/**
 * @typedef {Object} StopInfo
 * @property {String} [stationId]
 * @property {String} [stationName]
 * @property {String} [arrTime]
 * @property {String} [depTime]
 */

/**
 * @typedef {Object} RawTrainInfoDetail
 * @property {String} [id]
 * @property {Array<StopInfo>} [schedule]
 * @property {Number|String} [direction]
 * @property {String?} [trainNo]
 * @property {String?} [category]
 */
/**
 *
 * @param {RawTrainInfoDetail} rawData
 * @constructor
 */
function Util_toTrainInfoDetailResponse(rawData) {
    const schedule = rawData.schedule
    if (!schedule) {
        console.warn('Schedule can not be empty', rawData)
        return null
    }
    return {}
}
