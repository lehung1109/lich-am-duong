"use client";

import React, { useState } from "react";
import { useCalendarStore, CalendarEvent } from "@/lib/store/useCalendarStore";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: CalendarEvent;
  defaultDate?: { day: number; month: number; year: number };
  defaultCalendarType?: "lunar" | "solar";
  defaultIsLeap?: boolean;
  solarReference?: { day: number; month: number; year: number };
}

export function EventModal({
  isOpen,
  onClose,
  eventToEdit,
  defaultDate,
  defaultCalendarType,
  defaultIsLeap,
  solarReference,
}: Props) {
  const { addEvent, updateEvent } = useCalendarStore();

  const [title, setTitle] = useState(eventToEdit?.title || "");
  const [description, setDescription] = useState(eventToEdit?.description || "");
  const [calendarType, setCalendarType] = useState<"lunar" | "solar">(
    eventToEdit?.calendarType || defaultCalendarType || "lunar"
  );
  const [day, setDay] = useState(eventToEdit?.date.day || defaultDate?.day || 1);
  const [month, setMonth] = useState(eventToEdit?.date.month || defaultDate?.month || 1);
  const [year, setYear] = useState(
    eventToEdit?.date.year || defaultDate?.year || new Date().getFullYear()
  );
  const [isLeap, setIsLeap] = useState(eventToEdit?.isLeap || defaultIsLeap || false);
  const [recurrence, setRecurrence] = useState<"once" | "yearly" | "monthly">(
    eventToEdit?.recurrence || "yearly"
  );
  const [reminderDaysBefore, setReminderDaysBefore] = useState(
    eventToEdit?.reminderDaysBefore ?? 1
  );

  const handleCalendarTypeChange = (newType: "lunar" | "solar") => {
    if (newType === calendarType) return;
    if (newType === "solar" && solarReference && defaultDate && day === defaultDate.day && month === defaultDate.month) {
      setDay(solarReference.day);
      setMonth(solarReference.month);
      setYear(solarReference.year);
    } else if (newType === "lunar" && solarReference && defaultDate && day === solarReference.day && month === solarReference.month) {
      setDay(defaultDate.day);
      setMonth(defaultDate.month);
      setYear(defaultDate.year);
      if (defaultIsLeap) setIsLeap(defaultIsLeap);
    }
    setCalendarType(newType);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const eventYear = recurrence === "once" ? year : (eventToEdit?.date.year ?? defaultDate?.year);

    if (eventToEdit) {
      updateEvent(eventToEdit.id, {
        title,
        description,
        calendarType,
        date: { day, month, year: eventYear },
        isLeap: calendarType === "lunar" ? isLeap : false,
        recurrence,
        reminderDaysBefore,
      });
    } else {
      addEvent({
        title,
        description,
        calendarType,
        date: { day, month, year: eventYear },
        isLeap: calendarType === "lunar" ? isLeap : false,
        recurrence,
        reminderDaysBefore,
      });
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {eventToEdit ? "Sửa Lời Nhắc / Sự Kiện" : "Thêm Lời Nhắc Mới"}
          </h3>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Tên sự kiện / ngày giỗ *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Giỗ cụ nội, Sinh nhật mẹ, Ngày Rằm..."
              required
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Loại lịch
              </label>
              <select
                value={calendarType}
                onChange={(e) => handleCalendarTypeChange(e.target.value as "lunar" | "solar")}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="lunar">Lịch Âm (Giỗ, Rằm...)</option>
                <option value="solar">Lịch Dương</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tần suất lặp
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as "once" | "yearly" | "monthly")}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="yearly">Lặp hàng năm (Giỗ, Sinh nhật)</option>
                <option value="monthly">Lặp hàng tháng (Rằm 15, Mùng 1)</option>
                <option value="once">Chỉ một lần</option>
              </select>
            </div>
          </div>

          <div className={recurrence === "once" ? "grid grid-cols-3 gap-3" : recurrence !== "monthly" ? "grid grid-cols-2 gap-3" : "grid grid-cols-1"}>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Ngày {calendarType === "lunar" ? "(Âm lịch)" : "(Dương lịch)"}
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {recurrence !== "monthly" && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tháng {calendarType === "lunar" ? "(Âm lịch)" : "(Dương lịch)"}
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}

            {recurrence === "once" && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Năm
                </label>
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}
          </div>

          {calendarType === "lunar" && recurrence !== "monthly" && (
            <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer pt-0.5">
              <input
                type="checkbox"
                checked={isLeap}
                onChange={(e) => setIsLeap(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              Sự kiện diễn ra vào tháng nhuận (Leap month)
            </label>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nhắc nhở trước
            </label>
            <select
              value={reminderDaysBefore}
              onChange={(e) => setReminderDaysBefore(Number(e.target.value))}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="0">Đúng ngày</option>
              <option value="1">Trước 1 ngày</option>
              <option value="3">Trước 3 ngày</option>
              <option value="7">Trước 7 ngày (1 tuần)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Ghi chú thêm
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Chuẩn bị lễ vật, địa điểm cúng..."
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm"
            >
              Lưu sự kiện
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
