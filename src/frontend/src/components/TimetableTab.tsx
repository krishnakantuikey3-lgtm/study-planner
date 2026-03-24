import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Clock, Loader2, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { TimetableConfig } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useAddSubject, useGetSubjects } from "../hooks/useQueries";

function formatTime(nanoseconds: bigint): string {
  const totalSeconds = Number(nanoseconds) / 1_000_000_000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

const SUBJECT_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
];

export default function TimetableTab() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: subjects, isLoading: subjectsLoading } = useGetSubjects();
  const addSubjectMutation = useAddSubject();

  const [subjectInput, setSubjectInput] = useState("");
  const [dailyHours, setDailyHours] = useState(8);
  const [timetable, setTimetable] = useState<TimetableConfig | null>(null);

  const loadTimetable = useCallback(async () => {
    if (!actor || actorFetching) return;
    // No-op: timetable is built from addSubject responses
  }, [actor, actorFetching]);

  useEffect(() => {
    loadTimetable();
  }, [loadTimetable]);

  const handleAddSubject = async () => {
    const trimmed = subjectInput.trim();
    if (!trimmed) return;
    try {
      const config = await addSubjectMutation.mutateAsync(trimmed);
      setTimetable(config);
      setSubjectInput("");
      toast.success(`Added "${trimmed}" to timetable`);
    } catch {
      toast.error("Failed to add subject");
    }
  };

  const displaySlots = timetable?.subjectTimeSlots ?? [];
  const displaySubjects =
    timetable?.subjects ?? (subjects as string[] | undefined) ?? [];

  const isLoading = subjectsLoading;

  return (
    <div className="py-4 space-y-5 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1">
          Your Timetable
        </h2>
        <p className="text-xs text-muted-foreground">
          Add subjects to auto-generate your daily schedule
        </p>
      </div>

      {/* Add Subject Form */}
      <div className="bg-card rounded-2xl p-4 shadow-card space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Subject name (e.g. Mathematics)"
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
            className="flex-1 rounded-xl border-input h-11"
            data-ocid="timetable.input"
          />
          <Button
            onClick={handleAddSubject}
            disabled={addSubjectMutation.isPending || !subjectInput.trim()}
            className="rounded-xl h-11 px-4 bg-primary text-primary-foreground dark:bg-accent dark:text-accent-foreground"
            data-ocid="timetable.add_button"
          >
            {addSubjectMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Clock size={14} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Daily study hours
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDailyHours((h) => Math.max(1, h - 1))}
              className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-sm font-bold hover:bg-secondary/80"
            >
              −
            </button>
            <span className="text-sm font-semibold w-8 text-center">
              {dailyHours}h
            </span>
            <button
              type="button"
              onClick={() => setDailyHours((h) => Math.min(24, h + 1))}
              className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-sm font-bold hover:bg-secondary/80"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Timetable Display */}
      {isLoading ? (
        <div
          className="flex justify-center py-8"
          data-ocid="timetable.loading_state"
        >
          <Loader2 className="animate-spin text-muted-foreground" size={24} />
        </div>
      ) : displaySlots.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Daily Schedule
            </h3>
            <span className="text-xs text-muted-foreground">
              {displaySlots.length} subjects
            </span>
          </div>
          <AnimatePresence>
            {displaySlots.map(([subject, timeNs], i) => (
              <motion.div
                key={subject}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-4"
                data-ocid={`timetable.item.${i + 1}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${SUBJECT_COLORS[i % SUBJECT_COLORS.length]}`}
                >
                  {subject.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {subject}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Daily allocation
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-accent">
                    {formatTime(timeNs)}
                  </p>
                  <p className="text-xs text-muted-foreground">per day</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : displaySubjects.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Subjects</h3>
            <span className="text-xs text-muted-foreground">
              {displaySubjects.length} subjects
            </span>
          </div>
          {displaySubjects.map((subject: string, i: number) => (
            <div
              key={subject}
              className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-4"
              data-ocid={`timetable.item.${i + 1}`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${SUBJECT_COLORS[i % SUBJECT_COLORS.length]}`}
              >
                {subject.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">
                  {subject}
                </p>
              </div>
              <BookOpen size={16} className="text-muted-foreground" />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center py-12 text-center gap-3"
          data-ocid="timetable.empty_state"
        >
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <BookOpen size={24} className="text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">No subjects yet</p>
          <p className="text-xs text-muted-foreground max-w-[200px]">
            Add your first subject above to generate your personalized timetable
          </p>
        </div>
      )}
    </div>
  );
}
