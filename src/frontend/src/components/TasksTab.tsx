import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ClipboardList, Loader2, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAddTask,
  useDeleteTask,
  useGetProgressStats,
  useGetTasksForDate,
  useRegisterUser,
  useToggleTaskCompletion,
} from "../hooks/useQueries";

interface Props {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

function formatDateFriendly(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function TasksTab({ selectedDate, onDateChange }: Props) {
  const [taskInput, setTaskInput] = useState("");
  const registeredRef = useRef(false);

  const { data: tasks, isLoading: tasksLoading } =
    useGetTasksForDate(selectedDate);
  const { data: stats } = useGetProgressStats(selectedDate, selectedDate);
  const addTaskMutation = useAddTask();
  const deleteTaskMutation = useDeleteTask();
  const toggleMutation = useToggleTaskCompletion();
  const registerMutation = useRegisterUser();

  useEffect(() => {
    if (registeredRef.current) return;
    registeredRef.current = true;
    registerMutation
      .mutateAsync()
      .then(() => {})
      .catch(() => {});
  }, [registerMutation]);

  const handleAddTask = async () => {
    const trimmed = taskInput.trim();
    if (!trimmed) return;
    try {
      await addTaskMutation.mutateAsync({ text: trimmed, date: selectedDate });
      setTaskInput("");
      toast.success("Task added");
    } catch {
      toast.error("Failed to add task");
    }
  };

  const handleDelete = async (taskId: bigint) => {
    try {
      await deleteTaskMutation.mutateAsync({ taskId, date: selectedDate });
      toast.success("Task removed");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleToggle = async (taskId: bigint) => {
    try {
      await toggleMutation.mutateAsync({ taskId, date: selectedDate });
    } catch {
      toast.error("Failed to update task");
    }
  };

  const total = Number(stats?.totalTasks ?? 0);
  const completed = Number(stats?.completedTasks ?? 0);
  const remaining = Number(stats?.remainingTasks ?? 0);
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="py-4 space-y-5 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1">Daily Tasks</h2>
        <p className="text-xs text-muted-foreground">
          Track your study tasks for each day
        </p>
      </div>

      {/* Date Picker */}
      <div className="bg-card rounded-2xl p-4 shadow-card">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-foreground">
            {formatDateFriendly(selectedDate)}
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="text-xs text-muted-foreground bg-transparent border-none outline-none cursor-pointer"
            data-ocid="tasks.input"
          />
        </div>
      </div>

      {/* Progress Stats */}
      {total > 0 && (
        <div className="bg-card rounded-2xl p-4 shadow-card space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">Progress</span>
            <span className="font-bold text-accent">{progressPct}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-accent rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs">
            <div className="text-center">
              <p className="font-bold text-foreground">{total}</p>
              <p className="text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-accent">{completed}</p>
              <p className="text-muted-foreground">Done</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">{remaining}</p>
              <p className="text-muted-foreground">Left</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Task */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a study task..."
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          className="flex-1 rounded-xl border-input h-11"
          data-ocid="tasks.input"
        />
        <Button
          onClick={handleAddTask}
          disabled={addTaskMutation.isPending || !taskInput.trim()}
          className="rounded-xl h-11 px-4 bg-primary text-primary-foreground dark:bg-accent dark:text-accent-foreground"
          data-ocid="tasks.add_button"
        >
          {addTaskMutation.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
        </Button>
      </div>

      {/* Task List */}
      {tasksLoading ? (
        <div
          className="flex justify-center py-8"
          data-ocid="tasks.loading_state"
        >
          <Loader2 className="animate-spin text-muted-foreground" size={24} />
        </div>
      ) : tasks && tasks.length > 0 ? (
        <div className="space-y-2">
          <AnimatePresence>
            {tasks.map((task, i) => (
              <motion.div
                key={String(task.id)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-3"
                data-ocid={`tasks.item.${i + 1}`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleToggle(task.id)}
                  disabled={toggleMutation.isPending}
                  className="rounded-md data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                  data-ocid={`tasks.checkbox.${i + 1}`}
                />
                <span
                  className={`flex-1 text-sm ${
                    task.completed
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {task.text}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  disabled={deleteTaskMutation.isPending}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  data-ocid={`tasks.delete_button.${i + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div
          className="flex flex-col items-center py-12 text-center gap-3"
          data-ocid="tasks.empty_state"
        >
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <ClipboardList size={24} className="text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">No tasks for this day</p>
          <p className="text-xs text-muted-foreground max-w-[200px]">
            Add your first study task above to start tracking your progress
          </p>
        </div>
      )}
    </div>
  );
}
