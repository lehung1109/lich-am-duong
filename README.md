# 🗓️ Lịch Âm Dương Việt Nam (Lịch Vạn Niên & Quản Lý Sự Kiện)

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3.0-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-green?style=flat&logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Ứng dụng **Lịch Âm Dương Việt Nam** hiện đại, chính xác cao và tôn trọng quyền riêng tư. Được xây dựng trên nền tảng **Next.js 16 (App Router + Turbopack)** và **React 19**, ứng dụng sử dụng thuật toán thiên văn thuần TypeScript dựa trên mô hình Jean Meeus & Hồ Ngọc Đức, tối ưu chuẩn xác cho múi giờ Việt Nam (**UTC+7 / 105° Đông**) trong toàn bộ giai đoạn **1900 – 2100**.

---

## ✨ Tính Năng Nổi Bật

### 1. 🔭 Core Engine Thiên Văn Học Chuẩn Xác (1900 - 2100)
- **Zero Heavy Dependencies**: Không sử dụng thư viện cồng kềnh (`moment.js` hay `date-fns`). Toàn bộ thuật toán thiên văn viết bằng Pure TypeScript tối ưu cao.
- **Tính toán điểm Sóc & Trung khí**: Xác định chính xác ngày mùng 1 âm lịch và các tháng nhuận (ví dụ: tháng 2 nhuận năm 2023, tháng 6 nhuận năm 2025).
- **Chuyển đổi 2 chiều đối xứng tuyệt đối**: Đảm bảo $A = \text{lunarToSolar}(\text{solarToLunar}(A))$ trên toàn bộ 365 ngày mỗi năm.

### 2. 🐉 Can Chi 4 Trụ & 24 Tiết Khí
- **Can Chi 4 trụ**: Tự động tính toán Can Chi của **Năm**, **Tháng**, **Ngày**, **Giờ** (áp dụng chính xác quy tắc Ngũ Hổ Độn và Ngũ Thử Độn).
- **24 Tiết Khí**: Tính toán dựa theo kinh độ Mặt Trời thực tế (mỗi tiết khí cách nhau 15°).

### 3. ☯️ Phong Thủy & Lịch Vạn Niên
- **12 Khung giờ trong ngày**: Phân định 6 Giờ Hoàng Đạo (Cát) và 6 Giờ Hắc Đạo (Hung) kèm tên sao chiếu giờ (Thanh Long, Minh Đường, Thiên Hình,...).
- **Thập Nhị Trực**: Kiến, Trừ, Mãn, Bình, Định, Chấp, Phá, Nguy, Thành, Thâu, Khai, Bế kèm ý nghĩa Cát/Hung.
- **Nhị Thập Bát Tú**: 28 Sao phương Đông (Giác, Cang, Đê, Phòng,...) luân chuyển theo chu kỳ chuẩn xác.
- **Hướng Xuất Hành**: Hướng Hỷ Thần và Tài Thần theo Can Chi của ngày.

### 4. 🔒 Quản Lý Sự Kiện Local-First (Bảo Mật Tuyệt Đối)
- **100% Local-First**: Toàn bộ dữ liệu sự kiện, ngày giỗ tổ tiên, sinh nhật âm lịch được lưu an toàn trong `localStorage` của trình duyệt. Không cần đăng nhập, không gửi thông tin lên máy chủ bên ngoài.
- **Lặp linh hoạt**: Hỗ trợ lặp Hàng năm (ngày giỗ, sinh nhật), Hàng tháng (ngày Rằm 15, mùng 1), hoặc Một lần.
- **Tự động ánh xạ**: Chuyển đổi thông minh ngày Âm lịch lặp lại sang ngày Dương lịch thực tế tương ứng của từng năm/tháng.
- **Sao lưu & Khôi phục**: Xuất và nhập dữ liệu dạng JSON nhanh chóng, tiện lợi chuyển đổi thiết bị.

### 5. 📅 Đồng Bộ Lịch Quốc Tế (iCalendar .ics)
- Xuất file `.ics` chuẩn **RFC 5545** tương thích hoàn hảo với **Google Calendar**, **Apple Calendar**, **Microsoft Outlook**.
- Tích hợp chuông báo `VALARM` nhắc trước ngày sự kiện và dự phóng trước 2 năm cho các sự kiện âm lịch.

