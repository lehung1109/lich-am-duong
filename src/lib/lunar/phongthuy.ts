import { DayFengShui } from "./types";
import { jdFromDate } from "./astronomical";
import { getTietKhi } from "./tietkhi";

// 12 Chi hours name & intervals
export const HOUR_NAMES = [
  "Tý (23:00 - 01:00)", "Sửu (01:00 - 03:00)", "Dần (03:00 - 05:00)",
  "Mão (05:00 - 07:00)", "Thìn (07:00 - 09:00)", "Tỵ (09:00 - 11:00)",
  "Ngọ (11:00 - 13:00)", "Mùi (13:00 - 15:00)", "Thân (15:00 - 17:00)",
  "Dậu (17:00 - 19:00)", "Tuất (19:00 - 21:00)", "Hợi (21:00 - 23:00)"
] as const;

// Hoàng đạo patterns based on day Chi (0: Tý, 1: Sửu, ..., 11: Hợi)
// 1: Hoàng Đạo, 0: Hắc Đạo
export const HOANG_DAO_PATTERNS: Record<number, number[]> = {
  0: [1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0], // Tý, Ngọ
  6: [1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0],
  1: [0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1], // Sửu, Mùi
  7: [0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1],
  2: [1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0], // Dần, Thân
  8: [1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0],
  3: [0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1], // Mão, Dậu
  9: [0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1],
  4: [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1], // Thìn, Tuất
  10: [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1],
  5: [0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1], // Tỵ, Hợi
  11: [0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1]
};

// 12 Trực
export const TRUC_NAMES = [
  "Kiến (Tốt)", "Trừ (Bình)", "Mãn (Tốt)", "Bình (Tốt)", "Định (Tốt)", "Chấp (Bình)",
  "Phá (Xấu)", "Nguy (Xấu)", "Thành (Tốt)", "Thâu (Tốt)", "Khai (Tốt)", "Bế (Xấu)"
] as const;

// 28 Sao (Nhị thập bát tú)
export const SAO_NAMES: { name: string; status: "Cát" | "Hung" | "Bình" }[] = [
  { name: "Giác Mộc Giảo", status: "Cát" },
  { name: "Cang Kim Long", status: "Hung" },
  { name: "Đê Thổ Lạc", status: "Hung" },
  { name: "Phòng Nhật Thố", status: "Cát" },
  { name: "Tâm Nguyệt Hồ", status: "Hung" },
  { name: "Vĩ Hỏa Hổ", status: "Cát" },
  { name: "Cơ Thủy Báo", status: "Cát" },
  { name: "Đẩu Mộc Giải", status: "Cát" },
  { name: "Ngưu Kim Ngưu", status: "Hung" },
  { name: "Nữ Thổ Bức", status: "Hung" },
  { name: "Hư Nhật Thử", status: "Hung" },
  { name: "Nguy Nguyệt Yến", status: "Hung" },
  { name: "Thất Hỏa Trư", status: "Cát" },
  { name: "Bích Thủy Du", status: "Cát" },
  { name: "Khuê Mộc Lang", status: "Hung" },
  { name: "Lâu Kim Cẩu", status: "Cát" },
  { name: "Vị Thổ Trĩ", status: "Cát" },
  { name: "Mão Nhật Kê", status: "Hung" },
  { name: "Tất Nguyệt Ô", status: "Cát" },
  { name: "Chủy Hỏa Hầu", status: "Hung" },
  { name: "Sâm Thủy Viên", status: "Cát" },
  { name: "Tỉnh Mộc Hãn", status: "Cát" },
  { name: "Quỷ Kim Dương", status: "Hung" },
  { name: "Liễu Thổ Chướng", status: "Hung" },
  { name: "Tinh Nhật Mã", status: "Hung" },
  { name: "Trương Nguyệt Lộc", status: "Cát" },
  { name: "Dực Hỏa Xà", status: "Hung" },
  { name: "Chẩn Thủy Dẫn", status: "Cát" }
];

// Direction mapping based on Day Can (0: Giáp, 1: Ất, ..., 9: Quý)
export const HY_THAN_DIRECTIONS = [
  "Đông Bắc", "Tây Bắc", "Tây Nam", "Chính Nam", "Đông Nam",
  "Đông Bắc", "Tây Bắc", "Tây Nam", "Chính Nam", "Đông Nam"
] as const;

export const TAI_THAN_DIRECTIONS = [
  "Đông Nam", "Đông Nam", "Chính Đông", "Chính Đông", "Chính Bắc",
  "Chính Nam", "Tây Nam", "Tây Nam", "Chính Bắc", "Chính Nam"
] as const;

/**
 * Calculates complete Feng Shui (Vạn Niên) information for a solar date and lunar month.
 * @param dd Day of solar month
 * @param mm Solar month [1, 12]
 * @param yy Solar year
 * @param lunarMonth Lunar month [1, 12]
 */
export function getDayFengShui(dd: number, mm: number, yy: number, lunarMonth: number): DayFengShui {
  const jd = jdFromDate(dd, mm, yy);
  const dayChiIndex = ((jd + 1) % 12 + 12) % 12;
  const dayCanIndex = ((jd + 9) % 10 + 10) % 10;

  const pattern = HOANG_DAO_PATTERNS[dayChiIndex] || HOANG_DAO_PATTERNS[0];
  const hoangDaoHours: string[] = [];
  const hacDaoHours: string[] = [];

  for (let i = 0; i < 12; i++) {
    if (pattern[i] === 1) {
      hoangDaoHours.push(HOUR_NAMES[i]);
    } else {
      hacDaoHours.push(HOUR_NAMES[i]);
    }
  }

  // Calculate Trực: Month Chi starts from Dần (2) for lunar month 1
  const monthChiIndex = ((lunarMonth + 1) % 12 + 12) % 12;
  const trucIndex = ((dayChiIndex - monthChiIndex) % 12 + 12) % 12;
  const truc = TRUC_NAMES[trucIndex];

  // 28 Sao cycle: constant modulo against Julian Day
  const saoIndex = ((jd + 16) % 28 + 28) % 28;
  const saoInfo = SAO_NAMES[saoIndex];

  return {
    hoangDaoHours,
    hacDaoHours,
    tietKhi: getTietKhi(dd, mm, yy),
    truc,
    sao: saoInfo.name,
    saoStatus: saoInfo.status,
    huongXuatHanh: {
      hyThan: HY_THAN_DIRECTIONS[dayCanIndex],
      taiThan: TAI_THAN_DIRECTIONS[dayCanIndex],
    },
  };
}
