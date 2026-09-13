"use client";

import React from "react";
import { DayFengShui } from "@/lib/lunar/types";
import { X, Sparkles, AlertCircle, Compass } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fengShui: DayFengShui;
  dateStr: string;
}

export function DayDetailModal({ isOpen, onClose, fengShui, dateStr }: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-lg w-full p-6 border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Chi Tiết Phong Thủy - Ngày {dateStr}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Giờ Hoàng Đạo */}
          <div>
            <h4 className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4" /> 6 Giờ Hoàng Đạo (Giờ tốt)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {fengShui.hoangDaoHours.map((h, i) => (
                <div key={i} className="p-2 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg text-xs font-medium text-amber-900 dark:text-amber-300">
                  {h}
                </div>
              ))}
            </div>
          </div>

          {/* Giờ Hắc Đạo */}
          <div>
            <h4 className="font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 mb-2">
              <AlertCircle className="w-4 h-4" /> 6 Giờ Hắc Đạo (Cần cẩn trọng)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {fengShui.hacDaoHours.map((h, i) => (
                <div key={i} className="p-2 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-400">
                  {h}
                </div>
              ))}
            </div>
          </div>

          {/* Trực & Sao */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
              <div className="text-xs text-zinc-500 mb-1">Thập Nhị Trực</div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">{fengShui.truc}</div>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
              <div className="text-xs text-zinc-500 mb-1">Nhị Thập Bát Tú (28 Sao)</div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                {fengShui.sao} ({fengShui.saoStatus})
              </div>
            </div>
          </div>

          {/* Hướng xuất hành */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
            <h4 className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mb-2">
              <Compass className="w-4 h-4" /> Hướng xuất hành tốt
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              - <strong>Hỷ Thần</strong> (cầu hỷ sự, may mắn): {fengShui.huongXuatHanh.hyThan}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              - <strong>Tài Thần</strong> (cầu tài lộc, kinh doanh): {fengShui.huongXuatHanh.taiThan}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
