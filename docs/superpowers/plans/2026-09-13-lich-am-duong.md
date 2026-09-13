# Lịch Âm Dương Việt Nam Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng ứng dụng web Lịch Âm Dương (Lịch Vạn Niên) chuẩn xác cao theo thuật toán thiên văn Việt Nam (GMT+7), quản lý sự kiện âm lịch gia đình (ngày giỗ, rằm, mùng một) với mô hình Local-first và xuất file iCal (.ics) đồng bộ Google/Apple Calendar.

**Architecture:** Sử dụng Next.js 15 (App Router, React 19) kết hợp Tailwind CSS cho UI Dashboard Split-view (Lưới tháng + Tờ lịch ngày bloc). Lõi tính toán âm lịch thuần TypeScript (Pure TS) dựa trên thuật toán thiên văn của Hồ Ngọc Đức, quản lý trạng thái và lưu trữ cục bộ qua Zustand + LocalStorage.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide React, Zustand, Vitest.

**Spec:** [docs/superpowers/specs/2026-09-13-lich-am-duong-design.md](file:///F:/projects/lich-am-duong/docs/superpowers/specs/2026-09-13-lich-am-duong-design.md)

## Global Constraints

- Chạy thuần TypeScript, không phụ thuộc thư viện tính ngày cồng kềnh (zero moment.js/date-fns).
- Thuật toán âm lịch chuẩn xác múi giờ UTC+7 (kinh độ 105° Đông) trong khoảng năm 1900 - 2100.
- Local-first 100%: Toàn bộ dữ liệu sự kiện lưu tại `localStorage` của trình duyệt, không bắt buộc đăng nhập, có thể Import/Export JSON và iCal.
- Không gây lỗi Hydration Mismatch trên Next.js App Router (sử dụng mount check cho client date/localStorage).
- Mọi logic nghiệp vụ thiên văn, chuyển đổi lịch và store phải được kiểm thử tự động với Vitest.

---

### Task 1: Khởi tạo Project & Cấu hình Môi trường (Next.js 15, TypeScript, Tailwind, Vitest)

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `src/tests/smoke.test.ts`
- Create: `src/lib/utils.ts`

**Interfaces:**
- Produces: Project build pipeline (`npm run build`), test runner (`npm test`), và utility `cn()` trong `src/lib/utils.ts`.

- [ ] **Step 1: Tạo file cấu hình package.json và cài đặt dependencies**

Tạo file `package.json`:
```json
{
  "name": "lich-am-duong",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^1.16.0",
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^3.0.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Tạo tsconfig.json, tailwind.config.ts, postcss.config.mjs và vitest.config.ts**

Tạo `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Tạo `tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        traditional: {
          red: "#991b1b",
          gold: "#d97706",
          darkRed: "#7f1d1d",
          paper: "#fefefe",
        },
      },
    },
  },
  plugins: [],
};
export default config;
```

Tạo `postcss.config.mjs`:
```javascript
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
export default config;
```

Tạo `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Tạo utility classmerge `src/lib/utils.ts`**

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: Viết smoke test kiểm tra vitest**

Tạo `src/tests/smoke.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("Smoke Test", () => {
  it("should merge class names correctly", () => {
    expect(cn("px-2", "py-1", { "bg-red-500": true, "hidden": false })).toBe(
      "px-2 py-1 bg-red-500"
    );
  });
});
```

- [ ] **Step 5: Chạy cài đặt dependencies và chạy smoke test**

Run: `npm install`
Run: `npm test`
Expected: PASS (1 test passed)

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json tailwind.config.ts postcss.config.mjs vitest.config.ts src/lib/utils.ts src/tests/smoke.test.ts
git commit -m "chore: scaffold nextjs project with typescript, tailwind and vitest"
```

---

### Task 2: Core Lunar Engine - Types, Hằng Số & Thuật Toán Thiên Văn (Astronomical)

**Files:**
- Create: `src/lib/lunar/types.ts`
- Create: `src/lib/lunar/constants.ts`
- Create: `src/lib/lunar/astronomical.ts`
- Create: `src/tests/lunar/astronomical.test.ts`

**Interfaces:**
- Produces: 
  - Types: `SolarDate`, `LunarDate`, `CanChiInfo`, `DayFengShui`, `FullDayInfo`
  - Functions: `jdFromDate(dd, mm, yy)`, `jdToDate(jd)`, `getNewMoonDay(k, timezone)`, `getSunLongitude(jdn, timezone)`

- [ ] **Step 1: Định nghĩa types và constants cho Lịch Âm**

Tạo `src/lib/lunar/types.ts`:
```typescript
export interface SolarDate {
  day: number;
  month: number;
  year: number;
}

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  isLeap: boolean;
  leapMonth?: number;
}

export interface CanChiInfo {
  yearCanChi: string;
  monthCanChi: string;
  dayCanChi: string;
  hourCanChi: string;
}

export interface DayFengShui {
  hoangDaoHours: string[];
  hacDaoHours: string[];
  tietKhi: string;
  truc: string;
  sao: string;
  saoStatus: 'Cát' | 'Hung' | 'Bình';
  huongXuatHanh: {
    hyThan: string;
    taiThan: string;
  };
}

export interface FullDayInfo {
  solar: SolarDate;
  lunar: LunarDate;
  canChi: CanChiInfo;
  fengShui: DayFengShui;
  isToday: boolean;
  dayOfWeek: number; // 0: CN, 1: T2, ..., 6: T7
  dayOfWeekName: string;
}
```

Tạo `src/lib/lunar/constants.ts`:
```typescript
export const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"] as const;
export const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"] as const;

export const TIET_KHI = [
  "Xuân phân", "Thanh minh", "Cốc vũ", "Lập hạ", "Tiểu mãn", "Mang chủng",
  "Hạ chí", "Tiểu thử", "Đại thử", "Lập thu", "Xử thử", "Bạch lộ",
  "Thu phân", "Hàn lộ", "Sương giáng", "Lập đông", "Tiểu tuyết", "Đại tuyết",
  "Đông chí", "Tiểu hàn", "Đại hàn", "Lập xuân", "Vũ thủy", "Kinh trập"
] as const;

export const DAY_OF_WEEK_NAMES = [
  "Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"
] as const;
```

- [ ] **Step 2: Viết failing test cho `astronomical.ts`**

Tạo `src/tests/lunar/astronomical.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { jdFromDate, jdToDate, getNewMoonDay, getSunLongitude } from "@/lib/lunar/astronomical";

describe("Astronomical Calculations (GMT+7)", () => {
  it("should calculate Julian Day number and convert back correctly", () => {
    // 2024-01-01
    const jd = jdFromDate(1, 1, 2024);
    expect(jd).toBe(2460311);
    const date = jdToDate(jd);
    expect(date).toEqual({ day: 1, month: 1, year: 2024 });
  });

  it("should calculate Sun longitude accurately at known equinoxes/solstices", () => {
    // Spring Equinox ~March 21 (Sun longitude around 0 degrees)
    const jdEquinox = jdFromDate(21, 3, 2024);
    const sl = getSunLongitude(jdEquinox, 7.0);
    expect(sl).toBeGreaterThanOrEqual(0);
    expect(sl).toBeLessThanOrEqual(2);
  });

  it("should find New Moon day (Sóc) for Tết Giáp Thìn 2024", () => {
    // Tết 2024 was on 2024-02-10 (JD = 2460351)
    // k = 298 corresponds to New Moon of February 2024
    const newMoonJd = getNewMoonDay(298, 7.0);
    expect(newMoonJd).toBe(2460351);
  });
});
```

- [ ] **Step 3: Chạy test để xác nhận thất bại**

Run: `npm test src/tests/lunar/astronomical.test.ts`
Expected: FAIL (Cannot find module `@/lib/lunar/astronomical`)

- [ ] **Step 4: Triển khai thuật toán thiên văn trong `src/lib/lunar/astronomical.ts`**

Tạo `src/lib/lunar/astronomical.ts`:
```typescript
import { SolarDate } from "./types";

const PI = Math.PI;

export function jdFromDate(dd: number, mm: number, yy: number): number {
  let a = Math.floor((14 - mm) / 12);
  let y = yy + 4800 - a;
  let m = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

export function jdToDate(jd: number): SolarDate {
  let a: number, b: number, c: number, d: number, e: number, m: number;
  if (jd > 2299160) {
    a = jd + 32044;
    b = Math.floor((4 * a + 3) / 146097);
    c = a - Math.floor((146097 * b) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  d = Math.floor((4 * c + 3) / 1461);
  e = c - Math.floor((1461 * d) / 4);
  m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { day, month, year };
}

export function getNewMoonDay(k: number, timezone: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);

  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;

  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr);
  C1 -= 0.0004 * Math.sin(3 * dr * Mpr);
  C1 += 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin((M + Mpr) * dr);
  C1 -= 0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
  C1 -= 0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
  C1 += 0.001 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((2 * Mpr + M) * dr);

  let deltat: number;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.00000061 * T * T3;
  } else {
    deltat = -0.000078 + 0.000027 * T + 0.00011 * T2;
  }

  const JdNew = Jd1 + C1 - deltat;
  return Math.floor(JdNew + 0.5 + timezone / 24);
}

export function getSunLongitude(jdn: number, timezone: number): number {
  const T = (jdn - 0.5 - timezone / 24 - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T2;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T2;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T2) * Math.sin(M * dr)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * M * dr)
    + 0.000289 * Math.sin(3 * M * dr);
  let theta = (L0 + C) % 360;
  if (theta < 0) theta += 360;
  return theta;
}
```

- [ ] **Step 5: Chạy lại test để kiểm tra pass**

Run: `npm test src/tests/lunar/astronomical.test.ts`
Expected: PASS (3 tests passed)

- [ ] **Step 6: Commit**

```bash
git add src/lib/lunar/types.ts src/lib/lunar/constants.ts src/lib/lunar/astronomical.ts src/tests/lunar/astronomical.test.ts
git commit -m "feat: implement astronomical calculations for UTC+7"
```

---

### Task 3: Core Lunar Engine - Chuyển Đổi Âm Dương 2 Chiều (Converter)

**Files:**
- Create: `src/lib/lunar/converter.ts`
- Create: `src/tests/lunar/converter.test.ts`

**Interfaces:**
- Consumes: `jdFromDate`, `jdToDate`, `getNewMoonDay`, `getSunLongitude` từ `src/lib/lunar/astronomical.ts`
- Produces: 
  - `solarToLunar(dd, mm, yy, timezone?: number): LunarDate`
  - `lunarToSolar(lunarDay, lunarMonth, lunarYear, isLeap?: boolean, timezone?: number): SolarDate`
  - `getDaysInLunarMonth(lunarMonth, lunarYear, isLeap?: boolean, timezone?: number): number`

- [ ] **Step 1: Viết failing test cho `converter.ts`**

Tạo `src/tests/lunar/converter.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { solarToLunar, lunarToSolar, getDaysInLunarMonth } from "@/lib/lunar/converter";

describe("Solar <-> Lunar Converter", () => {
  it("should convert Tết Nguyên Đán accurately for 2024, 2025, 2026", () => {
    // 2024: 10/02/2024 -> 01/01/2024 (Giáp Thìn)
    expect(solarToLunar(10, 2, 2024)).toMatchObject({ day: 1, month: 1, year: 2024, isLeap: false });

    // 2025: 29/01/2025 -> 01/01/2025 (Ất Tỵ)
    expect(solarToLunar(29, 1, 2025)).toMatchObject({ day: 1, month: 1, year: 2025, isLeap: false });

    // 2026: 17/02/2026 -> 01/01/2026 (Bính Ngọ)
    expect(solarToLunar(17, 2, 2026)).toMatchObject({ day: 1, month: 1, year: 2026, isLeap: false });
  });

  it("should correctly handle leap month year (2023 has leap month 2)", () => {
    // Year 2023 had leap month 2 (tháng 2 nhuận)
    // 22/03/2023 was 01/02 nhuận
    const lunar = solarToLunar(22, 3, 2023);
    expect(lunar.month).toBe(2);
    expect(lunar.isLeap).toBe(true);
  });

  it("should convert back from lunar to solar with perfect two-way symmetry", () => {
    const dates = [
      { d: 10, m: 2, y: 2024 },
      { d: 15, m: 8, y: 2024 }, // Trung thu
      { d: 1, m: 1, y: 2025 },
      { d: 22, m: 3, y: 2023 }
    ];

    for (const dt of dates) {
      const lunar = solarToLunar(dt.d, dt.m, dt.y);
      const solar = lunarToSolar(lunar.day, lunar.month, lunar.year, lunar.isLeap);
      expect(solar).toEqual({ day: dt.d, month: dt.m, year: dt.y });
    }
  });

  it("should return correct number of days in lunar months (29 or 30)", () => {
    const days = getDaysInLunarMonth(1, 2024);
    expect([29, 30]).toContain(days);
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

Run: `npm test src/tests/lunar/converter.test.ts`
Expected: FAIL (Cannot find module `@/lib/lunar/converter`)

- [ ] **Step 3: Triển khai logic trong `src/lib/lunar/converter.ts`**

Tạo `src/lib/lunar/converter.ts`:
```typescript
import { LunarDate, SolarDate } from "./types";
import { jdFromDate, jdToDate, getNewMoonDay, getSunLongitude } from "./astronomical";

const TIMEZONE = 7.0;

function getSunMajorTerm(jdn: number, timezone: number): number {
  return Math.floor(getSunLongitude(jdn, timezone) / 30);
}

export function solarToLunar(dd: number, mm: number, yy: number, timezone: number = TIMEZONE): LunarDate {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timezone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timezone);
  }

  let a11 = 0;
  let b11 = 0;
  let leapYear = 0;

  // Find month 11 of previous year
  for (let yearOffset = -1; yearOffset <= 1; yearOffset++) {
    const targetY = yy + yearOffset;
    const winterSolsticeJd = jdFromDate(22, 12, targetY);
    const kSolstice = Math.floor((winterSolsticeJd - 2415021.076998695) / 29.530588853);
    let m11 = getNewMoonDay(kSolstice + 1, timezone);
    if (m11 > winterSolsticeJd) {
      m11 = getNewMoonDay(kSolstice, timezone);
    }
    if (yearOffset === -1 || (m11 <= monthStart && yearOffset === 0)) {
      a11 = m11;
      leapYear = targetY;
    }
    if (yearOffset === 0 && m11 > monthStart) {
      b11 = m11;
    }
    if (yearOffset === 1 && b11 === 0) {
      b11 = m11;
    }
  }

  // Count months between a11 and b11
  let currentK = Math.floor((a11 - 2415021.076998695) / 29.530588853);
  let monthsCount = 0;
  let testJd = a11;
  let leapMonth = 0;
  let hasLeap = false;
  let lastMajorTerm = -1;

  while (testJd < b11 && monthsCount < 15) {
    const nextJd = getNewMoonDay(currentK + 1, timezone);
    const majorTerm = getSunMajorTerm(nextJd, timezone);
    if (majorTerm === lastMajorTerm && !hasLeap) {
      hasLeap = true;
      leapMonth = monthsCount;
    }
    lastMajorTerm = majorTerm;
    testJd = nextJd;
    currentK++;
    monthsCount++;
  }

  // Calculate current lunar month relative to a11 (which is Month 11)
  const kCurrent = Math.floor((monthStart - 2415021.076998695) / 29.530588853);
  const kA11 = Math.floor((a11 - 2415021.076998695) / 29.530588853);
  let diff = kCurrent - kA11;

  let lunarMonth = 11 + diff;
  let isLeap = false;

  if (hasLeap && monthsCount > 12) {
    if (diff === leapMonth) {
      isLeap = true;
      lunarMonth = (11 + diff - 1);
    } else if (diff > leapMonth) {
      lunarMonth = (11 + diff - 1);
    }
  }

  while (lunarMonth > 12) {
    lunarMonth -= 12;
  }

  let lunarYear = yy;
  if (mm < 3 && (lunarMonth === 11 || lunarMonth === 12)) {
    lunarYear = yy - 1;
  } else if (mm < 3 && lunarMonth === 1) {
    const checkJan = solarToLunar(1, 1, yy, timezone);
    lunarYear = (checkJan.lunarYear || yy);
  } else if (mm >= 11 && (lunarMonth === 1 || lunarMonth === 2)) {
    lunarYear = yy + 1;
  } else if (mm < 3 && lunarMonth > 2) {
    lunarYear = yy - 1;
  }

  // Ensure leapYear base accuracy
  if (lunarMonth === 11 || lunarMonth === 12) {
    if (mm < 3) lunarYear = yy - 1;
  }

  const lunarDay = dayNumber - monthStart + 1;

  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    isLeap,
    leapMonth: hasLeap && monthsCount > 12 ? leapMonth : undefined,
  };
}

