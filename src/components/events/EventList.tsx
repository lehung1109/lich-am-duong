"use client";

import React, { useState } from "react";
import { useCalendarStore, CalendarEvent } from "@/lib/store/useCalendarStore";
import { generateICS } from "@/lib/ical/generator";
import { Trash2, Download, Upload, Plus, Calendar, Pencil } from "lucide-react";
import { EventModal } from "./EventModal";
import { useMounted } from "@/hooks/useMounted";

export function EventList() {
  const mounted = useMounted();
  const { events, deleteEvent, exportEventsJSON, importEvents } = useCalendarStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);

  const handleExportICS = () => {
    const icsString = generateICS(events);
    const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "lich-am-duong-su-kien.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const jsonString = exportEventsJSON();
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sao-luu-su-kien.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importEvents(content);
      if (res.success) {
        alert(`Đã khôi phục thành công ${res.count} sự kiện!`);
      } else {
        alert(`Lỗi: ${res.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 animate-pulse">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mb-4" />
        <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2 mb-8" />
        <div className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Quản Lý Sự Kiện & Lời Nhắc Âm Lịch
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Dữ liệu được lưu trữ an toàn ngay trên trình duyệt của bạn (Local-first).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm mới
          </button>

          <button
            onClick={handleExportICS}
            className="flex items-center gap-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            title="Đồng bộ vào Google Calendar hoặc Apple Calendar"
          >
            <Calendar className="w-4 h-4" /> Xuất iCal (.ics)
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> Sao lưu JSON
          </button>

          <label className="flex items-center gap-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-lg cursor-pointer transition-colors">
            <Upload className="w-4 h-4" /> Nhập JSON
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="py-12 text-center text-zinc-400">
          <p>Chưa có sự kiện nào được tạo.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-3 text-red-600 dark:text-red-400 font-semibold hover:underline text-sm cursor-pointer"
          >
            + Bấm vào đây để tạo ngày giỗ, rằm hoặc sinh nhật âm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex justify-between items-start"
            >
              <div>
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 mb-1.5">
                  {evt.calendarType === "lunar" ? "Lịch Âm" : "Lịch Dương"} -{" "}
                  {evt.recurrence === "yearly"
                    ? "Hàng năm"
                    : evt.recurrence === "monthly"
                    ? "Hàng tháng"
                    : "Một lần"}
                </span>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{evt.title}</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  Ngày {evt.date.day}
                  {evt.date.month ? ` tháng ${evt.date.month}` : ""}
                  {evt.date.year ? ` năm ${evt.date.year}` : ""}
                </p>
                {evt.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 italic">
                    {evt.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingEvent(evt)}
                  className="p-2 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  title="Sửa sự kiện"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteEvent(evt.id)}
                  className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                  title="Xóa sự kiện"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showAddModal || editingEvent) && (
        <EventModal
          isOpen={showAddModal || !!editingEvent}
          onClose={() => {
            setShowAddModal(false);
            setEditingEvent(undefined);
          }}
          eventToEdit={editingEvent}
        />
      )}
    </div>
  );
}
