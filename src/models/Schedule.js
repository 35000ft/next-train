import dayjs from "dayjs";
import {TIME_FORMATS} from "src/utils/time-utils";

/**
 * 判断date是不是属于这个时刻表头
 * @param  lineScheduleHeader
 * @param  {String|dayjs.Dayjs} date
 * @returns {boolean}
 */
export function isTargetScheduleHeader(lineScheduleHeader, date) {
    if (date instanceof Object) {
        date = date.format(TIME_FORMATS.DATE)
    }
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
        const weekday = _date.day() === 0 ? 7 : _date.day()
        if (lineScheduleHeader.period.contains(weekday)) {
            return true
        }
    }
    return false
}

export const SCHEDULE_CATEGORY = {
    HOLIDAY: {
        code: "HOLIDAY",
    },
    WORKDAY: {
        code: "WORKDAY",
    },
    WEEKEND: {
        code: "WEEKEND",
    },
    NORMAL: {
        code: "NORMAL",
    }

}
