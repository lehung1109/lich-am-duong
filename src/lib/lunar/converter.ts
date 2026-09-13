import { LunarDate, SolarDate } from "./types";
import { jdFromDate, jdToDate, getNewMoonDay, getSunLongitude } from "./astronomical";

export const TIMEZONE = 7.0;
const SYNODIC_MONTH = 29.530588853;

/**
 * Returns the major solar term (Trung khí) index [0, 11] at midnight for a given Julian day number.
 * Each major term corresponds to a 30-degree segment of solar longitude.
 */
export function getSunMajorTerm(dayNumber: number, timezone: number = TIMEZONE): number {
  return Math.floor(getSunLongitude(dayNumber, timezone) / 30);
}

/**
 * Finds the Julian day number of the New Moon that begins lunar month 11
 * of the given solar year for the given timezone.
 * Month 11 always contains the Winter Solstice (Đông Chí, Sun longitude >= 270°).
 */
export function getLunarMonth11(yy: number, timezone: number = TIMEZONE): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / SYNODIC_MONTH);
  let nm = getNewMoonDay(k, timezone);
  const sunLong = getSunMajorTerm(nm, timezone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timezone);
  }
  return nm;
}

/**
 * Finds the offset (number of months after month 11) of the leap month.
 * A lunar month is a leap month if the Sun's major solar term does not change during it.
 */
export function getLeapMonthOffset(a11: number, timezone: number = TIMEZONE): number {
  const k = Math.floor((a11 - 2415021.076998695) / SYNODIC_MONTH + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunMajorTerm(getNewMoonDay(k + i, timezone), timezone);
  do {
    last = arc;
    i++;
    arc = getSunMajorTerm(getNewMoonDay(k + i, timezone), timezone);
  } while (arc !== last && i < 14);
  return i - 1;
}

/**
 * Converts a Solar date (day, month, year) to a Lunar date in the given timezone (default GMT+7).
 * Implements Hồ Ngọc Đức's algorithm based on Jean Meeus' Astronomical Algorithms.
 */
export function solarToLunar(dd: number, mm: number, yy: number, timezone: number = TIMEZONE): LunarDate {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / SYNODIC_MONTH);
  let monthStart = getNewMoonDay(k + 1, timezone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timezone);
  }

  let a11 = getLunarMonth11(yy, timezone);
  let b11 = a11;
  let lunarYear: number;

  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timezone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timezone);
  }

  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let isLeap = false;
  let lunarMonth = diff + 11;
  let leapMonth: number | undefined;

  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timezone);
    const calculatedLeapMonth = ((leapMonthDiff + 9) % 12) + 1;
    leapMonth = calculatedLeapMonth;

    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        isLeap = true;
      }
    }
  }

  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }

  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    isLeap,
    leapMonth,
  };
}

/**
 * Returns the leap month (1-12) for a given lunar year, or 0 if the year has no leap month.
 */
export function getLeapMonthForYear(lunarYear: number, timezone: number = TIMEZONE): number {
  const a11 = getLunarMonth11(lunarYear - 1, timezone);
  const b11 = getLunarMonth11(lunarYear, timezone);
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, timezone);
    return ((leapOff + 9) % 12) + 1;
  }
  return 0;
}

/**
 * Converts a Lunar date (day, month, year, isLeap) to the corresponding Solar date.
 * Returns { day: 0, month: 0, year: 0 } if the date is invalid (e.g. day 30 in a 29-day month).
 */
export function lunarToSolar(
  lunarDay: number,
  lunarMonth: number,
  lunarYear: number,
  isLeap: boolean = false,
  timezone: number = TIMEZONE
): SolarDate {
  if (lunarMonth < 1 || lunarMonth > 12) {
    return { day: 0, month: 0, year: 0 };
  }

  let a11: number;
  let b11: number;

  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, timezone);
    b11 = getLunarMonth11(lunarYear, timezone);
  } else {
    a11 = getLunarMonth11(lunarYear, timezone);
    b11 = getLunarMonth11(lunarYear + 1, timezone);
  }

  const k = Math.floor(0.5 + (a11 - 2415021.076998695) / SYNODIC_MONTH);
  let off = lunarMonth - 11;
  if (off < 0) {
    off += 12;
  }

  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, timezone);
    const leapMonth = ((leapOff + 9) % 12) + 1;

    if (isLeap && lunarMonth !== leapMonth) {
      // Return invalid date or fallback
      return { day: 0, month: 0, year: 0 };
    } else if (isLeap || off >= leapOff) {
      off += 1;
    }
  } else if (isLeap) {
    // Year has no leap month, but isLeap was requested
    return { day: 0, month: 0, year: 0 };
  }

  const monthStart = getNewMoonDay(k + off, timezone);
  const nextMonthStart = getNewMoonDay(k + off + 1, timezone);
  const daysInMonth = nextMonthStart - monthStart;

  if (lunarDay < 1 || lunarDay > daysInMonth) {
    return { day: 0, month: 0, year: 0 };
  }

  return jdToDate(monthStart + lunarDay - 1);
}

/**
 * Returns the number of days (29 or 30) in a given lunar month, or 0 if invalid.
 */
export function getDaysInLunarMonth(
  lunarMonth: number,
  lunarYear: number,
  isLeap: boolean = false,
  timezone: number = TIMEZONE
): number {
  if (lunarMonth < 1 || lunarMonth > 12) {
    return 0;
  }

  let a11: number;
  let b11: number;

  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, timezone);
    b11 = getLunarMonth11(lunarYear, timezone);
  } else {
    a11 = getLunarMonth11(lunarYear, timezone);
    b11 = getLunarMonth11(lunarYear + 1, timezone);
  }

  const k = Math.floor(0.5 + (a11 - 2415021.076998695) / SYNODIC_MONTH);
  let off = lunarMonth - 11;
  if (off < 0) {
    off += 12;
  }

  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, timezone);
    const leapMonth = ((leapOff + 9) % 12) + 1;

    if (isLeap && lunarMonth !== leapMonth) {
      // Month is not the leap month of this year
      return 0;
    } else if (isLeap || off >= leapOff) {
      off += 1;
    }
  } else if (isLeap) {
    // Year has no leap month, but isLeap was requested
    return 0;
  }

  const currentMonthStart = getNewMoonDay(k + off, timezone);
  const nextMonthStart = getNewMoonDay(k + off + 1, timezone);
  return nextMonthStart - currentMonthStart;
}

