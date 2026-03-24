import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { BookOpen, CalendarDays, CheckSquare, Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import CalendarTab from "./components/CalendarTab";
import LoginScreen from "./components/LoginScreen";
import TasksTab from "./components/TasksTab";
import TimetableTab from "./components/TimetableTab";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

type Tab = "timetable" | "tasks" | "calendar";

interface NavTab {
  id: Tab;
  label: string;
  icon: ReactNode;
}

const TABS: NavTab[] = [
  { id: "timetable", label: "Timetable", icon: <BookOpen size={20} /> },
  { id: "tasks", label: "Tasks", icon: <CheckSquare size={20} /> },
  { id: "calendar", label: "Calendar", icon: <CalendarDays size={20} /> },
];

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState<Tab>("timetable");
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split("T")[0],
  );
  const [darkMode, setDarkMode] = useState<boolean>(
    () => localStorage.getItem("darkMode") === "true",
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  const handleCalendarDayClick = (date: string) => {
    setSelectedDate(date);
    setActiveTab("tasks");
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-accent border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <LoginScreen
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen relative">
        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-12 pb-4 bg-background sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-primary dark:text-foreground">
              Study Planner
            </h1>
            <p className="text-xs text-muted-foreground">
              Stay focused, stay ahead
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode((d) => !d)}
            className="rounded-full w-9 h-9"
            data-ocid="app.toggle"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-24 px-4">
          {activeTab === "timetable" && <TimetableTab />}
          {activeTab === "tasks" && (
            <TasksTab
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          )}
          {activeTab === "calendar" && (
            <CalendarTab onDayClick={handleCalendarDayClick} />
          )}
        </main>

        {/* Bottom Navigation */}
        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border flex z-20"
          style={{ boxShadow: "0 -4px 20px rgba(15,46,74,0.08)" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              data-ocid={`nav.${tab.id}.link`}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
