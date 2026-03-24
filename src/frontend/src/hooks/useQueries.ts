import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useGetSubjects() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (!actor)
        return {
          subjects: [],
          dailyStudyHours: BigInt(0),
          subjectTimeSlots: [] as [string, bigint][],
        };
      const subjects = await actor.getSubjects();
      // Build a timetable-like structure from subjects
      return subjects;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSubject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (subject: string) => {
      if (!actor) throw new Error("No actor");
      return actor.addSubject(subject);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["timetable"] });
    },
  });
}

export function useGetTasksForDate(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tasks", date],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasksForDate(date);
    },
    enabled: !!actor && !isFetching && !!date,
  });
}

export function useAddTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ text, date }: { text: string; date: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.addTask(text, date);
    },
    onSuccess: (_data, { date }) => {
      qc.invalidateQueries({ queryKey: ["tasks", date] });
      qc.invalidateQueries({ queryKey: ["progress"] });
      qc.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, date }: { taskId: bigint; date: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteTask(taskId);
      return date;
    },
    onSuccess: (_data, { date }) => {
      qc.invalidateQueries({ queryKey: ["tasks", date] });
      qc.invalidateQueries({ queryKey: ["progress"] });
      qc.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}

export function useToggleTaskCompletion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, date }: { taskId: bigint; date: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.toggleTaskCompletion(taskId);
      return date;
    },
    onSuccess: (_data, { date }) => {
      qc.invalidateQueries({ queryKey: ["tasks", date] });
      qc.invalidateQueries({ queryKey: ["progress"] });
      qc.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}

export function useGetProgressStats(startDate: string, endDate: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["progress", startDate, endDate],
    queryFn: async () => {
      if (!actor)
        return {
          totalTasks: BigInt(0),
          completedTasks: BigInt(0),
          remainingTasks: BigInt(0),
        };
      return actor.getProgressStats(startDate, endDate);
    },
    enabled: !!actor && !isFetching && !!startDate && !!endDate,
  });
}

export function useGetDailyCompletionStatus(year: number, month: number) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["calendar", year, month],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDailyCompletionStatus(BigInt(year), BigInt(month));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.registerUser();
    },
  });
}
