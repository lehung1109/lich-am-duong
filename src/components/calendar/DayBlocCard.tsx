"use client";

import React, { useState } from "react";
import { useCalendarStore } from "@/lib/store/useCalendarStore";
import { solarToLunar } from "@/lib/lunar/converter";
import { getFullCanChi } from "@/lib/lunar/canchi";
import { getDayFengShui } from "@/lib/lunar/phongthuy";
import { DAY_OF_WEEK_NAMES } from "@/lib/lunar/constants";
import { useMounted } from "@/hooks/useMounted";
import { Compass, Sparkles, Plus, Info } from "lucide-react";
import { DayDetailModal } from "./DayDetailModal";
import { EventModal } from "../events/EventModal";

export function DayBlocCard() {
  const mounted = useMounted();
  const { selectedDate, getEventsForSolarDay } = useCalendarStore();
  const [showDetail, setShowDetail] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);

  if (!mounted) return <div className="h-[480px] animate-pulse bg-zinc-100 dark:bg-zinc-900 rounded-2xl" />;

  const [year, month, day] = selectedDate.split("-").map(Number);
  const solarDateObj = new Date(year, month - 1, day);
  const dayOfWeekName = DAY_OF_WEEK_NAMES[solarDateObj.getDay()];

  const lunar = solarToLunar(day, month, year);
  const canChi = getFullCanChi(day, month, year, lunar);
  const fengShui = getDayFengShui(day, month, year, lunar.month);
  const dayEvents = getEventsForSolarDay(day, month, year);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
      {/* Header Bloc màu đỏ truyền thống */}
      <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white p-5 text-center relative shadow-inner">
        <p className="text-xs uppercase tracking-widest text-amber-200 font-semibold mb-1">
          Lịch Vạn Niên Việt Nam
        </p>
        <h3 className="text-xl font-bold tracking-wide">{dayOfWeekName}</h3>
        <p className="text-sm text-red-100">
          Tháng {month} năm {year} (Dương lịch)
        </p>
      </div>

      {/* Thân tờ lịch Bloc */}
      <div className="p-6 flex-1 flex flex-col items-center text-center">
        {/* Số ngày dương to bản */}
        <div className="text-7xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight my-2">
          {day}
        </div>

        {/* Thông tin Âm lịch nổi bật */}
        <div className="w-full py-3 my-2 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            ÂM LỊCH
          </p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400 my-0.5">
            Ngày {lunar.day} Tháng {lunar.month} {lunar.isLeap ? "(Nhuận)" : ""}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Năm {canChi.yearCanChi}
          </p>
        </div>

        {/* Can Chi 4 trụ */}
        <div className="w-full grid grid-cols-2 gap-2 text-xs text-left bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg my-2">
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Ngày:</span>{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{canChi.dayCanChi}</span>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Tháng:</span>{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{canChi.monthCanChi}</span>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Tiết khí:</span>{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{fengShui.tietKhi}</span>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Trực:</span>{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{fengShui.truc}</span>
          </div>
        </div>

        {/* Giờ Hoàng Đạo tóm lược */}
        <div className="w-full text-left my-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Giờ Hoàng Đạo:
            </span>
            <button
              onClick={() => setShowDetail(true)}
              className="text-[11px] text-zinc-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-0.5"
            >
              <Info className="w-3 h-3" /> Chi tiết
            </button>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
            {fengShui.hoangDaoHours.map((h) => h.split(" ")[0]).join(", ")}
          </p>
        </div>

        {/* Hướng xuất hành */}
        <div className="w-full flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 text-left bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-lg my-1">
          <Compass className="w-4 h-4 text-zinc-500 shrink-0" />
          <span>
            Hỷ thần: <strong className="text-zinc-700 dark:text-zinc-300">{fengShui.huongXuatHanh.hyThan}</strong> | Tài thần: <strong className="text-zinc-700 dark:text-zinc-300">{fengShui.huongXuatHanh.taiThan}</strong>
          </span>
        </div>

        {/* Sự kiện trong ngày */}
        <div className="w-full border-t border-zinc-200 dark:border-zinc-800 pt-3 mt-3 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Sự kiện ngày này ({dayEvents.length})
            </span>
            <button
              onClick={() => setShowAddEvent(true)}
              className="text-xs flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm lời nhắc
            </button>
          </div>

          {dayEvents.length === 0 ? (
            <p className="text-xs text-zinc-400 italic">Chưa có sự kiện nào cho ngày này.</p>
          ) : (
            <ul className="space-y-1.5">
              {dayEvents.map((evt) => (
                <li
                  key={evt.id}
                  className="text-xs p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200/50 dark:border-red-900/30"
                >
                  <div className="font-semibold">{evt.title}</div>
                  {evt.description && <div className="text-[11px] opacity-80 mt-0.5">{evt.description}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showDetail && (
        <DayDetailModal
          isOpen={showDetail}
          onClose={() => setShowDetail(false)}
          fengShui={fengShui}
          dateStr={`${day}/${month}/${year}`}
        />
      )}

      {showAddEvent && (
        <EventModal
          isOpen={showAddEvent}
          onClose={() => setShowAddEvent(false)}
          defaultDate={{ day, month, year }}
          defaultCalendarType="solar"
        />
      )}
    </div>
  );
}
