import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { solarToLunar } from "../lunar/converter";
import { CalendarEvent } from "../ical/generator";

export type { CalendarEvent };

export interface CalendarState {
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

function getTodayString(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = (today.getMonth() + 1).toString().padStart(2, "0");
  const d = today.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => {
      const today = new Date();

      return {
        selectedDate: getTodayString(),
        viewDate: {
          year: today.getFullYear(),
          month: today.getMonth() + 1,
        },
        events: [],
        activeTab: "calendar",

        setSelectedDate: (dateStr) => {
          const [y, m] = dateStr.split("-").map(Number);
          if (!isNaN(y) && !isNaN(m)) {
            set({ selectedDate: dateStr, viewDate: { year: y, month: m } });
          } else {
            set({ selectedDate: dateStr });
          }
        },

        setViewDate: (year, month) => set({ viewDate: { year, month } }),

        goToToday: () => {
          const t = new Date();
          const y = t.getFullYear();
          const m = t.getMonth() + 1;
          const d = t.getDate();
          const dateStr = `${y}-${m.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
          set({ selectedDate: dateStr, viewDate: { year: y, month: m } });
        },

        setActiveTab: (tab) => set({ activeTab: tab }),

        addEvent: (eventData) => {
          const id = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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
            const validEvents: CalendarEvent[] = parsed
              .filter(
                (e) =>
                  e &&
                  typeof e === "object" &&
                  e.title &&
                  e.calendarType &&
                  e.date &&
                  typeof e.date.day === "number"
              )
              .map((e) => ({
                ...e,
                id: e.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                createdAt: e.createdAt || new Date().toISOString(),
                recurrence: e.recurrence || "once",
                reminderDaysBefore:
                  typeof e.reminderDaysBefore === "number" ? e.reminderDaysBefore : 0,
              }));

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
              return (
                evt.date.day === d &&
                evt.date.month === m &&
                (evt.date.year ? evt.date.year === y : true)
              );
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
      };
    },
    {
      name: "lich-am-duong-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined" && window.localStorage) {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({ events: state.events }),
    }
  )
);
