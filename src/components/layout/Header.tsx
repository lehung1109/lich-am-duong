"use client";

import React, { useState, useEffect } from "react";
import { useCalendarStore } from "@/lib/store/useCalendarStore";
import { Calendar, Moon, Sun } from "lucide-react";
import { useMounted } from "@/hooks/useMounted";

export function Header() {
  const { activeTab, setActiveTab } = useCalendarStore();
  const mounted = useMounted();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, [mounted]);

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      const nextDark = !document.documentElement.classList.contains("dark");
      if (nextDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      setIsDark(nextDark);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setActiveTab("calendar")}
        >
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "calendar"
                ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Lịch Vạn Niên
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "events"
                ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Sự Kiện & Lời Nhắc
          </button>
          <button
            onClick={() => setActiveTab("converter")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "converter"
                ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Đổi Ngày Âm - Dương
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Đổi chế độ sáng / tối"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
