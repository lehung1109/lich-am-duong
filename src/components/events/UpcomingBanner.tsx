"use client";

import React from "react";
import { useCalendarStore } from "@/lib/store/useCalendarStore";
import { useMounted } from "@/hooks/useMounted";
import { Bell } from "lucide-react";

export function UpcomingBanner() {
  const mounted = useMounted();
  const { getEventsForSolarDay, setActiveTab } = useCalendarStore();

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
        <span className="p-2 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0">
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

      <button
        onClick={() => setActiveTab("events")}
        className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline shrink-0"
      >
        Xem tất cả →
      </button>
    </div>
  );
}
