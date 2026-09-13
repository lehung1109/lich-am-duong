"use client";

import React from "react";
import { useCalendarStore } from "@/lib/store/useCalendarStore";
import { QuickNav } from "@/components/calendar/QuickNav";
import { MonthView } from "@/components/calendar/MonthView";
import { DayBlocCard } from "@/components/calendar/DayBlocCard";
import { UpcomingBanner } from "@/components/events/UpcomingBanner";
import { EventList } from "@/components/events/EventList";
import { DateConverter } from "@/components/converter/DateConverter";

export default function HomePage() {
  const { activeTab } = useCalendarStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {activeTab === "calendar" && (
        <>
          <UpcomingBanner />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Lưới Lịch Tháng (65% width) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <QuickNav />
              <MonthView />
            </div>

            {/* Tờ Lịch Bloc Ngày (35% width) */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-20">
              <DayBlocCard />
            </div>
          </div>
        </>
      )}

      {activeTab === "events" && <EventList />}

      {activeTab === "converter" && <DateConverter />}
    </div>
  );
}
