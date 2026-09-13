"use client";

import React from "react";
import { useCalendarStore } from "@/lib/store/useCalendarStore";
import { Calendar, Bell, ArrowRightLeft } from "lucide-react";

export function MobileNav() {
  const { activeTab, setActiveTab } = useCalendarStore();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 flex justify-around py-2">
      <button
        onClick={() => setActiveTab("calendar")}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
          activeTab === "calendar"
            ? "text-red-600 dark:text-red-400 font-bold"
            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        }`}
      >
        <Calendar className="w-5 h-5" />
        Lịch
      </button>

      <button
        onClick={() => setActiveTab("events")}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
          activeTab === "events"
            ? "text-red-600 dark:text-red-400 font-bold"
            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        }`}
      >
        <Bell className="w-5 h-5" />
        Sự Kiện
      </button>

      <button
        onClick={() => setActiveTab("converter")}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
          activeTab === "converter"
            ? "text-red-600 dark:text-red-400 font-bold"
            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        }`}
      >
        <ArrowRightLeft className="w-5 h-5" />
        Đổi Ngày
      </button>
    </nav>
  );
}
