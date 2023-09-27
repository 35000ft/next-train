moment.relativeTimeThreshold('s', 15)
moment.defineLocale('zh-cn', {
    relativeTime: {
        future: '%s内',
        past: '%s前',
        s: '几秒',
        m: '1分钟',
        mm: '%d分钟',
        h: '1小时',
        hh: '%d小时',
        d: '1天',
        dd: '%d天',
        M: '1个月',
        MM: '%d个月',
        y: '1年',
        yy: '%d年'
    }
})

export const formatFromNow = (time, max, unit, pattern) => {
    const diff = Math.abs(moment().diff(time, unit))
    if (diff <= max) {
        return time.fromNow()
    }
    return time.format(pattern)
}