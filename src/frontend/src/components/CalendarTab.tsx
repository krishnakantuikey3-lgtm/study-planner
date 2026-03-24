import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  useGetDailyCompletionStatus,
  useGetProgressStats,
} from "../hooks/useQueries";

interface Props {
  onDayClick: (date: string) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CalendarTab({ onDayClick }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-based

  const { data: completionData, isLoading } = useGetDailyCompletionStatus(
    year,
    month,
  );

  // Weekly progress (last 7 days)
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  const weekStart = sevenDaysAgo.toISOString().split("T")[0];
  const weekEnd = today.toISOString().split("T")[0];
  const { data: weeklyStats } = useGetProgressStats(weekStart, weekEnd);

  const prevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else setMonth((m) => m + 1);
  };

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const statusMap: Record<string, string> = {};
  if (completionData) {
    for (const item of completionData) {
      statusMap[item.date] = item.status;
    }
  }

  const leadingEmpties = Array.from({ length: firstDay }, (_, i) => i);
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const pad2 = (n: number) => String(n).padStart(2, "0");
  const getDateStr = (day: number) => `${year}-${pad2(month)}-${pad2(day)}`;

  const total = Number(weeklyStats?.totalTasks ?? 0);
  const completed = Number(weeklyStats?.completedTasks ?? 0);
  const remaining = Number(weeklyStats?.remainingTasks ?? 0);
  const weeklyPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const todayStr = today.toISOString().split("T")[0];

  return (
    <div className="py-4 space-y-5 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1">Calendar</h2>
        <p className="text-xs text-muted-foreground">
          Track your daily study completion
        </p>
      </div>

      {/* Calendar Card */}
      <div className="bg-card rounded-2xl p-4 shadow-card">
        {/* Month Nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={prevMonth}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
            data-ocid="calendar.pagination_prev"
          >
            <ChevronLeft size={16} className="text-foreground" />
          </button>
          <h3 className="text-sm font-bold text-foreground">
            {MONTHS[month - 1]} {year}
          </h3>
          <button
            type="button"
            onClick={nextMonth}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
            data-ocid="calendar.pagination_next"
          >
            <ChevronRight size={16} className="text-foreground" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div
              key={d}
              className="text-center text-xs text-muted-foreground font-medium py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        {isLoading ? (
          <div
            className="flex justify-center py-8"
            data-ocid="calendar.loading_state"
          >
            <Loader2 className="animate-spin text-muted-foreground" size={22} />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {leadingEmpties.map((i) => (
              <div key={`empty-${i}`} />
            ))}
            {dayNumbers.map((day) => {
              const dateStr = getDateStr(day);
              const status = statusMap[dateStr];
              const isToday = dateStr === todayStr;

              let cellClass =
                "w-full aspect-square flex items-center justify-center rounded-xl text-xs font-medium transition-all cursor-pointer select-none ";
              if (status === "green") {
                cellClass += "bg-green-500 text-white hover:bg-green-400";
              } else if (status === "red") {
                cellClass += "bg-red-400 text-white hover:bg-red-300";
              } else if (isToday) {
                cellClass +=
                  "bg-primary text-primary-foreground dark:bg-accent dark:text-accent-foreground";
              } else {
                cellClass += "hover:bg-muted text-foreground";
              }

              return (
                <motion.button
                  key={dateStr}
                  type="button"
                  whileTap={{ scale: 0.88 }}
                  onClick={() => onDayClick(dateStr)}
                  className={cellClass}
                  data-ocid={`calendar.item.${day}`}
                >
                  {day}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Complete</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-xs text-muted-foreground">Incomplete</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-muted border border-border" />
            <span className="text-xs text-muted-foreground">No tasks</span>
          </div>
        </div>
      </div>

      {/* Weekly Progress Report */}
      <div className="bg-card rounded-2xl p-4 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Weekly Report</h3>
          <span className="text-xs text-muted-foreground">Last 7 days</span>
        </div>

        <div className="flex justify-between text-center">
          <div>
            <p className="text-xl font-bold text-foreground">{total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-xl font-bold text-accent">{completed}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{remaining}</p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{weeklyPct}%</p>
            <p className="text-xs text-muted-foreground">Rate</p>
          </div>
        </div>

        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${weeklyPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "oklch(var(--accent))" }}
          />
        </div>
      </div>

      <footer className="text-center py-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline hover:text-foreground"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