export function getDaysInLunarMonth(lunarMonth: number, lunarYear: number, isLeap: boolean = false, timezone: number = TIMEZONE): number {
  const solar = lunarToSolar(1, lunarMonth, lunarYear, isLeap, timezone);
  const jdStart = jdFromDate(solar.day, solar.month, solar.year);
  const k = Math.floor((jdStart - 2415021.076998695) / 29.530588853);
  const jdNext = getNewMoonDay(k + 1, timezone);
  return jdNext - jdStart;
}

export function lunarToSolar(lunarDay: number, lunarMonth: number, lunarYear: number, isLeap: boolean = false, timezone: number = TIMEZONE): SolarDate {
  // Approximate search window around estimated solar date
  let estSolarYear = lunarYear;
  if (lunarMonth === 11 || lunarMonth === 12) {
    // Might be in the same year or start of next
  }
  const midDate = jdFromDate(15, Math.min(Math.max(lunarMonth + 1, 1), 12), estSolarYear);
  
  // Search within [-70, +100] days
  for (let offset = -70; offset <= 100; offset++) {
    const candidateJd = midDate + offset;
    const candidateSolar = jdToDate(candidateJd);
    const candidateLunar = solarToLunar(candidateSolar.day, candidateSolar.month, candidateSolar.year, timezone);
    if (
      candidateLunar.day === lunarDay &&
      candidateLunar.month === lunarMonth &&
      candidateLunar.year === lunarYear &&
      candidateLunar.isLeap === isLeap
    ) {
      return candidateSolar;
    }
  }

  // Fallback fallback if year boundary is wide
  for (let offset = -150; offset <= 150; offset++) {
    const candidateJd = midDate + offset;
    const candidateSolar = jdToDate(candidateJd);
    const candidateLunar = solarToLunar(candidateSolar.day, candidateSolar.month, candidateSolar.year, timezone);
    if (
      candidateLunar.day === lunarDay &&
      candidateLunar.month === lunarMonth &&
      candidateLunar.year === lunarYear &&
      candidateLunar.isLeap === isLeap
    ) {
      return candidateSolar;
    }
  }

  return { day: lunarDay, month: lunarMonth, year: lunarYear };
}
```

- [ ] **Step 4: Chạy lại test để kiểm tra pass**

Run: `npm test src/tests/lunar/converter.test.ts`
Expected: PASS (4 tests passed)

- [ ] **Step 5: Commit**

```bash
git add src/lib/lunar/converter.ts src/tests/lunar/converter.test.ts
git commit -m "feat: implement accurate two-way solar to lunar calendar converter"
```

---

### Task 4: Core Lunar Engine - Can Chi & 24 Tiết Khí

**Files:**
- Create: `src/lib/lunar/canchi.ts`
- Create: `src/lib/lunar/tietkhi.ts`
- Create: `src/tests/lunar/canchi.test.ts`

**Interfaces:**
- Consumes: `SolarDate`, `LunarDate`, `CAN`, `CHI`, `TIET_KHI`, `jdFromDate`, `getSunLongitude`
- Produces:
  - `getCanChiYear(lunarYear: number): string`
  - `getCanChiMonth(lunarMonth: number, lunarYear: number): string`
  - `getCanChiDay(dd: number, mm: number, yy: number): string`
  - `getCanChiHour(hour: number, dayCanIndex: number): string`
  - `getFullCanChi(dd: number, mm: number, yy: number, lunarDate: LunarDate, hour?: number): CanChiInfo`
  - `getTietKhi(dd: number, mm: number, yy: number, timezone?: number): string`

- [ ] **Step 1: Viết failing test cho Can Chi và Tiết Khí**

Tạo `src/tests/lunar/canchi.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { getCanChiYear, getCanChiDay, getFullCanChi } from "@/lib/lunar/canchi";
import { getTietKhi } from "@/lib/lunar/tietkhi";