### 6. 📱 Trải Nghiệm Giao Diện Split-View Hiện Đại
- **Bố cục Split-View**: Lưới lịch tháng (65%) kết hợp Tờ lịch bloc truyền thống bóc xé dán dính (35%).
- **Thanh điều hướng nhanh**: Dễ dàng chuyển tháng, chọn năm trong phạm vi [1900 - 2100], nút bấm quay về ngày hôm nay.
- **Banner thông báo**: Tự động hiển thị các sự kiện, ngày giỗ sắp diễn ra trong 7 ngày tới.
- **Công cụ đổi ngày nhanh**: Giao diện chuyển đổi Dương $\leftrightarrow$ Âm tức thì kèm hiển thị Can Chi.
- **Chống lỗi Hydration Mismatch**: Thiết kế với cơ chế Hydration Guard chuyên biệt cho Next.js App Router.
- **Hỗ trợ Mobile & Dark Mode**: Thanh điều hướng dưới đáy (Bottom Nav) cho điện thoại di động và giao diện tối giản, sang trọng.
- **PWA Ready**: Tích hợp sẵn Web App Manifest, có thể cài đặt như ứng dụng native trên máy tính và điện thoại.

---

## 🛠️ Công Nghệ Sử Dụng

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) với `persist` middleware
- **Testing**: [Vitest](https://vitest.dev/) (100% passing tests)
- **Type Checking**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)

---

## 📂 Cấu Trúc Thư Mục

```
lich-am-duong/
├── src/
│   ├── app/                    # Next.js 16 App Router
│   │   ├── globals.css         # Tailwind directives & CSS variables
│   │   ├── layout.tsx          # Root layout with SEO & header
│   │   ├── manifest.ts         # PWA Web App Manifest
│   │   └── page.tsx            # Dashboard page (Split-view Month + Bloc)
│   ├── components/
│   │   ├── calendar/           # MonthView, DayBlocCard, QuickNav, DayDetailModal
│   │   ├── converter/          # DateConverter (Đổi ngày Âm - Dương)
│   │   ├── events/             # EventList, EventModal, UpcomingBanner
│   │   └── layout/             # Header, MobileNav
│   ├── hooks/
│   │   └── useMounted.ts       # Hydration mismatch protection hook
│   ├── lib/
│   │   ├── ical/               # RFC 5545 iCalendar (.ics) generator
│   │   ├── lunar/              # Core astronomical algorithms, canchi, phongthuy
│   │   │   ├── astronomical.ts # Jean Meeus / Ho Ngoc Duc JDN formulas
│   │   │   ├── canchi.ts       # 4 Pillars Can Chi calculations
│   │   │   ├── constants.ts    # Astronomical constants & naming arrays
│   │   │   ├── converter.ts    # Bidirectional solar <-> lunar conversion
│   │   │   ├── phongthuy.ts    # Hoang Dao, Thap Nhi Truc, 28 Sao, Huong
│   │   │   ├── tietkhi.ts      # 24 Solar terms
│   │   │   └── types.ts        # Domain types
│   │   └── store/              # Zustand store with localStorage persistence
│   └── tests/                  # Vitest automated test suite (63 unit tests)
├── public/                     # Static assets & icons
├── docs/                       # Design specs & implementation plans
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── vitest.config.ts            # Vitest test runner configuration
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu cầu môi trường
- **Node.js**: Phiên bản `>= 18.18.0` (Khuyên dùng Node.js 20 hoặc 22 LTS)
- **npm** hoặc **yarn** / **pnpm** / **bun**

### 1. Clone repository
```bash
git clone https://github.com/lehung1109/lich-am-duong.git
cd lich-am-duong
```

### 2. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 3. Chạy môi trường phát triển (Development)
```bash
npm run dev
```
Mở trình duyệt và truy cập [http://localhost:3000](http://localhost:3000).

### 4. Chạy kiểm thử tự động (Unit Tests)
```bash
npm test
```
Chạy toàn bộ 63 bài kiểm thử đơn vị cho thuật toán thiên văn, chuyển đổi lịch, can chi, phong thủy, store và bộ sinh file iCal.

### 5. Đóng gói bản Production (Build)
```bash
npm run build
npm run start
```

---

## 📜 Giấy Phép (License)

Dự án được phân phối dưới giấy phép mã nguồn mở [MIT License](LICENSE).
