import dayjs from "dayjs";

/**
 * 判断date是不是属于这个时刻表头
 * @param  lineScheduleHeader
 * @param  {String} date
 * @returns {boolean}
 */
export function isTargetScheduleHeader(lineScheduleHeader, date) {
    if (lineScheduleHeader.specifiedDates && lineScheduleHeader.specifiedDates.contains(date)) {
        return true
    }
    if (lineScheduleHeader.excludedDates && lineScheduleHeader.excludedDates.contains(date)) {
        return false
    }
    const fromDate = dayjs(lineScheduleHeader.fromDate)
    const toDate = dayjs(lineScheduleHeader.toDate)
    const _date = dayjs(date)
    if (_date >= fromDate && _date <= toDate) {
        if (lineScheduleHeader.period.contains(_date.day())) {
            return true
        }
    }
    return false
}