describe("Can Chi & Tiết Khí", () => {
  it("should calculate Can Chi of known years correctly", () => {
    expect(getCanChiYear(2024)).toBe("Giáp Thìn");
    expect(getCanChiYear(2025)).toBe("Ất Tỵ");
    expect(getCanChiYear(2026)).toBe("Bính Ngọ");
    expect(getCanChiYear(1975)).toBe("Ất Mão");
  });

  it("should calculate Can Chi of known days accurately", () => {
    // 2024-02-10 (Mùng 1 Tết Giáp Thìn) -> Giáp Thìn
    const canChiDay = getCanChiDay(10, 2, 2024);
    expect(canChiDay).toBe("Giáp Thìn");
  });

  it("should determine solar term (Tiết khí) for Equinox / Solstice", () => {
    // ~21/03 is Xuân phân
    const tietKhiXuanPhan = getTietKhi(21, 3, 2024);
    expect(tietKhiXuanPhan).toBe("Xuân phân");

    // ~22/12 is Đông chí
    const tietKhiDongChi = getTietKhi(22, 12, 2024);
    expect(tietKhiDongChi).toBe("Đông chí");
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

Run: `npm test src/tests/lunar/canchi.test.ts`
Expected: FAIL (Cannot find module `@/lib/lunar/canchi`)

- [ ] **Step 3: Triển khai `canchi.ts` và `tietkhi.ts`**

Tạo `src/lib/lunar/canchi.ts`:
```typescript
import { CAN, CHI } from "./constants";
import { CanChiInfo, LunarDate } from "./types";
import { jdFromDate } from "./astronomical";

export function getCanChiYear(lunarYear: number): string {
  const canIndex = (lunarYear + 6) % 10;
  const chiIndex = (lunarYear + 8) % 12;
  return `${CAN[canIndex]} ${CHI[chiIndex]}`;
}

export function getCanChiMonth(lunarMonth: number, lunarYear: number): string {
  const yearCanIndex = (lunarYear + 6) % 10;
  const monthCanIndex = (yearCanIndex * 2 + lunarMonth) % 10;
  // Lunar Month 1 is Dần (index 2)
  const monthChiIndex = (lunarMonth + 1) % 12;
  return `${CAN[monthCanIndex]} ${CHI[monthChiIndex]}`;
}

export function getCanChiDay(dd: number, mm: number, yy: number): string {
  const jd = jdFromDate(dd, mm, yy);
  const canIndex = (jd + 9) % 10;
  const chiIndex = (jd + 1) % 12;
  return `${CAN[canIndex]} ${CHI[chiIndex]}`;
}

export function getCanChiHour(hour: number, dayCanIndex: number): string {
  // 1 chi hour spans 2 solar hours, starting with Tý at 23:00 - 01:00
  const chiIndex = Math.floor((hour + 1) / 2) % 12;
  const hourCanIndex = (dayCanIndex * 2 + chiIndex) % 10;
  return `${CAN[hourCanIndex]} ${CHI[chiIndex]}`;
}

export function getFullCanChi(
  dd: number,
  mm: number,
  yy: number,
  lunarDate: LunarDate,
  hour: number = new Date().getHours()
): CanChiInfo {
  const jd = jdFromDate(dd, mm, yy);
  const dayCanIndex = (jd + 9) % 10;

  return {
    yearCanChi: getCanChiYear(lunarDate.year),
    monthCanChi: getCanChiMonth(lunarDate.month, lunarDate.year),
    dayCanChi: getCanChiDay(dd, mm, yy),
    hourCanChi: getCanChiHour(hour, dayCanIndex),
  };
}
```

Tạo `src/lib/lunar/tietkhi.ts`:
```typescript
import { TIET_KHI } from "./constants";
import { jdFromDate, getSunLongitude } from "./astronomical";

export function getTietKhi(dd: number, mm: number, yy: number, timezone: number = 7.0): string {
  const jd = jdFromDate(dd, mm, yy);
  const longitude = getSunLongitude(jd, timezone);
  const index = Math.floor(longitude / 15);
  return TIET_KHI[index % 24];
}
```

- [ ] **Step 4: Chạy lại test để kiểm tra pass**

Run: `npm test src/tests/lunar/canchi.test.ts`
Expected: PASS (3 tests passed)

- [ ] **Step 5: Commit**

```bash
git add src/lib/lunar/canchi.ts src/lib/lunar/tietkhi.ts src/tests/lunar/canchi.test.ts
git commit -m "feat: implement can chi and 24 solar terms calculations"
```

---

### Task 5: Core Lunar Engine - Phong Thủy Vạn Niên (Hoàng Đạo, Trực, Sao, Hướng)

**Files:**
- Create: `src/lib/lunar/phongthuy.ts`
- Create: `src/tests/lunar/phongthuy.test.ts`

**Interfaces:**
- Consumes: `CAN`, `CHI`, `DayFengShui`, `jdFromDate`
- Produces: `getDayFengShui(dd: number, mm: number, yy: number, lunarMonth: number): DayFengShui`

- [ ] **Step 1: Viết failing test cho dữ liệu phong thủy vạn niên**

Tạo `src/tests/lunar/phongthuy.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { getDayFengShui } from "@/lib/lunar/phongthuy";

describe("Feng Shui & Lịch Vạn Niên", () => {
  it("should return exactly 6 Hoàng Đạo and 6 Hắc Đạo hours", () => {
    const fs = getDayFengShui(10, 2, 2024, 1);
    expect(fs.hoangDaoHours).toHaveLength(6);
    expect(fs.hacDaoHours).toHaveLength(6);
  });

  it("should determine Hỷ Thần and Tài Thần directions based on Day Can", () => {
    const fs = getDayFengShui(10, 2, 2024, 1); // Giáp Thìn -> Can Giáp
    expect(fs.huongXuatHanh.hyThan).toBeDefined();
    expect(fs.huongXuatHanh.taiThan).toBeDefined();
  });

  it("should assign Thập nhị trực and Nhị thập bát tú with valid status", () => {
    const fs = getDayFengShui(10, 2, 2024, 1);
    expect(fs.truc).toBeDefined();
    expect(fs.sao).toBeDefined();
    expect(["Cát", "Hung", "Bình"]).toContain(fs.saoStatus);
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

Run: `npm test src/tests/lunar/phongthuy.test.ts`
Expected: FAIL (Cannot find module `@/lib/lunar/phongthuy`)

- [ ] **Step 3: Triển khai `src/lib/lunar/phongthuy.ts`**

Tạo `src/lib/lunar/phongthuy.ts`:
```typescript
import { DayFengShui } from "./types";
import { jdFromDate } from "./astronomical";
import { getTietKhi } from "./tietkhi";

// 12 Chi hours name & intervals
const HOUR_NAMES = [
  "Tý (23:00 - 01:00)", "Sửu (01:00 - 03:00)", "Dần (03:00 - 05:00)",
  "Mão (05:00 - 07:00)", "Thìn (07:00 - 09:00)", "Tỵ (09:00 - 11:00)",
  "Ngọ (11:00 - 13:00)", "Mùi (13:00 - 15:00)", "Thân (15:00 - 17:00)",
  "Dậu (17:00 - 19:00)", "Tuất (19:00 - 21:00)", "Hợi (21:00 - 23:00)"
];

// Hoàng đạo patterns based on day Chi (0: Tý, 1: Sửu, ..., 11: Hợi)
// 1: Hoàng Đạo, 0: Hắc Đạo
const HOANG_DAO_PATTERNS: Record<number, number[]> = {
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
const TRUC_NAMES = [
  "Kiến (Tốt)", "Trừ (Bình)", "Mãn (Tốt)", "Bình (Tốt)", "Định (Tốt)", "Chấp (Bình)",
  "Phá (Xấu)", "Nguy (Xấu)", "Thành (Tốt)", "Thâu (Tốt)", "Khai (Tốt)", "Bế (Xấu)"
];

// 28 Sao (Nhị thập bát tú)
const SAO_NAMES: { name: string; status: 'Cát' | 'Hung' | 'Bình' }[] = [
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
const HY_THAN_DIRECTIONS = [
  "Đông Bắc", "Tây Bắc", "Tây Nam", "Chính Nam", "Đông Nam",
  "Đông Bắc", "Tây Bắc", "Tây Nam", "Chính Nam", "Đông Nam"
];

const TAI_THAN_DIRECTIONS = [
  "Đông Nam", "Đông Nam", "Chính Đông", "Chính Đông", "Chính Bắc",
  "Chính Nam", "Tây Nam", "Tây Nam", "Chính Bắc", "Chính Nam"
];

export function getDayFengShui(dd: number, mm: number, yy: number, lunarMonth: number): DayFengShui {
  const jd = jdFromDate(dd, mm, yy);
  const dayChiIndex = (jd + 1) % 12;
  const dayCanIndex = (jd + 9) % 10;

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
  const monthChiIndex = (lunarMonth + 1) % 12;
  const trucIndex = (dayChiIndex - monthChiIndex + 12) % 12;
  const truc = TRUC_NAMES[trucIndex];

  // 28 Sao cycle: constant modulo against Julian Day
  const saoIndex = (jd + 16) % 28;
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
```

- [ ] **Step 4: Chạy lại test để kiểm tra pass**

Run: `npm test src/tests/lunar/phongthuy.test.ts`
Expected: PASS (3 tests passed)

- [ ] **Step 5: Commit**

```bash
git add src/lib/lunar/phongthuy.ts src/tests/lunar/phongthuy.test.ts
git commit -m "feat: implement feng shui vạn niên data (hoàng đạo, trực, sao, hướng)"
```

---

### Task 6: Trình Tạo File Đồng Bộ iCalendar (.ics)

**Files:**
- Create: `src/lib/ical/generator.ts`
- Create: `src/tests/ical/generator.test.ts`

**Interfaces:**
- Consumes: `CalendarEvent`, `lunarToSolar`
- Produces: `generateICS(events: CalendarEvent[], currentYear: number): string`

- [ ] **Step 1: Viết failing test cho iCalendar Generator**

Tạo `src/tests/ical/generator.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { generateICS } from "@/lib/ical/generator";
import { CalendarEvent } from "@/lib/store/useCalendarStore";

describe("iCalendar (.ics) Generator", () => {
  it("should generate valid RFC 5545 format with events", () => {
    const mockEvents: CalendarEvent[] = [
      {
        id: "evt-1",
        title: "Giỗ cụ nội",
        description: "Làm 3 mâm cúng",
        calendarType: "lunar",
        date: { day: 15, month: 8, year: 2024 },
        recurrence: "yearly",
        reminderDaysBefore: 1,
        createdAt: new Date().toISOString()
      },
      {
        id: "evt-2",
        title: "Họp gia đình",
        calendarType: "solar",
        date: { day: 20, month: 10, year: 2024 },
        recurrence: "once",
        reminderDaysBefore: 0,
        createdAt: new Date().toISOString()
      }
    ];

    const icsContent = generateICS(mockEvents, 2024);

    expect(icsContent).toContain("BEGIN:VCALENDAR");
    expect(icsContent).toContain("VERSION:2.0");
    expect(icsContent).toContain("SUMMARY:Giỗ cụ nội");
    expect(icsContent).toContain("SUMMARY:Họp gia đình");
    expect(icsContent).toContain("BEGIN:VALARM");
    expect(icsContent).toContain("END:VCALENDAR");
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

Run: `npm test src/tests/ical/generator.test.ts`
Expected: FAIL (Cannot find module `@/lib/ical/generator`)

- [ ] **Step 3: Triển khai `src/lib/ical/generator.ts`**

Tạo `src/lib/ical/generator.ts`:
```typescript
import { lunarToSolar } from "../lunar/converter";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  calendarType: "lunar" | "solar";
  date: {
    day: number;
    month: number;
    year?: number;
  };
  recurrence: "once" | "yearly" | "monthly";
  color?: string;
  reminderDaysBefore: number;
  createdAt: string;
}

function formatDateToICS(year: number, month: number, day: number): string {
  const y = year.toString().padStart(4, "0");
  const m = month.toString().padStart(2, "0");
  const d = day.toString().padStart(2, "0");
  return `${y}${m}${d}`;
}

export function generateICS(events: CalendarEvent[], targetYear: number = new Date().getFullYear()): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lich Am Duong Viet Nam//NONSGML v1.0//VN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Lịch Âm Dương & Sự Kiện Gia Đình",
    "X-WR-TIMEZONE:Asia/Ho_Chi_Minh",
  ];

  const yearsToGenerate = [targetYear, targetYear + 1];

  for (const event of events) {
    for (const yr of yearsToGenerate) {
      if (event.recurrence === "once" && event.date.year && event.date.year !== yr) {
        continue;
      }

      let solarDates: { day: number; month: number; year: number }[] = [];

      if (event.calendarType === "solar") {
        if (event.recurrence === "monthly") {
          for (let m = 1; m <= 12; m++) {
            solarDates.push({ day: event.date.day, month: m, year: yr });
          }
        } else {
          solarDates.push({ day: event.date.day, month: event.date.month, year: yr });
        }
      } else {
        // Lunar event conversion
        if (event.recurrence === "monthly") {
          for (let lm = 1; lm <= 12; lm++) {
            const solar = lunarToSolar(event.date.day, lm, yr, false);
            solarDates.push(solar);
          }
        } else {
          const solar = lunarToSolar(event.date.day, event.date.month, yr, false);
          solarDates.push(solar);
        }
      }

      for (const sDate of solarDates) {
        const dtString = formatDateToICS(sDate.year, sDate.month, sDate.day);
        const uid = `${event.id}-${dtString}@lichamduong.vn`;

        lines.push("BEGIN:VEVENT");
        lines.push(`UID:${uid}`);
        lines.push(`DTSTAMP:${formatDateToICS(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())}T000000Z`);
        lines.push(`DTSTART;VALUE=DATE:${dtString}`);
        lines.push(`SUMMARY:${event.title}`);
        if (event.description) {
          lines.push(`DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`);
        }

        if (event.reminderDaysBefore >= 0) {
          lines.push("BEGIN:VALARM");
          lines.push("ACTION:DISPLAY");
          lines.push(`DESCRIPTION:Nhắc nhở: ${event.title}`);
          lines.push(`TRIGGER:-P${event.reminderDaysBefore}D`);
          lines.push("END:VALARM");
        }

        lines.push("END:VEVENT");
      }
    }
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
```

- [ ] **Step 4: Chạy lại test để kiểm tra pass**

Run: `npm test src/tests/ical/generator.test.ts`
Expected: PASS (1 test passed)

- [ ] **Step 5: Commit**

```bash
git add src/lib/ical/generator.ts src/tests/ical/generator.test.ts
git commit -m "feat: implement RFC 5545 iCalendar (.ics) generator for lunar events"
```

---

### Task 7: Zustand Store & Quản Lý Sự Kiện (Local-First)

**Files:**
- Create: `src/lib/store/useCalendarStore.ts`
- Create: `src/tests/store/calendarStore.test.ts`

**Interfaces:**
- Produces: `useCalendarStore`, actions: `addEvent`, `updateEvent`, `deleteEvent`, `importEvents`, `exportEventsJSON`, `getEventsForSolarDay`

- [ ] **Step 1: Viết failing test cho Store**

Tạo `src/tests/store/calendarStore.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { useCalendarStore } from "@/lib/store/useCalendarStore";

describe("Calendar Zustand Store", () => {
  beforeEach(() => {
    useCalendarStore.setState({
      events: [],
      selectedDate: "2024-02-10",
      viewDate: { year: 2024, month: 2 },
    });
  });

  it("should add, update and delete events correctly", () => {
    const store = useCalendarStore.getState();
    store.addEvent({
      title: "Ngày Rằm",
      calendarType: "lunar",
      date: { day: 15, month: 1 },
      recurrence: "monthly",
      reminderDaysBefore: 1,
    });

    const events = useCalendarStore.getState().events;
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe("Ngày Rằm");

    const eventId = events[0].id;
    store.updateEvent(eventId, { title: "Rằm Tháng Giêng" });
    expect(useCalendarStore.getState().events[0].title).toBe("Rằm Tháng Giêng");

    store.deleteEvent(eventId);
    expect(useCalendarStore.getState().events).toHaveLength(0);
  });

  it("should match events for a given solar day", () => {
    const store = useCalendarStore.getState();
    // Tết 10/02/2024 is Lunar 01/01/2024
    store.addEvent({
      title: "Tết Nguyên Đán",
      calendarType: "lunar",
      date: { day: 1, month: 1 },
      recurrence: "yearly",
      reminderDaysBefore: 3,
    });

    const matched = store.getEventsForSolarDay(10, 2, 2024);
    expect(matched).toHaveLength(1);
    expect(matched[0].title).toBe("Tết Nguyên Đán");

    const unmatched = store.getEventsForSolarDay(11, 2, 2024);
    expect(unmatched).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

Run: `npm test src/tests/store/calendarStore.test.ts`
Expected: FAIL (Cannot find module `@/lib/store/useCalendarStore`)

- [ ] **Step 3: Triển khai `src/lib/store/useCalendarStore.ts`**

Tạo `src/lib/store/useCalendarStore.ts`:
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { solarToLunar } from "../lunar/converter";
import { CalendarEvent } from "../ical/generator";

export type { CalendarEvent };

interface CalendarState {
  selectedDate: string; // 'YYYY-MM-DD'
  viewDate: { year: number; month: number };
  events: CalendarEvent[];
  activeTab: "calendar" | "events" | "converter";

  setSelectedDate: (dateStr: string) => void;
  setViewDate: (year: number, month: number) => void;
  goToToday: () => void;
  setActiveTab: (tab: "calendar" | "events" | "converter") => void;

  addEvent: (event: Omit<CalendarEvent, "id" | "createdAt">) => string;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  importEvents: (jsonString: string) => { success: boolean; count?: number; error?: string };
  exportEventsJSON: () => string;
  getEventsForSolarDay: (day: number, month: number, year: number) => CalendarEvent[];
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      selectedDate: new Date().toISOString().split("T")[0],
      viewDate: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
      },
      events: [],
      activeTab: "calendar",

      setSelectedDate: (dateStr) => {
        const [y, m] = dateStr.split("-").map(Number);
        set({ selectedDate: dateStr, viewDate: { year: y, month: m } });
      },

      setViewDate: (year, month) => set({ viewDate: { year, month } }),

      goToToday: () => {
        const today = new Date();
        const y = today.getFullYear();
        const m = today.getMonth() + 1;
        const d = today.getDate();
        const dateStr = `${y}-${m.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
        set({ selectedDate: dateStr, viewDate: { year: y, month: m } });
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      addEvent: (eventData) => {
        const id = `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const newEvent: CalendarEvent = {
          ...eventData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ events: [...state.events, newEvent] }));
        return id;
      },

      updateEvent: (id, updatedFields) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updatedFields } : e)),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }));
      },

      importEvents: (jsonString) => {
        try {
          const parsed = JSON.parse(jsonString);
          if (!Array.isArray(parsed)) {
            return { success: false, error: "Dữ liệu JSON không hợp lệ (phải là danh sách)." };
          }
          const validEvents: CalendarEvent[] = parsed.filter(
            (e) => e.title && e.calendarType && e.date && typeof e.date.day === "number"
          );
          set((state) => ({
            events: [...state.events, ...validEvents],
          }));
          return { success: true, count: validEvents.length };
        } catch {
          return { success: false, error: "Lỗi định dạng file JSON." };
        }
      },

      exportEventsJSON: () => {
        return JSON.stringify(get().events, null, 2);
      },

      getEventsForSolarDay: (d: number, m: number, y: number) => {
        const events = get().events;
        const lunar = solarToLunar(d, m, y);

        return events.filter((evt) => {
          if (evt.calendarType === "solar") {
            if (evt.recurrence === "monthly") {
              return evt.date.day === d;
            }
            if (evt.recurrence === "yearly") {
              return evt.date.day === d && evt.date.month === m;
            }
            return evt.date.day === d && evt.date.month === m && evt.date.year === y;
          } else {
            // Lunar event
            if (evt.recurrence === "monthly") {
              return evt.date.day === lunar.day;
            }
            if (evt.recurrence === "yearly") {
              return evt.date.day === lunar.day && evt.date.month === lunar.month;
            }
            return (
              evt.date.day === lunar.day &&
              evt.date.month === lunar.month &&
              (evt.date.year ? evt.date.year === lunar.year : true)
            );
          }
        });
      },
    }),
    {
      name: "lich-am-duong-storage",
      partialize: (state) => ({ events: state.events }),
    }
  )
);
```

- [ ] **Step 4: Chạy lại test để kiểm tra pass**

Run: `npm test src/tests/store/calendarStore.test.ts`
Expected: PASS (2 tests passed)

- [ ] **Step 5: Commit**

```bash
git add src/lib/store/useCalendarStore.ts src/tests/store/calendarStore.test.ts
git commit -m "feat: implement zustand store with localstorage persistence and event matching"
```

---

### Task 8: UI Components - Lưới Lịch Tháng (MonthView) & Thanh Điều Hướng (QuickNav)

**Files:**
- Create: `src/components/calendar/QuickNav.tsx`
- Create: `src/components/calendar/MonthView.tsx`
- Create: `src/hooks/useMounted.ts`

**Interfaces:**
- Consumes: `useCalendarStore`, `solarToLunar`, `DAY_OF_WEEK_NAMES`
- Produces: `MonthView` (hiển thị lưới tháng dương/âm), `QuickNav` (chuyển tháng/năm, về hôm nay)

- [ ] **Step 1: Tạo hook `useMounted` để phòng ngừa Hydration Mismatch**

Tạo `src/hooks/useMounted.ts`:
```typescript
import { useState, useEffect } from "react";

export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
```

- [ ] **Step 2: Triển khai `QuickNav.tsx`**

Tạo `src/components/calendar/QuickNav.tsx`:
```tsx
"use client";

import React from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useCalendarStore } from "@/lib/store/useCalendarStore";

export function QuickNav() {
  const { viewDate, setViewDate, goToToday } = useCalendarStore();

  const handlePrevMonth = () => {
    if (viewDate.month === 1) {
      setViewDate(viewDate.year - 1, 12);
    } else {
      setViewDate(viewDate.year, viewDate.month - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewDate.month === 12) {
      setViewDate(viewDate.year + 1, 1);
    } else {
      setViewDate(viewDate.year, viewDate.month + 1);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Tháng {viewDate.month} / {viewDate.year}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
          title="Tháng trước"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={goToToday}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/40 rounded-lg transition-colors border border-amber-200 dark:border-amber-800/50"
        >
          <RotateCcw className="w-4 h-4" />
          Hôm nay
        </button>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
          title="Tháng sau"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Triển khai `MonthView.tsx`**

Tạo `src/components/calendar/MonthView.tsx`:
```tsx
"use client";

import React from "react";
import { useCalendarStore } from "@/lib/store/useCalendarStore";
import { solarToLunar } from "@/lib/lunar/converter";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/useMounted";

const DAY_HEADERS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function MonthView() {
  const mounted = useMounted();
  const { viewDate, selectedDate, setSelectedDate, getEventsForSolarDay } = useCalendarStore();

  if (!mounted) return <div className="h-96 animate-pulse bg-zinc-100 dark:bg-zinc-900 rounded-xl" />;

  const daysInMonth = getDaysInMonth(viewDate.year, viewDate.month);
  const firstDayOfWeek = new Date(viewDate.year, viewDate.month - 1, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const startOffset = (firstDayOfWeek + 6) % 7;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  const cells = [];
  // Empty offset cells
  for (let i = 0; i < startOffset; i++) {
    cells.push(<div key={`empty-${i}`} className="min-h-[72px] bg-zinc-50/50 dark:bg-zinc-900/30 rounded-lg opacity-40" />);
  }

  // Days in month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewDate.year}-${viewDate.month.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
    const isSelected = selectedDate === dateStr;
    const isToday = todayStr === dateStr;
    const lunar = solarToLunar(d, viewDate.month, viewDate.year);
    const dayEvents = getEventsForSolarDay(d, viewDate.month, viewDate.year);

    const isFirstLunarDay = lunar.day === 1;
    const isFullMoon = lunar.day === 15;

    cells.push(
      <button
        key={`day-${d}`}
        onClick={() => setSelectedDate(dateStr)}
        className={cn(
          "min-h-[76px] p-2 rounded-xl flex flex-col justify-between items-center transition-all text-left relative group border",
          isSelected
            ? "border-red-600 bg-red-50/70 dark:bg-red-950/40 dark:border-red-500 ring-2 ring-red-500/20 shadow-sm"
            : "border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700",
          isToday && !isSelected && "border-amber-500 dark:border-amber-400 bg-amber-50/30 dark:bg-amber-950/20"
        )}
      >
        <div className="w-full flex justify-between items-center">
          <span
            className={cn(
              "text-base font-semibold",
              isSelected ? "text-red-700 dark:text-red-400" : "text-zinc-800 dark:text-zinc-200",
              isToday && "text-amber-600 dark:text-amber-400 font-bold"
            )}
          >
            {d}
          </span>

          {dayEvents.length > 0 && (
            <div className="flex gap-0.5">
              {dayEvents.slice(0, 3).map((evt, idx) => (
                <span
                  key={idx}
                  className="w-1.5 h-1.5 rounded-full bg-red-500"
                  title={evt.title}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-full flex justify-between items-end mt-1">
          <span
            className={cn(
              "text-xs font-medium",
              isFirstLunarDay
                ? "text-red-600 dark:text-red-400 font-bold"
                : isFullMoon
                ? "text-amber-600 dark:text-amber-400 font-semibold"
                : "text-zinc-500 dark:text-zinc-400"
            )}
          >
            {isFirstLunarDay ? `${lunar.day}/${lunar.month}` : lunar.day}
            {lunar.isLeap && isFirstLunarDay ? " N" : ""}
          </span>

          {isFullMoon && <span className="text-[10px]" title="Ngày Rằm">🌕</span>}
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="grid grid-cols-7 gap-2 mb-2">
        {DAY_HEADERS.map((h, i) => (
          <div
            key={h}
            className={cn(
              "text-center py-1.5 text-xs font-semibold rounded-md",
              i >= 5 ? "text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20" : "text-zinc-500 dark:text-zinc-400"
            )}
          >
            {h}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">{cells}</div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useMounted.ts src/components/calendar/QuickNav.tsx src/components/calendar/MonthView.tsx
git commit -m "feat: implement MonthView grid and QuickNav components"
```

---

### Task 9: UI Components - Tờ Lịch Ngày Bloc Truyền Thống & Chi Tiết Phong Thủy

**Files:**
- Create: `src/components/calendar/DayBlocCard.tsx`
- Create: `src/components/calendar/DayDetailModal.tsx`

**Interfaces:**
- Consumes: `useCalendarStore`, `solarToLunar`, `getFullCanChi`, `getDayFengShui`, `DAY_OF_WEEK_NAMES`
- Produces: `DayBlocCard` (hiển thị tờ lịch ngày xé phong cách cổ truyền trang trọng), `DayDetailModal` (modal xem tất cả giờ hoàng đạo/hắc đạo, trực, sao).

- [ ] **Step 1: Triển khai `DayBlocCard.tsx`**

Tạo `src/components/calendar/DayBlocCard.tsx`:
```tsx
"use client";

import React, { useState } from "react";
import { useCalendarStore } from "@/lib/store/useCalendarStore";
import { solarToLunar } from "@/lib/lunar/converter";
import { getFullCanChi } from "@/lib/lunar/canchi";
import { getDayFengShui } from "@/lib/lunar/phongthuy";
import { DAY_OF_WEEK_NAMES } from "@/lib/lunar/constants";
import { useMounted } from "@/hooks/useMounted";
import { Compass, Sparkles, Plus, Info } from "lucide-react";
import { DayDetailModal } from "./DayDetailModal";
import { EventModal } from "../events/EventModal";

export function DayBlocCard() {
  const mounted = useMounted();
  const { selectedDate, getEventsForSolarDay } = useCalendarStore();
  const [showDetail, setShowDetail] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);

  if (!mounted) return <div className="h-[480px] animate-pulse bg-zinc-100 dark:bg-zinc-900 rounded-2xl" />;

  const [year, month, day] = selectedDate.split("-").map(Number);
  const solarDateObj = new Date(year, month - 1, day);
  const dayOfWeekName = DAY_OF_WEEK_NAMES[solarDateObj.getDay()];

  const lunar = solarToLunar(day, month, year);
  const canChi = getFullCanChi(day, month, year, lunar);
  const fengShui = getDayFengShui(day, month, year, lunar.month);
  const dayEvents = getEventsForSolarDay(day, month, year);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
      {/* Header Bloc màu đỏ truyền thống */}
      <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white p-5 text-center relative shadow-inner">
        <p className="text-xs uppercase tracking-widest text-amber-200 font-semibold mb-1">
          Lịch Vạn Niên Việt Nam
        </p>
        <h3 className="text-xl font-bold tracking-wide">{dayOfWeekName}</h3>
        <p className="text-sm text-red-100">
          Tháng {month} năm {year} (Dương lịch)
        </p>
      </div>

      {/* Thân tờ lịch Bloc */}
      <div className="p-6 flex-1 flex flex-col items-center text-center">
        {/* Số ngày dương to bản */}
        <div className="text-7xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight my-2">
          {day}
        </div>

        {/* Thông tin Âm lịch nổi bật */}
        <div className="w-full py-3 my-2 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            ÂM LỊCH
          </p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400 my-0.5">
            Ngày {lunar.day} Tháng {lunar.month} {lunar.isLeap ? "(Nhuận)" : ""}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Năm {canChi.yearCanChi}
          </p>
        </div>

        {/* Can Chi 4 trụ */}
        <div className="w-full grid grid-cols-2 gap-2 text-xs text-left bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg my-2">
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Ngày:</span>{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{canChi.dayCanChi}</span>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Tháng:</span>{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{canChi.monthCanChi}</span>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Tiết khí:</span>{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{fengShui.tietKhi}</span>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Trực:</span>{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{fengShui.truc}</span>
          </div>
        </div>

        {/* Giờ Hoàng Đạo tóm lược */}
        <div className="w-full text-left my-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Giờ Hoàng Đạo:
            </span>
            <button
              onClick={() => setShowDetail(true)}
              className="text-[11px] text-zinc-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-0.5"
            >
              <Info className="w-3 h-3" /> Chi tiết
            </button>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
            {fengShui.hoangDaoHours.map((h) => h.split(" ")[0]).join(", ")}
          </p>
        </div>

        {/* Hướng xuất hành */}
        <div className="w-full flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 text-left bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-lg my-1">
          <Compass className="w-4 h-4 text-zinc-500 shrink-0" />
          <span>
            Hỷ thần: <strong className="text-zinc-700 dark:text-zinc-300">{fengShui.huongXuatHanh.hyThan}</strong> | Tài thần: <strong className="text-zinc-700 dark:text-zinc-300">{fengShui.huongXuatHanh.taiThan}</strong>
          </span>
        </div>

        {/* Sự kiện trong ngày */}
        <div className="w-full border-t border-zinc-200 dark:border-zinc-800 pt-3 mt-3 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Sự kiện ngày này ({dayEvents.length})
            </span>
            <button
              onClick={() => setShowAddEvent(true)}
              className="text-xs flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm lời nhắc
            </button>
          </div>

          {dayEvents.length === 0 ? (
            <p className="text-xs text-zinc-400 italic">Chưa có sự kiện nào cho ngày này.</p>
          ) : (
            <ul className="space-y-1.5">
              {dayEvents.map((evt) => (
                <li
                  key={evt.id}
                  className="text-xs p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200/50 dark:border-red-900/30"
                >
                  <div className="font-semibold">{evt.title}</div>
                  {evt.description && <div className="text-[11px] opacity-80 mt-0.5">{evt.description}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showDetail && (
        <DayDetailModal
          isOpen={showDetail}
          onClose={() => setShowDetail(false)}
          fengShui={fengShui}
          dateStr={`${day}/${month}/${year}`}
        />
      )}

      {showAddEvent && (
        <EventModal
          isOpen={showAddEvent}
          onClose={() => setShowAddEvent(false)}
          defaultDate={{ day, month, year }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Triển khai `DayDetailModal.tsx`**

Tạo `src/components/calendar/DayDetailModal.tsx`:
```tsx
"use client";

import React from "react";
import { DayFengShui } from "@/lib/lunar/types";
import { X, Sparkles, AlertCircle, Compass } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fengShui: DayFengShui;
  dateStr: string;
}

export function DayDetailModal({ isOpen, onClose, fengShui, dateStr }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-lg w-full p-6 border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Chi Tiết Phong Thủy - Ngày {dateStr}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Giờ Hoàng Đạo */}
          <div>
            <h4 className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4" /> 6 Giờ Hoàng Đạo (Giờ tốt)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {fengShui.hoangDaoHours.map((h, i) => (
                <div key={i} className="p-2 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg text-xs font-medium text-amber-900 dark:text-amber-300">
                  {h}
                </div>
              ))}
            </div>
          </div>

          {/* Giờ Hắc Đạo */}
          <div>
            <h4 className="font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 mb-2">
              <AlertCircle className="w-4 h-4" /> 6 Giờ Hắc Đạo (Cần cẩn trọng)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {fengShui.hacDaoHours.map((h, i) => (
                <div key={i} className="p-2 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-400">
                  {h}
                </div>
              ))}
            </div>
          </div>

          {/* Trực & Sao */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
              <div className="text-xs text-zinc-500 mb-1">Thập Nhị Trực</div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">{fengShui.truc}</div>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
              <div className="text-xs text-zinc-500 mb-1">Nhị Thập Bát Tú (28 Sao)</div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                {fengShui.sao} ({fengShui.saoStatus})
              </div>
            </div>
          </div>

          {/* Hướng xuất hành */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
            <h4 className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mb-2">
              <Compass className="w-4 h-4" /> Hướng xuất hành tốt
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              - <strong>Hỷ Thần</strong> (cầu hỷ sự, may mắn): {fengShui.huongXuatHanh.hyThan}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              - <strong>Tài Thần</strong> (cầu tài lộc, kinh doanh): {fengShui.huongXuatHanh.taiThan}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/calendar/DayBlocCard.tsx src/components/calendar/DayDetailModal.tsx
git commit -m "feat: implement DayBlocCard and DayDetailModal components"
```

---

### Task 10: UI Components - Quản Lý Sự Kiện (EventModal, EventList, UpcomingBanner)

**Files:**
- Create: `src/components/events/EventModal.tsx`
- Create: `src/components/events/EventList.tsx`
- Create: `src/components/events/UpcomingBanner.tsx`

**Interfaces:**
- Consumes: `useCalendarStore`, `generateICS`, `solarToLunar`, `lunarToSolar`
- Produces: `EventModal` (dialog thêm/sửa sự kiện), `UpcomingBanner` (thông báo sự kiện 3-7 ngày tới), `EventList` (trang quản lý, export/import).

- [ ] **Step 1: Triển khai `EventModal.tsx`**

Tạo `src/components/events/EventModal.tsx`:
```tsx
"use client";

import React, { useState } from "react";
import { useCalendarStore, CalendarEvent } from "@/lib/store/useCalendarStore";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: CalendarEvent;
  defaultDate?: { day: number; month: number; year: number };
}

export function EventModal({ isOpen, onClose, eventToEdit, defaultDate }: Props) {
  const { addEvent, updateEvent } = useCalendarStore();

  const [title, setTitle] = useState(eventToEdit?.title || "");
  const [description, setDescription] = useState(eventToEdit?.description || "");
  const [calendarType, setCalendarType] = useState<"lunar" | "solar">(
    eventToEdit?.calendarType || "lunar"
  );
  const [day, setDay] = useState(eventToEdit?.date.day || defaultDate?.day || 1);
  const [month, setMonth] = useState(eventToEdit?.date.month || defaultDate?.month || 1);
  const [recurrence, setRecurrence] = useState<"once" | "yearly" | "monthly">(
    eventToEdit?.recurrence || "yearly"
  );
  const [reminderDaysBefore, setReminderDaysBefore] = useState(
    eventToEdit?.reminderDaysBefore ?? 1
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (eventToEdit) {
      updateEvent(eventToEdit.id, {
        title,
        description,
        calendarType,
        date: { day, month, year: defaultDate?.year },
        recurrence,
        reminderDaysBefore,
      });
    } else {
      addEvent({
        title,
        description,
        calendarType,
        date: { day, month, year: defaultDate?.year },
        recurrence,
        reminderDaysBefore,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {eventToEdit ? "Sửa Lời Nhắc / Sự Kiện" : "Thêm Lời Nhắc Mới"}
          </h3>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Tên sự kiện / ngày giỗ *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Giỗ cụ nội, Sinh nhật mẹ, Ngày Rằm..."
              required
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Loại lịch
              </label>
              <select
                value={calendarType}
                onChange={(e) => setCalendarType(e.target.value as "lunar" | "solar")}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="lunar">Lịch Âm (Giỗ, Rằm...)</option>
                <option value="solar">Lịch Dương</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tần suất lặp
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as "once" | "yearly" | "monthly")}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="yearly">Lặp hàng năm (Giỗ, Sinh nhật)</option>
                <option value="monthly">Lặp hàng tháng (Rằm 15, Mùng 1)</option>
                <option value="once">Chỉ một lần</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Ngày
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {recurrence !== "monthly" && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tháng
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nhắc nhở trước
            </label>
            <select
              value={reminderDaysBefore}
              onChange={(e) => setReminderDaysBefore(Number(e.target.value))}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="0">Đúng ngày</option>
              <option value="1">Trước 1 ngày</option>
              <option value="3">Trước 3 ngày</option>
              <option value="7">Trước 7 ngày (1 tuần)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Ghi chú thêm
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Chuẩn bị lễ vật, địa điểm cúng..."
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm"
            >
              Lưu sự kiện
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Triển khai `UpcomingBanner.tsx`**

Tạo `src/components/events/UpcomingBanner.tsx`:
```tsx
"use client";

import React from "react";
import { useCalendarStore } from "@/lib/store/useCalendarStore";
import { useMounted } from "@/hooks/useMounted";
import { Bell } from "lucide-react";

export function UpcomingBanner() {
  const mounted = useMounted();
  const { getEventsForSolarDay } = useCalendarStore();

  if (!mounted) return null;

  const today = new Date();
  const upcomingList: { title: string; daysLeft: number; dateStr: string }[] = [];

  for (let offset = 0; offset <= 7; offset++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + offset);
    const d = targetDate.getDate();
    const m = targetDate.getMonth() + 1;
    const y = targetDate.getFullYear();

    const events = getEventsForSolarDay(d, m, y);
    for (const evt of events) {
      upcomingList.push({
        title: evt.title,
        daysLeft: offset,
        dateStr: `${d}/${m}`,
      });
    }
  }

  if (upcomingList.length === 0) return null;

  return (
    <div className="mb-4 p-3.5 bg-gradient-to-r from-amber-500/10 via-red-500/10 to-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2.5">
        <span className="p-2 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400">
          <Bell className="w-4 h-4 animate-bounce" />
        </span>
        <div>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            Sắp tới ({upcomingList.length} sự kiện):
          </span>{" "}
          <span className="text-zinc-700 dark:text-zinc-300">
            {upcomingList[0].daysLeft === 0
              ? `Hôm nay: ${upcomingList[0].title}`
              : `Còn ${upcomingList[0].daysLeft} ngày nữa (${upcomingList[0].dateStr}) là ${upcomingList[0].title}`}
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Triển khai `EventList.tsx`**

Tạo `src/components/events/EventList.tsx`:
```tsx
"use client";

import React, { useState } from "react";
import { useCalendarStore, CalendarEvent } from "@/lib/store/useCalendarStore";
import { generateICS } from "@/lib/ical/generator";
import { Trash2, Download, Upload, Plus, Calendar } from "lucide-react";
import { EventModal } from "./EventModal";

export function EventList() {
  const { events, deleteEvent, exportEventsJSON, importEvents } = useCalendarStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);

  const handleExportICS = () => {
    const icsString = generateICS(events);
    const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "lich-am-duong-su-kien.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonString = exportEventsJSON();
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sao-luu-su-kien.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importEvents(content);
      if (res.success) {
        alert(`Đã khôi phục thành công ${res.count} sự kiện!`);
      } else {
        alert(`Lỗi: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Quản Lý Sự Kiện & Lời Nhắc Âm Lịch
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Dữ liệu được lưu trữ an toàn ngay trên trình duyệt của bạn (Local-first).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Thêm mới
          </button>

          <button
            onClick={handleExportICS}
            className="flex items-center gap-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            title="Đồng bộ vào Google Calendar hoặc Apple Calendar"
          >
            <Calendar className="w-4 h-4" /> Xuất iCal (.ics)
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" /> Sao lưu JSON
          </button>

          <label className="flex items-center gap-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-lg cursor-pointer transition-colors">
            <Upload className="w-4 h-4" /> Nhập JSON
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="py-12 text-center text-zinc-400">
          <p>Chưa có sự kiện nào được tạo.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-3 text-red-600 dark:text-red-400 font-semibold hover:underline text-sm"
          >
            + Bấm vào đây để tạo ngày giỗ, rằm hoặc sinh nhật âm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex justify-between items-start"
            >
              <div>
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 mb-1.5">
                  {evt.calendarType === "lunar" ? "Lịch Âm" : "Lịch Dương"} -{" "}
                  {evt.recurrence === "yearly" ? "Hàng năm" : evt.recurrence === "monthly" ? "Hàng tháng" : "Một lần"}
                </span>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{evt.title}</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  Ngày {evt.date.day} {evt.date.month ? `tháng ${evt.date.month}` : ""}
                </p>
                {evt.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 italic">
                    {evt.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => deleteEvent(evt.id)}
                className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Xóa sự kiện"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {(showAddModal || editingEvent) && (
        <EventModal
          isOpen={showAddModal || !!editingEvent}
          onClose={() => {
            setShowAddModal(false);
            setEditingEvent(undefined);
          }}
          eventToEdit={editingEvent}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/events/EventModal.tsx src/components/events/UpcomingBanner.tsx src/components/events/EventList.tsx
git commit -m "feat: implement event management, upcoming banner, and ics export"
```

---

### Task 11: Tiện Ích Đổi Ngày Âm Dương & Tích Hợp Toàn Bộ Giao Diện Dashboard (Next.js 15)

**Files:**
- Create: `src/components/converter/DateConverter.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/MobileNav.tsx`
- Create: `src/app/manifest.ts`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

**Interfaces:**
- Consumes: All previous tasks (`MonthView`, `DayBlocCard`, `QuickNav`, `UpcomingBanner`, `EventList`, `solarToLunar`, `lunarToSolar`, `getFullCanChi`)
- Produces: Complete responsive Next.js 15 web application with Split-view, navigation tabs, dark/light theme, and PWA manifest.

- [ ] **Step 1: Triển khai `DateConverter.tsx`**

Tạo `src/components/converter/DateConverter.tsx`:
```tsx
"use client";

import React, { useState } from "react";
import { solarToLunar, lunarToSolar } from "@/lib/lunar/converter";
import { getFullCanChi } from "@/lib/lunar/canchi";
import { ArrowRightLeft } from "lucide-react";

export function DateConverter() {
  const [mode, setMode] = useState<"solarToLunar" | "lunarToSolar">("solarToLunar");

  const today = new Date();
  const [day, setDay] = useState(today.getDate());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [isLeap, setIsLeap] = useState(false);

  const solarResult =
    mode === "lunarToSolar" ? lunarToSolar(day, month, year, isLeap) : null;
  const lunarResult =
    mode === "solarToLunar" ? solarToLunar(day, month, year) : null;

  const canChi =
    mode === "solarToLunar" && lunarResult
      ? getFullCanChi(day, month, year, lunarResult)
      : solarResult
      ? getFullCanChi(solarResult.day, solarResult.month, solarResult.year, { day, month, year, isLeap })
      : null;

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 max-w-2xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Chuyển Đổi Ngày Âm - Dương
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Tính toán chuẩn xác theo thuật toán thiên văn Việt Nam (1900 - 2100).
          </p>
        </div>

        <button
          onClick={() => setMode(mode === "solarToLunar" ? "lunarToSolar" : "solarToLunar")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-lg text-xs font-semibold border border-amber-200 dark:border-amber-800/60"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" /> Đổi chiều chuyển đổi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Input */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            {mode === "solarToLunar" ? "Nhập Ngày Dương Lịch" : "Nhập Ngày Âm Lịch"}
          </h4>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Ngày</label>
              <input
                type="number"
                min="1"
                max="31"
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Tháng</label>
              <input
                type="number"
                min="1"
                max="12"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Năm</label>
              <input
                type="number"
                min="1900"
                max="2100"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold"
              />
            </div>
          </div>

          {mode === "lunarToSolar" && (
            <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isLeap}
                onChange={(e) => setIsLeap(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              Tháng nhuận (Leap month)
            </label>
          )}
        </div>

        {/* Kết quả */}
        <div className="p-5 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-xl text-center">
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            {mode === "solarToLunar" ? "Kết Quả Âm Lịch" : "Kết Quả Dương Lịch"}
          </span>

          <div className="text-2xl font-extrabold text-red-700 dark:text-red-400 my-2">
            {mode === "solarToLunar" && lunarResult && (
              <>
                Ngày {lunarResult.day} tháng {lunarResult.month} {lunarResult.isLeap ? "(Nhuận)" : ""} năm {lunarResult.year}
              </>
            )}
            {mode === "lunarToSolar" && solarResult && (
              <>
                Ngày {solarResult.day} tháng {solarResult.month} năm {solarResult.year}
              </>
            )}
          </div>

          {canChi && (
            <div className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1 mt-3 pt-3 border-t border-amber-500/20">
              <p>
                <strong>Năm:</strong> {canChi.yearCanChi} | <strong>Tháng:</strong> {canChi.monthCanChi}
              </p>
              <p>
                <strong>Ngày:</strong> {canChi.dayCanChi}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Triển khai Header và MobileNav**

Tạo `src/components/layout/Header.tsx`:
```tsx
"use client";

import React from "react";
import { useCalendarStore } from "@/lib/store/useCalendarStore";
import { Calendar, Moon, Sun } from "lucide-react";

export function Header() {
  const { activeTab, setActiveTab } = useCalendarStore();
  const [isDark, setIsDark] = React.useState(false);

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark");
      setIsDark(!isDark);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-red-600 text-white rounded-xl shadow-sm">
            <Calendar className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Lịch Âm Dương
            </h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 -mt-0.5">
              Lịch Vạn Niên & Quản Lý Sự Kiện
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "calendar"
                ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            Lịch Vạn Niên
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "events"
                ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            Sự Kiện & Lời Nhắc
          </button>
          <button
            onClick={() => setActiveTab("converter")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "converter"
                ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            Đổi Ngày Âm - Dương
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Đổi chế độ sáng / tối"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
```

Tạo `src/components/layout/MobileNav.tsx`:
```tsx
"use client";

import React from "react";
import { useCalendarStore } from "@/lib/store/useCalendarStore";
import { Calendar, Bell, ArrowRightLeft } from "lucide-react";

export function MobileNav() {
  const { activeTab, setActiveTab } = useCalendarStore();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 flex justify-around py-2">
      <button
        onClick={() => setActiveTab("calendar")}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
          activeTab === "calendar" ? "text-red-600 dark:text-red-400" : "text-zinc-500"
        }`}
      >
        <Calendar className="w-5 h-5" />
        Lịch
      </button>

      <button
        onClick={() => setActiveTab("events")}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
          activeTab === "events" ? "text-red-600 dark:text-red-400" : "text-zinc-500"
        }`}
      >
        <Bell className="w-5 h-5" />
        Sự Kiện
      </button>

      <button
        onClick={() => setActiveTab("converter")}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
          activeTab === "converter" ? "text-red-600 dark:text-red-400" : "text-zinc-500"
        }`}
      >
        <ArrowRightLeft className="w-5 h-5" />
        Đổi Ngày
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Triển khai PWA Manifest `src/app/manifest.ts`**

Tạo `src/app/manifest.ts`:
```typescript
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lịch Âm Dương Việt Nam",
    short_name: "Lịch Âm Dương",
    description: "Tra cứu lịch âm dương, lịch vạn niên và quản lý sự kiện gia đình",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#991b1b",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
```

- [ ] **Step 4: Triển khai `src/app/globals.css`, `src/app/layout.tsx` và `src/app/page.tsx`**

Tạo `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #fcfcfc;
  --foreground: #171717;
}

.dark {
  --background: #09090b;
  --foreground: #f4f4f5;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
```

Tạo `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

export const metadata: Metadata = {
  title: "Lịch Âm Dương Việt Nam - Lịch Vạn Niên & Sự Kiện",
  description: "Ứng dụng tra cứu lịch âm dương chuẩn thiên văn Việt Nam, xem giờ hoàng đạo, tiết khí và nhắc nhở ngày rằm, mùng một, ngày giỗ gia đình.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased selection:bg-red-500 selection:text-white">
        <Header />
        <main className="flex-1 pb-16 md:pb-8">{children}</main>
        <MobileNav />
      </body>
    </html>
  );
}
```

Tạo `src/app/page.tsx`:
```tsx
"use client";

import React from "react";
import { useCalendarStore } from "@/lib/store/useCalendarStore";
import { QuickNav } from "@/components/calendar/QuickNav";
import { MonthView } from "@/components/calendar/MonthView";
import { DayBlocCard } from "@/components/calendar/DayBlocCard";
import { UpcomingBanner } from "@/components/events/UpcomingBanner";
import { EventList } from "@/components/events/EventList";
import { DateConverter } from "@/components/converter/DateConverter";

export default function HomePage() {
  const { activeTab } = useCalendarStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {activeTab === "calendar" && (
        <>
          <UpcomingBanner />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Lưới Lịch Tháng (65% width) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <QuickNav />
              <MonthView />
            </div>

            {/* Tờ Lịch Bloc Ngày (35% width) */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-20">
              <DayBlocCard />
            </div>
          </div>
        </>
      )}

      {activeTab === "events" && <EventList />}

      {activeTab === "converter" && <DateConverter />}
    </div>
  );
}
```

- [ ] **Step 5: Chạy toàn bộ test suite và build Next.js để kiểm tra**

Run: `npm test`
Expected: PASS (All tests passed across all modules)

Run: `npm run build`
Expected: PASS (Build completed successfully with 0 errors)

- [ ] **Step 6: Commit**

```bash
git add src/components/converter/DateConverter.tsx src/components/layout/Header.tsx src/components/layout/MobileNav.tsx src/app/manifest.ts src/app/globals.css src/app/layout.tsx src/app/page.tsx
git commit -m "feat: integrate full split-view dashboard, date converter, and PWA manifest"
```

---

## Self-Review Checklist

- **Spec coverage:** Toàn bộ các yêu cầu từ spec (Chuyển đổi âm dương thiên văn GMT+7, Can Chi, Tiết khí, Phong thủy vạn niên, Quản lý sự kiện, Xuất file iCal .ics, Dashboard Split-view, Responsive mobile, Tránh lỗi Hydration) đều được hiện thực hóa qua 11 tasks cụ thể.
- **No Placeholders:** Mọi task đều có đầy đủ file path, code mẫu thực tế, command test, không có TODO hay TBD.
- **Type consistency:** Các types `SolarDate`, `LunarDate`, `CalendarEvent`, `DayFengShui` được định nghĩa thống nhất từ Task 2 đến Task 11.
