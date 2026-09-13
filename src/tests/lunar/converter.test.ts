import { describe, it, expect } from "vitest";
import { solarToLunar, lunarToSolar, getDaysInLunarMonth } from "@/lib/lunar/converter";

describe("Solar <-> Lunar Converter", () => {
  describe("Tết Nguyên Đán conversions", () => {
    it("should convert Tết Nguyên Đán accurately for 2024, 2025, 2026", () => {
      // 2024: 10/02/2024 -> 01/01/2024 (Giáp Thìn)
      expect(solarToLunar(10, 2, 2024)).toMatchObject({ day: 1, month: 1, year: 2024, isLeap: false });

      // 2025: 29/01/2025 -> 01/01/2025 (Ất Tỵ)
      expect(solarToLunar(29, 1, 2025)).toMatchObject({ day: 1, month: 1, year: 2025, isLeap: false });

      // 2026: 17/02/2026 -> 01/01/2026 (Bính Ngọ)
      expect(solarToLunar(17, 2, 2026)).toMatchObject({ day: 1, month: 1, year: 2026, isLeap: false });
    });

    it("should convert Tết Nguyên Đán for 2023 (Quý Mão) and 2027 (Đinh Mùi)", () => {
      // 2023: 22/01/2023 -> 01/01/2023 (Quý Mão)
      expect(solarToLunar(22, 1, 2023)).toMatchObject({ day: 1, month: 1, year: 2023, isLeap: false });

      // 2027: 06/02/2027 -> 01/01/2027 (Đinh Mùi)
      expect(solarToLunar(6, 2, 2027)).toMatchObject({ day: 1, month: 1, year: 2027, isLeap: false });
    });
  });

  describe("Leap month handling", () => {
    it("should correctly handle leap month year (2023 has leap month 2)", () => {
      // Year 2023 had leap month 2 (tháng 2 nhuận)
      // 22/03/2023 was 01/02 nhuận
      const lunar = solarToLunar(22, 3, 2023);
      expect(lunar.day).toBe(1);
      expect(lunar.month).toBe(2);
      expect(lunar.isLeap).toBe(true);
      expect(lunar.year).toBe(2023);
    });

    it("should correctly handle leap month year (2025 has leap month 6)", () => {
      // Year 2025 has leap month 6 (tháng 6 nhuận)
      // 25/07/2025 is 01/06 nhuận
      const lunar = solarToLunar(25, 7, 2025);
      expect(lunar.day).toBe(1);
      expect(lunar.month).toBe(6);
      expect(lunar.isLeap).toBe(true);
      expect(lunar.year).toBe(2025);
    });
  });

  describe("Year boundary transitions", () => {
    it("should correctly handle Gregorian year boundaries", () => {
      // 31/12/2025 is in lunar month 11 of year 2025
      const end2025 = solarToLunar(31, 12, 2025);
      expect(end2025.month).toBe(11);
      expect(end2025.year).toBe(2025);

      // 01/01/2026 is in lunar month 11 of year 2025
      const start2026 = solarToLunar(1, 1, 2026);
      expect(start2026.month).toBe(11);
      expect(start2026.year).toBe(2025);

      // 16/02/2026 is last day of lunar year 2025 (30 tháng Chạp)
      const endLunar2025 = solarToLunar(16, 2, 2026);
      expect(endLunar2025.month).toBe(12);
      expect(endLunar2025.year).toBe(2025);
    });
  });

  describe("Two-way symmetry (solar <-> lunar)", () => {
    it("should convert back from lunar to solar with perfect two-way symmetry", () => {
      const dates = [
        { d: 10, m: 2, y: 2024 },
        { d: 15, m: 8, y: 2024 }, // Tết Trung thu (15/08 Giáp Thìn)
        { d: 1, m: 1, y: 2025 },
        { d: 22, m: 3, y: 2023 }, // Leap month date
        { d: 25, m: 7, y: 2025 }, // Leap month date in 2025
        { d: 31, m: 12, y: 2025 },
        { d: 1, m: 1, y: 2026 },
        { d: 17, m: 2, y: 2026 }
      ];

      for (const dt of dates) {
        const lunar = solarToLunar(dt.d, dt.m, dt.y);
        const solar = lunarToSolar(lunar.day, lunar.month, lunar.year, lunar.isLeap);
        expect(solar).toEqual({ day: dt.d, month: dt.m, year: dt.y });
      }
    });

    it("should maintain two-way round-trip across 365 consecutive days of 2024", () => {
      // Test full year of 2024 (leap solar year)
      const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      for (let m = 1; m <= 12; m++) {
        for (let d = 1; d <= daysInMonth[m - 1]; d++) {
          const lunar = solarToLunar(d, m, 2024);
          const solar = lunarToSolar(lunar.day, lunar.month, lunar.year, lunar.isLeap);
          expect(solar).toEqual({ day: d, month: m, year: 2024 });
        }
      }
    });
  });

  describe("Days in lunar month calculation", () => {
    it("should return correct number of days in lunar months (29 or 30)", () => {
      const days = getDaysInLunarMonth(1, 2024);
      expect([29, 30]).toContain(days);
    });

    it("should return 29 or 30 for all months in lunar year 2023 (including leap month 2)", () => {
      for (let m = 1; m <= 12; m++) {
        const regularDays = getDaysInLunarMonth(m, 2023, false);
        expect([29, 30]).toContain(regularDays);
      }
      const leapDays = getDaysInLunarMonth(2, 2023, true);
      expect([29, 30]).toContain(leapDays);
    });

    it("should return 29 or 30 for all months in lunar year 2025 (including leap month 6)", () => {
      for (let m = 1; m <= 12; m++) {
        const regularDays = getDaysInLunarMonth(m, 2025, false);
        expect([29, 30]).toContain(regularDays);
      }
      const leapDays = getDaysInLunarMonth(6, 2025, true);
      expect([29, 30]).toContain(leapDays);
    });
  });
});
