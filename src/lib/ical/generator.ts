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
  isLeap?: boolean;
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

function isValidSolarDate(day: number, month: number, year: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
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
      if (event.recurrence === "once") {
        const eventYr = event.date.year ?? targetYear;
        if (eventYr !== yr) continue;
      }

      const solarDates: { day: number; month: number; year: number }[] = [];

      if (event.calendarType === "solar") {
        if (event.recurrence === "monthly") {
          for (let m = 1; m <= 12; m++) {
            if (isValidSolarDate(event.date.day, m, yr)) {
              solarDates.push({ day: event.date.day, month: m, year: yr });
            }
          }
        } else {
          if (isValidSolarDate(event.date.day, event.date.month, yr)) {
            solarDates.push({ day: event.date.day, month: event.date.month, year: yr });
          }
        }
      } else {
        // Lunar event conversion
        if (event.recurrence === "monthly") {
          for (let lm = 1; lm <= 12; lm++) {
            const solar = lunarToSolar(event.date.day, lm, yr, false);
            if (solar.day > 0) solarDates.push(solar);
          }
        } else {
          const isLeapMonth = Boolean(event.isLeap);
          const solar = lunarToSolar(event.date.day, event.date.month, yr, isLeapMonth);
          if (solar.day > 0) solarDates.push(solar);
        }
      }

      const dtstamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      for (const sDate of solarDates) {
        const dtString = formatDateToICS(sDate.year, sDate.month, sDate.day);
        const uid = `${event.id}-${dtString}@lichamduong.vn`;

        lines.push("BEGIN:VEVENT");
        lines.push(`UID:${uid}`);
        lines.push(`DTSTAMP:${dtstamp}`);
        lines.push(`DTSTART;VALUE=DATE:${dtString}`);
        lines.push(`SUMMARY:${event.title}`);
        if (event.description) {
          lines.push(`DESCRIPTION:${event.description.replace(/\r?\n/g, "\\n")}`);
        }

        if (typeof event.reminderDaysBefore === "number" && event.reminderDaysBefore >= 0) {
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
