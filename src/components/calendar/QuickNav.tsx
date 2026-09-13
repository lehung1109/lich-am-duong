"use client";

import React from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useCalendarStore } from "@/lib/store/useCalendarStore";
import { useMounted } from "@/hooks/useMounted";

export function QuickNav() {
  const mounted = useMounted();
  const { viewDate, setViewDate, goToToday } = useCalendarStore();

  if (!mounted) {
    return (
      <div className="h-16 animate-pulse bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800" />
    );
  }

  const isMinDate = viewDate.year <= 1900 && viewDate.month <= 1;
  const isMaxDate = viewDate.year >= 2100 && viewDate.month >= 12;

  const handlePrevMonth = () => {
    if (isMinDate) return;
    if (viewDate.month === 1) {
      setViewDate(viewDate.year - 1, 12);
    } else {
      setViewDate(viewDate.year, viewDate.month - 1);
    }
  };

  const handleNextMonth = () => {
    if (isMaxDate) return;
    if (viewDate.month === 12) {
      setViewDate(viewDate.year + 1, 1);
    } else {
      setViewDate(viewDate.year, viewDate.month + 1);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <select
          value={viewDate.month}
          onChange={(e) => setViewDate(viewDate.year, Number(e.target.value))}
          className="px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Chọn tháng"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              Tháng {m}
            </option>
          ))}
        </select>

        <select
          value={viewDate.year}
          onChange={(e) => setViewDate(Number(e.target.value), viewDate.month)}
          className="px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Chọn năm"
        >
          {Array.from({ length: 201 }, (_, i) => 1900 + i).map((y) => (
            <option key={y} value={y}>
              Năm {y}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevMonth}
          disabled={isMinDate}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
          disabled={isMaxDate}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Tháng sau"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
