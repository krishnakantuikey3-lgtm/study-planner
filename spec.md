# Study Planner

## Current State
New project — no existing code.

## Requested Changes (Diff)

### Add
- **Timetable Screen**: User inputs subjects and total daily study hours; app equally divides time among subjects and displays a generated schedule.
- **Task Management Screen**: Daily task list with add, delete, and mark-complete (checkbox) functionality. Shows progress stats: total, completed, remaining tasks.
- **Calendar Screen**: Monthly calendar where each day shows green (all tasks done) or red (incomplete tasks) indicators.
- **Data Persistence**: All subjects, tasks, and calendar progress saved to the backend so data survives app restarts.
- **Dark Mode**: Toggle for light/dark theme.
- **Weekly Progress Report**: Summary of completed vs incomplete tasks over the past 7 days.
- **Progress Tracking**: Stats bar showing total/completed/remaining tasks.

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend (Motoko): Store subjects + daily hours, tasks per day (with completion status), and timetable config. Expose CRUD APIs for subjects, tasks, and timetable.
2. Frontend: Three-tab mobile layout — Timetable, Tasks, Calendar.
   - Timetable tab: subject input form, auto-division display.
   - Tasks tab: date-aware task list, add/delete/complete actions, progress stats.
   - Calendar tab: monthly grid with per-day color indicators, weekly report summary.
3. Dark mode via Tailwind dark class toggle, persisted in localStorage.
4. Mobile-first responsive design.
