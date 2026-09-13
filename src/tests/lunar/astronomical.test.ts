import { describe, it, expect } from "vitest";
import { jdFromDate, jdToDate, getNewMoonDay, getSunLongitude } from "@/lib/lunar/astronomical";

describe("Astronomical Calculations (GMT+7)", () => {
  describe("Julian Day Calculations", () => {
    it("should calculate Julian Day number and convert back correctly", () => {
      // 2024-01-01
      const jd = jdFromDate(1, 1, 2024);
      expect(jd).toBe(2460311);
      const date = jdToDate(jd);
      expect(date).toEqual({ day: 1, month: 1, year: 2024 });
    });

    it("should handle leap year dates correctly (2024-02-29)", () => {
      const jd = jdFromDate(29, 2, 2024);
      const date = jdToDate(jd);
      expect(date).toEqual({ day: 29, month: 2, year: 2024 });
      expect(jd - jdFromDate(1, 1, 2024)).toBe(59);
    });

    it("should handle millennium date (2000-01-01)", () => {
      const jd = jdFromDate(1, 1, 2000);
      expect(jd).toBe(2451545);
      const date = jdToDate(jd);
      expect(date).toEqual({ day: 1, month: 1, year: 2000 });
    });

    it("should handle historical Julian dates (before Gregorian reform 1582-10-15)", () => {
      // Julian calendar date: 1582-10-04 (JD = 2299160)
      const jd = jdFromDate(4, 10, 1582);
      expect(jd).toBe(2299160);
      const date = jdToDate(jd);
      expect(date).toEqual({ day: 4, month: 10, year: 1582 });
    });
  });

  describe("Sun Longitude Calculations", () => {
    it("should calculate Sun longitude accurately at known equinoxes/solstices", () => {
      // Spring Equinox ~March 21 (Sun longitude around 0 degrees / 360 degrees)
      const jdEquinox = jdFromDate(21, 3, 2024);
      const sl = getSunLongitude(jdEquinox, 7.0);
      expect(sl).toBeGreaterThanOrEqual(0);
      expect(sl).toBeLessThanOrEqual(2);
    });

    it("should calculate Sun longitude around Summer Solstice (~June 21 around 90 degrees)", () => {
      const jdSummerSolstice = jdFromDate(21, 6, 2024);
      const sl = getSunLongitude(jdSummerSolstice, 7.0);
      expect(sl).toBeGreaterThanOrEqual(89);
      expect(sl).toBeLessThanOrEqual(91);
    });

    it("should calculate Sun longitude around Winter Solstice (~December 21 around 270 degrees)", () => {
      const jdWinterSolstice = jdFromDate(21, 12, 2024);
      const sl = getSunLongitude(jdWinterSolstice, 7.0);
      expect(sl).toBeGreaterThanOrEqual(269);
      expect(sl).toBeLessThanOrEqual(271);
    });
  });

  describe("New Moon Day (Sóc) Calculations", () => {
    it("should find New Moon day (Sóc) for Tết Giáp Thìn 2024", () => {
      // Tết 2024 was on 2024-02-10 (JD = 2460351)
      // k = 1535 corresponds to New Moon of February 2024 (124 years since Jan 1900)
      const newMoonJd = getNewMoonDay(1535, 7.0);
      expect(newMoonJd).toBe(2460351);
      expect(jdToDate(newMoonJd)).toEqual({ day: 10, month: 2, year: 2024 });
    });

    it("should find New Moon day (Sóc) for Tết Giáp Tý 1924 (k = 298)", () => {
      // Tết 1924 was on 1924-02-05 (JD = 2423821)
      // k = 298 corresponds to New Moon of February 1924 (24 years since Jan 1900)
      const newMoonJd = getNewMoonDay(298, 7.0);
      expect(newMoonJd).toBe(2423821);
      expect(jdToDate(newMoonJd)).toEqual({ day: 5, month: 2, year: 1924 });
    });

    it("should find New Moon day (Sóc) for Tết Quý Mão 2023", () => {
      // Tết 2023 was on 2023-01-22 (JD = 2459967)
      // k = 1522 corresponds to New Moon of January 2023
      const newMoonJd = getNewMoonDay(1522, 7.0);
      expect(newMoonJd).toBe(2459967);
      expect(jdToDate(newMoonJd)).toEqual({ day: 22, month: 1, year: 2023 });
    });

    it("should find New Moon day (Sóc) for Tết Ất Tỵ 2025", () => {
      // Tết 2025 is on 2025-01-29 (JD = 2460705)
      // k = 1547 corresponds to New Moon of January 2025
      const newMoonJd = getNewMoonDay(1547, 7.0);
      expect(newMoonJd).toBe(2460705);
      expect(jdToDate(newMoonJd)).toEqual({ day: 29, month: 1, year: 2025 });
    });
  });
});
