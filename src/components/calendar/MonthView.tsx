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
                  key={evt.id || idx}
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
