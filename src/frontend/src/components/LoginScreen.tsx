import { Button } from "@/components/ui/button";
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Moon,
  Sun,
} from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface Props {
  darkMode: boolean;
  onToggleDark: () => void;
}

interface Feature {
  icon: ReactNode;
  text: string;
}

const FEATURES: Feature[] = [
  {
    icon: <BookOpen size={18} />,
    text: "Auto-generated timetable from subjects",
  },
  {
    icon: <CheckCircle2 size={18} />,
    text: "Daily task list with progress tracking",
  },
  {
    icon: <CalendarCheck size={18} />,
    text: "Calendar view with completion status",
  },
  {
    icon: <BarChart3 size={18} />,
    text: "Weekly progress reports & statistics",
  },
];

export default function LoginScreen({ darkMode, onToggleDark }: Props) {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen">
        <header className="flex justify-end px-5 pt-12 pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDark}
            className="rounded-full w-9 h-9"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </header>

        <main className="flex-1 flex flex-col justify-center px-6 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6 shadow-card">
              <BookOpen size={30} className="text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-primary dark:text-foreground mb-2">
              Study Planner
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Organize your study sessions, track daily tasks,
              <br />
              and visualize your progress.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-card rounded-2xl p-5 shadow-card space-y-3"
          >
            {FEATURES.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-sm text-foreground">{f.text}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              onClick={() => login()}
              disabled={isLoggingIn}
              data-ocid="login.primary_button"
              className="w-full h-12 rounded-2xl bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 shadow-card dark:bg-accent dark:text-accent-foreground"
            >
              {isLoggingIn ? "Connecting..." : "Get Started"}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-3">
              Secure login via Internet Identity
            </p>
          </motion.div>
        </main>

        <footer className="text-center py-6 text-xs text-muted-foreground">
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
    </div>
  );
}
