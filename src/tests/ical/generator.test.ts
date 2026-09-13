import { describe, it, expect } from "vitest";
import { generateICS, CalendarEvent } from "@/lib/ical/generator";

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
    expect(icsContent).toContain("PRODID:-//Lich Am Duong Viet Nam//NONSGML v1.0//VN");
    expect(icsContent).toContain("CALSCALE:GREGORIAN");
    expect(icsContent).toContain("METHOD:PUBLISH");
    expect(icsContent).toContain("X-WR-CALNAME:Lịch Âm Dương & Sự Kiện Gia Đình");
    expect(icsContent).toContain("X-WR-TIMEZONE:Asia/Ho_Chi_Minh");
    expect(icsContent).toContain("SUMMARY:Giỗ cụ nội");
    expect(icsContent).toContain("SUMMARY:Họp gia đình");
    expect(icsContent).toContain("BEGIN:VALARM");
    expect(icsContent).toContain("END:VCALENDAR");
  });

  it("should format lines with CRLF line breaks", () => {
    const mockEvents: CalendarEvent[] = [
      {
        id: "evt-test",
        title: "Test Event",
        calendarType: "solar",
        date: { day: 1, month: 1, year: 2024 },
        recurrence: "once",
        reminderDaysBefore: 0,
        createdAt: "2024-01-01T00:00:00.000Z"
      }
    ];

    const icsContent = generateICS(mockEvents, 2024);

    expect(icsContent).toContain("\r\n");
    const lines = icsContent.split("\r\n");
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines[lines.length - 1]).toBe("END:VCALENDAR");
  });

  it("should correctly convert lunar yearly events across targetYear and targetYear + 1", () => {
    // 15/8/2024 ÂL is 17/09/2024 DL (Trung Thu 2024)
    // 15/8/2025 ÂL is 06/10/2025 DL (Trung Thu 2025)
    const mockEvents: CalendarEvent[] = [
      {
        id: "evt-trung-thu",
        title: "Tết Trung Thu",
        description: "Rước đèn ngắm trăng",
        calendarType: "lunar",
        date: { day: 15, month: 8, year: 2024 },
        recurrence: "yearly",
        reminderDaysBefore: 3,
        createdAt: "2024-01-01T00:00:00.000Z"
      }
    ];

    const icsContent = generateICS(mockEvents, 2024);

    // Should contain both solar dates
    expect(icsContent).toContain("DTSTART;VALUE=DATE:20240917");
    expect(icsContent).toContain("DTSTART;VALUE=DATE:20251006");

    // Should have unique UIDs containing the respective solar dates
    expect(icsContent).toContain("UID:evt-trung-thu-20240917@lichamduong.vn");
    expect(icsContent).toContain("UID:evt-trung-thu-20251006@lichamduong.vn");

    // Reminder trigger should be 3 days before
    expect(icsContent).toContain("TRIGGER:-P3D");
  });

  it("should only generate once recurrence for the matching year", () => {
    const mockEvents: CalendarEvent[] = [
      {
        id: "evt-once-solar",
        title: "Khai mạc triển lãm",
        calendarType: "solar",
        date: { day: 15, month: 5, year: 2024 },
        recurrence: "once",
        reminderDaysBefore: 1,
        createdAt: "2024-01-01T00:00:00.000Z"
      }
    ];

    const icsContent = generateICS(mockEvents, 2024);

    expect(icsContent).toContain("DTSTART;VALUE=DATE:20240515");
    expect(icsContent).not.toContain("DTSTART;VALUE=DATE:20250515");
  });

  it("should generate 12 occurrences per year for monthly recurrence", () => {
    const mockEvents: CalendarEvent[] = [
      {
        id: "evt-ram",
        title: "Ngày Rằm",
        calendarType: "lunar",
        date: { day: 15, month: 1 },
        recurrence: "monthly",
        reminderDaysBefore: 1,
        createdAt: "2024-01-01T00:00:00.000Z"
      }
    ];

    // For 2024 and 2025 (2 years), monthly recurrence generates 24 events (12 * 2)
    const icsContent = generateICS(mockEvents, 2024);
    const veventMatches = icsContent.match(/BEGIN:VEVENT/g);
    expect(veventMatches).not.toBeNull();
    expect(veventMatches?.length).toBe(24);
  });

  it("should generate 12 occurrences per year for solar monthly recurrence", () => {
    const mockEvents: CalendarEvent[] = [
      {
        id: "evt-monthly-solar",
        title: "Báo cáo tháng",
        calendarType: "solar",
        date: { day: 1, month: 1 },
        recurrence: "monthly",
        reminderDaysBefore: 0,
        createdAt: "2024-01-01T00:00:00.000Z"
      }
    ];

    const icsContent = generateICS(mockEvents, 2024);
    const veventMatches = icsContent.match(/BEGIN:VEVENT/g);
    expect(veventMatches?.length).toBe(24);
    expect(icsContent).toContain("DTSTART;VALUE=DATE:20240101");
    expect(icsContent).toContain("DTSTART;VALUE=DATE:20241201");
    expect(icsContent).toContain("DTSTART;VALUE=DATE:20250101");
  });

  it("should omit VALARM when reminderDaysBefore is negative", () => {
    const mockEvents: CalendarEvent[] = [
      {
        id: "evt-no-reminder",
        title: "Sự kiện không báo",
        calendarType: "solar",
        date: { day: 5, month: 5, year: 2024 },
        recurrence: "once",
        reminderDaysBefore: -1,
        createdAt: "2024-01-01T00:00:00.000Z"
      }
    ];

    const icsContent = generateICS(mockEvents, 2024);

    expect(icsContent).toContain("SUMMARY:Sự kiện không báo");
    expect(icsContent).not.toContain("BEGIN:VALARM");
  });

  it("should escape newlines in event description", () => {
    const mockEvents: CalendarEvent[] = [
      {
        id: "evt-desc",
        title: "Lễ vật cúng",
        description: "Gà luộc\nXôi gấc\nHoa quả tươi",
        calendarType: "solar",
        date: { day: 1, month: 1, year: 2024 },
        recurrence: "once",
        reminderDaysBefore: 0,
        createdAt: "2024-01-01T00:00:00.000Z"
      }
    ];

    const icsContent = generateICS(mockEvents, 2024);

    expect(icsContent).toContain("DESCRIPTION:Gà luộc\\nXôi gấc\\nHoa quả tươi");
    expect(icsContent).not.toContain("Gà luộc\r\nXôi gấc");
  });

  it("should generate valid calendar with zero events when list is empty", () => {
    const icsContent = generateICS([], 2024);

    expect(icsContent).toContain("BEGIN:VCALENDAR");
    expect(icsContent).toContain("VERSION:2.0");
    expect(icsContent).toContain("END:VCALENDAR");
    expect(icsContent).not.toContain("BEGIN:VEVENT");
  });
});
