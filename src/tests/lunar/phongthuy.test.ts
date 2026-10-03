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
    // 2024-02-10 is Saturday -> must be Đê Thổ Lạc (index 2)
    expect(fs.sao).toBe("Đê Thổ Lạc");
    expect(fs.saoStatus).toBe("Hung");
    expect(["Cát", "Hung", "Bình"]).toContain(fs.saoStatus);
  });

  it("should provide correct tietKhi", () => {
    const fs = getDayFengShui(10, 2, 2024, 1);
    expect(fs.tietKhi).toBeDefined();
    expect(typeof fs.tietKhi).toBe("string");
    expect(fs.tietKhi.length).toBeGreaterThan(0);
  });

  it("should calculate correct hours for different day Chi according to classical rules", () => {
    // 6/2/2024 is Canh Tý (day Chi index 0 -> Tý)
    // Tý/Ngọ day auspicious hours: Tý, Sửu, Mão, Ngọ, Thân, Dậu
    const fsTy = getDayFengShui(6, 2, 2024, 12);
    expect(fsTy.hoangDaoHours).toHaveLength(6);
    expect(fsTy.hacDaoHours).toHaveLength(6);
    expect(fsTy.hoangDaoHours).toContain("Tý (23:00 - 01:00)");
    expect(fsTy.hoangDaoHours).toContain("Sửu (01:00 - 03:00)");
    expect(fsTy.hoangDaoHours).toContain("Mão (05:00 - 07:00)");
    expect(fsTy.hoangDaoHours).toContain("Ngọ (11:00 - 13:00)");
    expect(fsTy.hoangDaoHours).toContain("Thân (15:00 - 17:00)");
    expect(fsTy.hoangDaoHours).toContain("Dậu (17:00 - 19:00)");

    // 8/2/2024 is Nhâm Dần (day Chi index 2 -> Dần)
    // Dần/Thân day rhyme: "Đi Đứng Bình Yên Đến Đâu Cũng Được Người Quen Đón Chào"
    // Auspicious ('Đ'): Tý (Đi), Sửu (Đứng), Thìn (Đến), Tỵ (Đâu), Mùi (Được), Tuất (Đón)
    const fsDan = getDayFengShui(8, 2, 2024, 12);
    expect(fsDan.hoangDaoHours).toEqual([
      "Tý (23:00 - 01:00)",
      "Sửu (01:00 - 03:00)",
      "Thìn (07:00 - 09:00)",
      "Tỵ (09:00 - 11:00)",
      "Mùi (13:00 - 15:00)",
      "Tuất (19:00 - 21:00)",
    ]);

    // 9/2/2024 is Quý Mão (day Chi index 3 -> Mão)
    // Mão/Dậu day rhyme: "Đến Cửa Động Đào Có Tiên Đưa Đón Qua Đèo Thiên Thai"
    // Auspicious ('Đ'): Tý (Đến), Dần (Động), Mão (Đào), Ngọ (Đưa), Mùi (Đón), Dậu (Đèo)
    const fsMao = getDayFengShui(9, 2, 2024, 12);
    expect(fsMao.hoangDaoHours).toEqual([
      "Tý (23:00 - 01:00)",
      "Dần (03:00 - 05:00)",
      "Mão (05:00 - 07:00)",
      "Ngọ (11:00 - 13:00)",
      "Mùi (13:00 - 15:00)",
      "Dậu (17:00 - 19:00)",
    ]);
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

  it("should synchronize 28 Sao with Day of Week (Thất Diệu)", () => {
    // Check across 28 days of February 2024:
    // Sundays (CN) must contain "Nhật" (Phòng, Hư, Mão, Tinh)
    // Saturdays (T7) must contain "Thổ" (Đê, Nữ, Vị, Liễu)
    for (let d = 1; d <= 28; d++) {
      const fs = getDayFengShui(d, 2, 2024, 1);
      const dow = new Date(2024, 1, d).getDay(); // 0: Sunday, 6: Saturday
      if (dow === 0) {
        expect(fs.sao).toMatch(/Nhật/);
      } else if (dow === 6) {
        expect(fs.sao).toMatch(/Thổ/);
      } else if (dow === 1) {
        expect(fs.sao).toMatch(/Nguyệt/);
      } else if (dow === 2) {
        expect(fs.sao).toMatch(/Hỏa/);
      } else if (dow === 3) {
        expect(fs.sao).toMatch(/Thủy/);
      } else if (dow === 4) {
        expect(fs.sao).toMatch(/Mộc/);
      } else if (dow === 5) {
        expect(fs.sao).toMatch(/Kim/);
      }
    }
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
