import React from "react";
import { format, addDays, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock } from "lucide-react";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h) {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export default function SchedulePicker({ selectedDate, selectedHour, onDateChange, onHourChange }) {
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-primary" />
        <h3 className="font-heading font-semibold text-sm text-foreground">Schedule — 7 Day Forecast</h3>
      </div>

      {/* Day picker */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {days.map((day) => {
          const isSelected = format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
          const isToday = format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateChange(day)}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border transition-all text-xs font-body ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-secondary/50"
              }`}
            >
              <span className="font-heading font-bold text-[10px] uppercase tracking-wider opacity-70">
                {isToday ? "Today" : format(day, "EEE")}
              </span>
              <span className="text-base font-heading font-bold mt-0.5">{format(day, "d")}</span>
              <span className="text-[10px] opacity-60">{format(day, "MMM")}</span>
            </button>
          );
        })}
      </div>

      {/* Hour picker */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs text-muted-foreground font-body">Select time slot</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {HOURS.map((h) => (
            <button
              key={h}
              onClick={() => onHourChange(h)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-heading font-semibold transition-all border ${
                selectedHour === h
                  ? "bg-accent text-accent-foreground border-accent shadow-md shadow-accent/20"
                  : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground bg-secondary/40"
              }`}
            >
              {formatHour(h)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}