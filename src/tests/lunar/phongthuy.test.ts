import { describe, it, expect } from "vitest";
import {
  getDayFengShui,
  HOUR_NAMES,
  HOANG_DAO_PATTERNS,
  TRUC_NAMES,
  SAO_NAMES,
  HY_THAN_DIRECTIONS,
  TAI_THAN_DIRECTIONS
} from "@/lib/lunar/phongthuy";

describe("Feng Shui & Lịch Vạn Niên", () => {
  it("should return exactly 6 Hoàng Đạo and 6 Hắc Đạo hours", () => {
    const fs = getDayFengShui(10, 2, 2024, 1);
    expect(fs.hoangDaoHours).toHaveLength(6);
    expect(fs.hacDaoHours).toHaveLength(6);
    // Check no duplicates and union is all 12 hours
    const allHours = [...fs.hoangDaoHours, ...fs.hacDaoHours];
    expect(new Set(allHours).size).toBe(12);
  });

  it("should determine Hỷ Thần and Tài Thần directions based on Day Can", () => {
    const fs = getDayFengShui(10, 2, 2024, 1); // Giáp Thìn -> Can Giáp (index 0)
    expect(fs.huongXuatHanh.hyThan).toBe("Đông Bắc");
    expect(fs.huongXuatHanh.taiThan).toBe("Đông Nam");
  });

  it("should assign Thập nhị trực and Nhị thập bát tú with valid status", () => {
    const fs = getDayFengShui(10, 2, 2024, 1);
    expect(fs.truc).toBe("Mãn (Tốt)");
    expect(fs.sao).toBe("Đẩu Mộc Giải");
    expect(fs.saoStatus).toBe("Cát");
    expect(["Cát", "Hung", "Bình"]).toContain(fs.saoStatus);
  });

  it("should provide correct tietKhi", () => {
    const fs = getDayFengShui(10, 2, 2024, 1);
    expect(fs.tietKhi).toBeDefined();
    expect(typeof fs.tietKhi).toBe("string");
    expect(fs.tietKhi.length).toBeGreaterThan(0);
  });

  it("should calculate correct hours for different day Chi", () => {
    // 6/2/2024 is Canh Tý (day Chi index 0 -> Tý)
    const fs = getDayFengShui(6, 2, 2024, 12);
    expect(fs.hoangDaoHours).toHaveLength(6);
    expect(fs.hacDaoHours).toHaveLength(6);
    expect(fs.hoangDaoHours).toContain("Tý (23:00 - 01:00)");
    expect(fs.hoangDaoHours).toContain("Sửu (01:00 - 03:00)");
  });

  it("should maintain 6 Hoang Dao and 6 Hac Dao hours for every day in a 12-day sequence", () => {
    // Testing 12 consecutive days to cover all 12 Day Chi
    for (let day = 1; day <= 12; day++) {
      const fs = getDayFengShui(day, 3, 2024, 2);
      expect(fs.hoangDaoHours).toHaveLength(6);
      expect(fs.hacDaoHours).toHaveLength(6);
      const union = new Set([...fs.hoangDaoHours, ...fs.hacDaoHours]);
      expect(union.size).toBe(12);
    }
  });

  it("should cover all 12 Trực correctly across months", () => {
    // Lunar month 1 has Chi Dần (index 2).
    // A day with Chi Dần should have Trực Kiến.
    // Let's test a sequence of 12 days to verify all 12 Trực appear.
    const trucsFound = new Set<string>();
    for (let d = 1; d <= 12; d++) {
      const fs = getDayFengShui(d, 5, 2024, 4);
      trucsFound.add(fs.truc);
    }
    expect(trucsFound.size).toBe(12);
  });

  it("should cover all 28 Sao across 28 consecutive days", () => {
    const saoFound = new Set<string>();
    for (let d = 1; d <= 28; d++) {
      const fs = getDayFengShui(d, 1, 2024, 11);
      saoFound.add(fs.sao);
      expect(["Cát", "Hung", "Bình"]).toContain(fs.saoStatus);
    }
    expect(saoFound.size).toBe(28);
  });

  it("should verify constants integrity", () => {
    expect(HOUR_NAMES).toHaveLength(12);
    expect(Object.keys(HOANG_DAO_PATTERNS)).toHaveLength(12);
    expect(TRUC_NAMES).toHaveLength(12);
    expect(SAO_NAMES).toHaveLength(28);
    expect(HY_THAN_DIRECTIONS).toHaveLength(10);
    expect(TAI_THAN_DIRECTIONS).toHaveLength(10);
  });
});
