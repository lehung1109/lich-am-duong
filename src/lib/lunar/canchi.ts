import { CAN, CHI } from "./constants";
import { CanChiInfo, LunarDate } from "./types";
import { jdFromDate } from "./astronomical";

/**
 * Calculates the Can Chi for a given lunar year.
 * @param lunarYear Lunar year (e.g. 2024 -> "Giáp Thìn")
 */
export function getCanChiYear(lunarYear: number): string {
  const canIndex = ((lunarYear + 6) % 10 + 10) % 10;
  const chiIndex = ((lunarYear + 8) % 12 + 12) % 12;
  return `${CAN[canIndex]} ${CHI[chiIndex]}`;
}

/**
 * Calculates the Can Chi for a given lunar month using the Ngũ Hổ Độn formula.
 * Lunar month 1 (tháng Giêng) is always Chi Dần (index 2).
 * @param lunarMonth Lunar month [1, 12]
 * @param lunarYear Lunar year
 */
export function getCanChiMonth(lunarMonth: number, lunarYear: number): string {
  const yearCanIndex = ((lunarYear + 6) % 10 + 10) % 10;
  const monthCanIndex = ((yearCanIndex * 2 + lunarMonth + 1) % 10 + 10) % 10;
  // Lunar Month 1 is Dần (index 2)
  const monthChiIndex = ((lunarMonth + 1) % 12 + 12) % 12;
  return `${CAN[monthCanIndex]} ${CHI[monthChiIndex]}`;
}

/**
 * Calculates the Can Chi for a given Gregorian/Solar day using Julian Day number.
 * @param dd Day of solar month
 * @param mm Solar month [1, 12]
 * @param yy Solar year
 */
export function getCanChiDay(dd: number, mm: number, yy: number): string {
  const jd = jdFromDate(dd, mm, yy);
  const canIndex = ((jd + 9) % 10 + 10) % 10;
  const chiIndex = ((jd + 1) % 12 + 12) % 12;
  return `${CAN[canIndex]} ${CHI[chiIndex]}`;
}

/**
 * Calculates the Can Chi for a given hour using the Ngũ Thử Độn formula.
 * Each Chi hour spans 2 solar hours, starting with Tý at 23:00 - 01:00.
 * @param hour Hour of day [0, 23]
 * @param dayCanIndex Can index of the day [0, 9] (0: Giáp, 1: Ất, ...)
 */
export function getCanChiHour(hour: number, dayCanIndex: number): string {
  const chiIndex = Math.floor(((hour + 1) % 24 + 24) % 24 / 2) % 12;
  const hourCanIndex = ((dayCanIndex * 2 + chiIndex) % 10 + 10) % 10;
  return `${CAN[hourCanIndex]} ${CHI[chiIndex]}`;
}

/**
 * Returns complete Can Chi information (Year, Month, Day, Hour) for a given date and time.
 * @param dd Day of solar month
 * @param mm Solar month [1, 12]
 * @param yy Solar year
 * @param lunarDate LunarDate object
 * @param hour Hour of day [0, 23] (defaults to current hour)
 */
export function getFullCanChi(
  dd: number,
  mm: number,
  yy: number,
  lunarDate: LunarDate,
  hour: number = new Date().getHours()
): CanChiInfo {
  const jd = jdFromDate(dd, mm, yy);
  const dayCanIndex = ((jd + 9) % 10 + 10) % 10;

  return {
    yearCanChi: getCanChiYear(lunarDate.year),
    monthCanChi: getCanChiMonth(lunarDate.month, lunarDate.year),
    dayCanChi: getCanChiDay(dd, mm, yy),
    hourCanChi: getCanChiHour(hour, dayCanIndex),
  };
}
