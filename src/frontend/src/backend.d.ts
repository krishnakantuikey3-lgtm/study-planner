import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DailyCompletionStatus {
    status: DayIntensity;
    date: string;
}
export type Time = bigint;
export interface TimetableConfig {
    subjects: Array<Subject>;
    dailyStudyHours: bigint;
    subjectTimeSlots: Array<[Subject, Time]>;
}
export interface ProgressStats {
    totalTasks: bigint;
    completedTasks: bigint;
    remainingTasks: bigint;
}
export type Subject = string;
export interface UserProfile {
    name: string;
}
export interface StudyTask {
    id: bigint;
    date: string;
    text: string;
    completed: boolean;
}
export enum DayIntensity {
    red = "red",
    gray = "gray",
    green = "green"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSubject(subject: Subject): Promise<TimetableConfig>;
    addTask(text: string, date: string): Promise<StudyTask>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteTask(taskId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyCompletionStatus(year: bigint, month: bigint): Promise<Array<DailyCompletionStatus>>;
    getProgressStats(startDate: string, endDate: string): Promise<ProgressStats>;
    getSubjects(): Promise<Array<Subject>>;
    getTasksForDate(date: string): Promise<Array<StudyTask>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleTaskCompletion(taskId: bigint): Promise<void>;
}
