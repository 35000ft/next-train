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
 * 解决跨域、非HTTPS请求问题  ⚠ 仅限GET请求
 * @param url 请求的url
 * @param parseToJson 是否将结果转为json 默认是
 * @returns {Promise<*>}
 * @constructor
 */
async function Util_fetchThroughAllOrigins(url, parseToJson = true) {
    const PROXY_URL_BASE = 'https://api.allorigins.win/get?url='
    const proxyUrl = `${PROXY_URL_BASE}${encodeURIComponent(url)}`
    const response = await fetch(proxyUrl, {
        method: 'GET',
    });
    const json = await response.json()
    if (parseToJson) {
        return JSON.parse(json?.contents)
    } else {
        return json?.contents
    }

}
