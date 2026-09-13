import { describe, it, expect } from "vitest";
import {
  getCanChiYear,
  getCanChiMonth,
  getCanChiDay,
  getCanChiHour,
  getFullCanChi,
} from "@/lib/lunar/canchi";
import { getTietKhi } from "@/lib/lunar/tietkhi";
import { LunarDate } from "@/lib/lunar/types";

describe("Can Chi & Tiết Khí", () => {
  describe("Can Chi of Year", () => {
    it("should calculate Can Chi of known years correctly", () => {
      expect(getCanChiYear(2024)).toBe("Giáp Thìn");
      expect(getCanChiYear(2025)).toBe("Ất Tỵ");
      expect(getCanChiYear(2026)).toBe("Bính Ngọ");
      expect(getCanChiYear(1975)).toBe("Ất Mão");
      expect(getCanChiYear(1984)).toBe("Giáp Tý");
      expect(getCanChiYear(2000)).toBe("Canh Thìn");
    });

    it("should repeat every 60 years in the sexagenary cycle", () => {
      for (let y = 1924; y <= 2044; y++) {
        expect(getCanChiYear(y + 60)).toBe(getCanChiYear(y));
      }
    });
  });

  describe("Can Chi of Month (Ngũ Hổ Độn)", () => {
    it("should calculate Can Chi of months for Giáp year (2024)", () => {
      // Giáp Kỷ chi niên Bính tác sơ -> Month 1 is Bính Dần
      expect(getCanChiMonth(1, 2024)).toBe("Bính Dần");
      expect(getCanChiMonth(2, 2024)).toBe("Đinh Mão");
      expect(getCanChiMonth(7, 2024)).toBe("Nhâm Thân");
      expect(getCanChiMonth(11, 2024)).toBe("Bính Tý");
      expect(getCanChiMonth(12, 2024)).toBe("Đinh Sửu");
    });

    it("should calculate Month 1 Can correctly across 5 Can pairings (Ngũ Hổ Độn)", () => {
      // Giáp/Kỷ -> Bính Dần
      expect(getCanChiMonth(1, 2024)).toBe("Bính Dần"); // 2024: Giáp
      expect(getCanChiMonth(1, 2029)).toBe("Bính Dần"); // 2029: Kỷ

      // Ất/Canh -> Mậu Dần
      expect(getCanChiMonth(1, 2025)).toBe("Mậu Dần"); // 2025: Ất
      expect(getCanChiMonth(1, 2030)).toBe("Mậu Dần"); // 2030: Canh

      // Bính/Tân -> Canh Dần
      expect(getCanChiMonth(1, 2026)).toBe("Canh Dần"); // 2026: Bính
      expect(getCanChiMonth(1, 2031)).toBe("Canh Dần"); // 2031: Tân

      // Đinh/Nhâm -> Nhâm Dần
      expect(getCanChiMonth(1, 2027)).toBe("Nhâm Dần"); // 2027: Đinh
      expect(getCanChiMonth(1, 2032)).toBe("Nhâm Dần"); // 2032: Nhâm

      // Mậu/Quý -> Giáp Dần
      expect(getCanChiMonth(1, 2028)).toBe("Giáp Dần"); // 2028: Mậu
      expect(getCanChiMonth(1, 2033)).toBe("Giáp Dần"); // 2033: Quý
    });
  });

  describe("Can Chi of Day", () => {
    it("should calculate Can Chi of known days accurately", () => {
      // 2024-02-10 (Mùng 1 Tết Giáp Thìn) -> Giáp Thìn
      const canChiDay = getCanChiDay(10, 2, 2024);
      expect(canChiDay).toBe("Giáp Thìn");
    });

    it("should follow consecutive sequence for consecutive solar days", () => {
      // 2024-02-10 is Giáp Thìn -> next day 2024-02-11 is Ất Tỵ
      expect(getCanChiDay(11, 2, 2024)).toBe("Ất Tỵ");
      // 2024-02-12 is Bính Ngọ
      expect(getCanChiDay(12, 2, 2024)).toBe("Bính Ngọ");
    });
  });

  describe("Can Chi of Hour (Ngũ Thử Độn)", () => {
    it("should calculate hour Can Chi correctly for Giáp day (dayCanIndex = 0)", () => {
      // Giáp Kỷ hoàn gia Giáp -> hour Tý is Giáp Tý
      expect(getCanChiHour(0, 0)).toBe("Giáp Tý");
      expect(getCanChiHour(23, 0)).toBe("Giáp Tý"); // 23:00 is also Tý
      expect(getCanChiHour(1, 0)).toBe("Ất Sửu");
      expect(getCanChiHour(2, 0)).toBe("Ất Sửu");
      expect(getCanChiHour(3, 0)).toBe("Bính Dần");
      expect(getCanChiHour(12, 0)).toBe("Canh Ngọ");
    });

    it("should calculate hour Can Chi across day Can index pairings", () => {
      // Ất day (dayCanIndex = 1) -> Tý is Bính Tý
      expect(getCanChiHour(0, 1)).toBe("Bính Tý");
      // Bính day (dayCanIndex = 2) -> Tý is Mậu Tý
      expect(getCanChiHour(0, 2)).toBe("Mậu Tý");
      // Đinh day (dayCanIndex = 3) -> Tý is Canh Tý
      expect(getCanChiHour(0, 3)).toBe("Canh Tý");
      // Mậu day (dayCanIndex = 4) -> Tý is Nhâm Tý
      expect(getCanChiHour(0, 4)).toBe("Nhâm Tý");
    });
  });

  describe("getFullCanChi", () => {
    it("should return full CanChiInfo structure with all components", () => {
      const lunarDate: LunarDate = {
        day: 1,
        month: 1,
        year: 2024,
        isLeap: false,
      };
      // 2024-02-10 at 9:30 AM (hour = 9 -> Tỵ hour)
      const full = getFullCanChi(10, 2, 2024, lunarDate, 9);
      expect(full.yearCanChi).toBe("Giáp Thìn");
      expect(full.monthCanChi).toBe("Bính Dần");
      expect(full.dayCanChi).toBe("Giáp Thìn");
      // Day is Giáp (0), Hour 9 is Tỵ (5) -> (0*2 + 5) = 5 (Kỷ) -> Kỷ Tỵ
      expect(full.hourCanChi).toBe("Kỷ Tỵ");
    });
  });

  describe("24 Tiết Khí", () => {
    it("should determine solar term (Tiết khí) for Equinox / Solstice", () => {
      // ~21/03 is Xuân phân
      const tietKhiXuanPhan = getTietKhi(21, 3, 2024);
      expect(tietKhiXuanPhan).toBe("Xuân phân");

      // ~22/06 is Hạ chí (Sun longitude crosses 90° on 21/06 afternoon, so at midnight on 22/06 it is firmly Hạ chí)
      const tietKhiHaChi = getTietKhi(22, 6, 2024);
      expect(tietKhiHaChi).toBe("Hạ chí");

      // ~23/09 is Thu phân
      const tietKhiThuPhan = getTietKhi(23, 9, 2024);
      expect(tietKhiThuPhan).toBe("Thu phân");

      // ~22/12 is Đông chí
      const tietKhiDongChi = getTietKhi(22, 12, 2024);
      expect(tietKhiDongChi).toBe("Đông chí");
    });

    it("should return a valid solar term for any date", () => {
      const term = getTietKhi(13, 9, 2026);
      expect(typeof term).toBe("string");
      expect(term.length).toBeGreaterThan(0);
    });
  });
});
