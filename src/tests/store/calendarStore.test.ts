import { describe, it, expect, beforeEach } from "vitest";
import { useCalendarStore } from "@/lib/store/useCalendarStore";

describe("Calendar Zustand Store", () => {
  beforeEach(() => {
    useCalendarStore.setState({
      events: [],
      selectedDate: "2024-02-10",
      viewDate: { year: 2024, month: 2 },
      activeTab: "calendar",
    });
  });

  it("should add, update and delete events correctly", () => {
    const store = useCalendarStore.getState();
    const eventId = store.addEvent({
      title: "Ngày Rằm",
      calendarType: "lunar",
      date: { day: 15, month: 1 },
      recurrence: "monthly",
      reminderDaysBefore: 1,
    });

    expect(eventId).toBeDefined();
    expect(typeof eventId).toBe("string");

    const events = useCalendarStore.getState().events;
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe(eventId);
    expect(events[0].title).toBe("Ngày Rằm");
    expect(events[0].createdAt).toBeDefined();

    store.updateEvent(eventId, { title: "Rằm Tháng Giêng" });
    expect(useCalendarStore.getState().events[0].title).toBe("Rằm Tháng Giêng");

    store.deleteEvent(eventId);
    expect(useCalendarStore.getState().events).toHaveLength(0);
  });

  it("should match events for a given solar day", () => {
    const store = useCalendarStore.getState();
    // Tết 10/02/2024 is Lunar 01/01/2024 (Giáp Thìn)
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

  it("should match solar events for once, monthly, and yearly recurrence", () => {
    const store = useCalendarStore.getState();

    // Solar Once
    store.addEvent({
      title: "Họp dự án",
      calendarType: "solar",
      date: { day: 15, month: 5, year: 2024 },
      recurrence: "once",
      reminderDaysBefore: 0,
    });

    // Solar Yearly
    store.addEvent({
      title: "Quốc khánh",
      calendarType: "solar",
      date: { day: 2, month: 9 },
      recurrence: "yearly",
      reminderDaysBefore: 1,
    });

    // Solar Monthly
    store.addEvent({
      title: "Tổng kết tháng",
      calendarType: "solar",
      date: { day: 25, month: 1 },
      recurrence: "monthly",
      reminderDaysBefore: 0,
    });

    // Match solar once
    expect(store.getEventsForSolarDay(15, 5, 2024)).toHaveLength(1);
    expect(store.getEventsForSolarDay(15, 5, 2024)[0].title).toBe("Họp dự án");
    expect(store.getEventsForSolarDay(15, 5, 2025)).toHaveLength(0); // Different year

    // Match solar yearly across years
    expect(store.getEventsForSolarDay(2, 9, 2024)).toHaveLength(1);
    expect(store.getEventsForSolarDay(2, 9, 2025)).toHaveLength(1);
    expect(store.getEventsForSolarDay(2, 9, 2024)[0].title).toBe("Quốc khánh");

    // Match solar monthly
    expect(store.getEventsForSolarDay(25, 3, 2024)).toHaveLength(1);
    expect(store.getEventsForSolarDay(25, 8, 2024)).toHaveLength(1);
    expect(store.getEventsForSolarDay(24, 3, 2024)).toHaveLength(0);
  });

  it("should match lunar events for once and monthly recurrence", () => {
    const store = useCalendarStore.getState();

    // Monthly lunar event (mùng 1 âm lịch hàng tháng)
    store.addEvent({
      title: "Mùng 1 đầu tháng",
      calendarType: "lunar",
      date: { day: 1, month: 1 },
      recurrence: "monthly",
      reminderDaysBefore: 1,
    });

    // Once lunar event (giỗ cụ 15/07/2024 âm)
    store.addEvent({
      title: "Giỗ đặc biệt",
      calendarType: "lunar",
      date: { day: 15, month: 7, year: 2024 },
      recurrence: "once",
      reminderDaysBefore: 2,
    });

    // 10/02/2024 solar is 01/01/2024 lunar -> should match "Mùng 1 đầu tháng"
    const matchedMung1 = store.getEventsForSolarDay(10, 2, 2024);
    expect(matchedMung1.some((e) => e.title === "Mùng 1 đầu tháng")).toBe(true);

    // 18/08/2024 solar is 15/07/2024 lunar -> should match both "Giỗ đặc biệt"
    const matchedGio = store.getEventsForSolarDay(18, 8, 2024);
    expect(matchedGio.some((e) => e.title === "Giỗ đặc biệt")).toBe(true);
  });

  it("should NOT duplicate yearly lunar events in leap months of the same year", () => {
    const store = useCalendarStore.getState();
    // In 2023, lunar month 2 is followed by leap month 2 (tháng 2 nhuận)
    // 15/02/2023 lunar (normal) is 06/03/2023 solar
    // 15/02/2023 lunar (leap) is 05/04/2023 solar
    store.addEvent({
      title: "Giỗ cụ ngày 15 tháng 2",
      calendarType: "lunar",
      date: { day: 15, month: 2 },
      recurrence: "yearly",
      reminderDaysBefore: 1,
    });

    // Should match regular month 2 (06/03/2023)
    const regularMatch = store.getEventsForSolarDay(6, 3, 2023);
    expect(regularMatch.some((e) => e.title === "Giỗ cụ ngày 15 tháng 2")).toBe(true);

    // Should NOT match leap month 2 (05/04/2023)
    const leapMatch = store.getEventsForSolarDay(5, 4, 2023);
    expect(leapMatch.some((e) => e.title === "Giỗ cụ ngày 15 tháng 2")).toBe(false);
  });

  it("should handle navigation actions: setSelectedDate, setViewDate, goToToday, setActiveTab", () => {
    const store = useCalendarStore.getState();

    store.setSelectedDate("2025-11-20");
    expect(useCalendarStore.getState().selectedDate).toBe("2025-11-20");
    expect(useCalendarStore.getState().viewDate).toEqual({ year: 2025, month: 11 });

    store.setViewDate(2026, 5);
    expect(useCalendarStore.getState().viewDate).toEqual({ year: 2026, month: 5 });

    store.setActiveTab("events");
    expect(useCalendarStore.getState().activeTab).toBe("events");

    store.goToToday();
    const today = new Date();
    const expectedYear = today.getFullYear();
    const expectedMonth = today.getMonth() + 1;
    const expectedDate = `${expectedYear}-${expectedMonth.toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
    expect(useCalendarStore.getState().selectedDate).toBe(expectedDate);
    expect(useCalendarStore.getState().viewDate).toEqual({ year: expectedYear, month: expectedMonth });
  });

  it("should export events to JSON and import events from JSON", () => {
    const store = useCalendarStore.getState();
    store.addEvent({
      title: "Sự kiện A",
      calendarType: "solar",
      date: { day: 1, month: 5, year: 2024 },
      recurrence: "yearly",
      reminderDaysBefore: 1,
    });

    const json = store.exportEventsJSON();
    expect(typeof json).toBe("string");
    const parsed = JSON.parse(json);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe("Sự kiện A");

    // Clear events
    useCalendarStore.setState({ events: [] });
    expect(useCalendarStore.getState().events).toHaveLength(0);

    // Import back
    const importRes = store.importEvents(json);
    expect(importRes.success).toBe(true);
    expect(importRes.count).toBe(1);
    expect(useCalendarStore.getState().events).toHaveLength(1);
    expect(useCalendarStore.getState().events[0].title).toBe("Sự kiện A");
  });

  it("should return error when importing invalid JSON", () => {
    const store = useCalendarStore.getState();

    const invalidJsonRes = store.importEvents("invalid-json{");
    expect(invalidJsonRes.success).toBe(false);
    expect(invalidJsonRes.error).toBe("Lỗi định dạng file JSON.");

    const nonArrayRes = store.importEvents(JSON.stringify({ not: "an array" }));
    expect(nonArrayRes.success).toBe(false);
    expect(nonArrayRes.error).toBe("Dữ liệu JSON không hợp lệ (phải là danh sách).");
  });

  it("should configure persistence with correct name and partialize only events", () => {
    const persistOptions = useCalendarStore.persist?.getOptions();
    expect(persistOptions).toBeDefined();
    expect(persistOptions?.name).toBe("lich-am-duong-storage");

    const state = useCalendarStore.getState();
    const partialized = persistOptions?.partialize?.(state);
    expect(partialized).toHaveProperty("events");
    expect(partialized).not.toHaveProperty("selectedDate");
    expect(partialized).not.toHaveProperty("viewDate");
    expect(partialized).not.toHaveProperty("activeTab");
  });
});
