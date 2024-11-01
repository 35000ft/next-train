import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const TIME_FORMATS = {
  DEFAULT: "YYYY-MM-DD HH:mm:ss",
  HMS: "HH:mm:ss",
  HM: "HH:mm",
  DATE: "YYYY-MM-DD"
}

/**
 * 给定一个_date 如果_date有时区信息 则返回该时区的当前时间 没有则返回utc
 * @param _date {String|Date} 提供时区信息
 * @returns {dayjs.Dayjs} 当前时间
 */
export function getNowTime(_date) {
  let dateInstance;
  // 检查 _date 的类型
  if (!_date) {
    console.warn('_date is undefined or null, return utc')
    return dayjs.utc();
  }

  if (_date instanceof Date) {
    dateInstance = dayjs(_date);
  } else if (typeof _date === 'string') {
    dateInstance = dayjs(_date);
  } else {
    throw new Error('Invalid date format. Please provide a Date object or a valid date string.');
  }
  // 获取时区偏移量
  const offset = dateInstance.utcOffset(); // 获取时区偏移量（单位：分钟）

  // 判断是否有时区信息
  if (offset !== 0) {
    // 如果有时区信息，返回返回当前时区的时间
    return dayjs.utc().add(offset, 'minute');
  } else {
    // 如果没有时区信息，返回当前 UTC 时间
    return dayjs.utc();
  }
}

/**
 * 获取当前时间字符串
 * @param format {String}
 * @param _date {String|Date} 提供时区信息
 * @returns {string} 当前时间字符串
 */
export function getNowTimeString(format = TIME_FORMATS.DEFAULT, _date) {
  const _dayjs = getNowTime(_date)
  return _dayjs.format(format)
}


export function diff(d1, d2, unit = 'second') {
  const d1UTC = dayjs(d1).utc()
  const d2UTC = dayjs(d2).utc()
  return d1UTC.diff(d2UTC, unit);
}

export function diffFromNow(d1, unit = 'second') {
  const d1UTC = dayjs(d1).utc()
  const nowUTC = dayjs().utc()
  return diff(d1UTC, nowUTC, unit);
}

/**
 * 对给定的秒数四舍五入为分钟
 * @example 179->3 69->1
 * @param seconds {Number} 秒数
 * @returns {number} 分钟
 */
export function fixedMins(seconds) {
  let result
  if (seconds % 60 >= 30) {
    result = Math.ceil(seconds / 60)
  } else {
    result = Math.floor(seconds / 60)
  }
  return result
}
