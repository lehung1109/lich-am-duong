import { TIET_KHI } from "./constants";
import { jdFromDate, getSunLongitude } from "./astronomical";

/**
 * Determines the solar term (Tiết khí) for a given Gregorian date and timezone.
 * Each of the 24 solar terms corresponds to a 15-degree segment of solar longitude,
 * starting from Xuân phân (Vernal Equinox, 0°).
 * @param dd Day of solar month
 * @param mm Solar month [1, 12]
 * @param yy Solar year
 * @param timezone Timezone offset in hours (default: 7.0 for Vietnam UTC+7)
 */
export function getTietKhi(dd: number, mm: number, yy: number, timezone: number = 7.0): string {
  const jd = jdFromDate(dd, mm, yy);
  const longitude = getSunLongitude(jd, timezone);
  const index = Math.floor(longitude / 15);
  return TIET_KHI[((index % 24) + 24) % 24];
}
