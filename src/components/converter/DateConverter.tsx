"use client";

import React, { useState, useEffect } from "react";
import { solarToLunar, lunarToSolar } from "@/lib/lunar/converter";
import { getFullCanChi } from "@/lib/lunar/canchi";
import { useMounted } from "@/hooks/useMounted";
import { ArrowRightLeft } from "lucide-react";

export function DateConverter() {
  const mounted = useMounted();
  const [mode, setMode] = useState<"solarToLunar" | "lunarToSolar">("solarToLunar");

  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(2026);
  const [isLeap, setIsLeap] = useState(false);

  useEffect(() => {
    if (mounted) {
      const today = new Date();
      setDay(today.getDate());
      setMonth(today.getMonth() + 1);
      setYear(today.getFullYear());
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 max-w-2xl mx-auto animate-pulse">
        <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mb-4"></div>
        <div className="h-40 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl"></div>
      </div>
    );
  }

  const solarResult =
    mode === "lunarToSolar" ? lunarToSolar(day, month, year, isLeap) : null;
  const lunarResult =
    mode === "solarToLunar" ? solarToLunar(day, month, year) : null;

  const isSolarValid =
    solarResult !== null && solarResult.day > 0 && solarResult.month > 0 && solarResult.year > 0;
  const isLunarValid =
    lunarResult !== null && lunarResult.day > 0 && lunarResult.month > 0 && lunarResult.year > 0;

  const canChi =
    mode === "solarToLunar" && isLunarValid
      ? getFullCanChi(day, month, year, lunarResult)
      : isSolarValid
      ? getFullCanChi(solarResult.day, solarResult.month, solarResult.year, {
          day,
          month,
          year,
          isLeap,
        })
      : null;

  const handleSwapMode = () => {
    if (mode === "solarToLunar" && lunarResult && isLunarValid) {
      setDay(lunarResult.day);
      setMonth(lunarResult.month);
      setYear(lunarResult.year);
      setIsLeap(Boolean(lunarResult.isLeap));
      setMode("lunarToSolar");
    } else if (mode === "lunarToSolar" && solarResult && isSolarValid) {
      setDay(solarResult.day);
      setMonth(solarResult.month);
      setYear(solarResult.year);
      setIsLeap(false);
      setMode("solarToLunar");
    } else {
      setMode(mode === "solarToLunar" ? "lunarToSolar" : "solarToLunar");
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 max-w-2xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Chuyển Đổi Ngày Âm - Dương
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Tính toán chuẩn xác theo thuật toán thiên văn Việt Nam (1900 - 2100).
          </p>
        </div>

        <button
          onClick={handleSwapMode}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-lg text-xs font-semibold border border-amber-200 dark:border-amber-800/60 transition-colors cursor-pointer"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" /> Đổi chiều chuyển đổi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Input */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            {mode === "solarToLunar" ? "Nhập Ngày Dương Lịch" : "Nhập Ngày Âm Lịch"}
          </h4>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Ngày</label>
              <input
                type="number"
                min="1"
                max="31"
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Tháng</label>
              <input
                type="number"
                min="1"
                max="12"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Năm</label>
              <input
                type="number"
                min="1900"
                max="2100"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {mode === "lunarToSolar" && (
            <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isLeap}
                onChange={(e) => setIsLeap(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              Tháng nhuận (Leap month)
            </label>
          )}
        </div>

        {/* Kết quả */}
        <div className="p-5 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-xl text-center">
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            {mode === "solarToLunar" ? "Kết Quả Âm Lịch" : "Kết Quả Dương Lịch"}
          </span>

          <div className="text-2xl font-extrabold text-red-700 dark:text-red-400 my-2">
            {mode === "solarToLunar" && isLunarValid && (
              <>
                Ngày {lunarResult.day} tháng {lunarResult.month}{" "}
                {lunarResult.isLeap ? "(Nhuận)" : ""} năm {lunarResult.year}
              </>
            )}
            {mode === "lunarToSolar" &&
              (isSolarValid ? (
                <>
                  Ngày {solarResult.day} tháng {solarResult.month} năm {solarResult.year}
                </>
              ) : (
                <span className="text-sm font-medium text-red-500">
                  Ngày hoặc tháng nhuận không hợp lệ
                </span>
              ))}
          </div>

          {canChi && (
            <div className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1 mt-3 pt-3 border-t border-amber-500/20">
              <p>
                <strong>Năm:</strong> {canChi.yearCanChi} | <strong>Tháng:</strong>{" "}
                {canChi.monthCanChi}
              </p>
              <p>
                <strong>Ngày:</strong> {canChi.dayCanChi}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
