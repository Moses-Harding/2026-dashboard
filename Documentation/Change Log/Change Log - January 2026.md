# Change Log - January 2026

**2026 Fitness Dashboard** version history and completed work.

---

## 2026-01-07: Apple Health Workout Import

**Summary**: Added workout import support to iOS Shortcuts sync endpoint.

**Changes**:
- Extended `/api/shortcuts/sync` endpoint to accept workout data from Apple Health
- Added Apple Health workout type mapping (Strength Training → scheduled type, Cardio types → cardio, etc.)
- Strength training workouts automatically map to scheduled workout type based on day (Mon=Chest, Wed=Shoulders, Fri=Volume)
- Workout duration and calories stored, original Apple Health type saved in notes
- Updated Settings page with workout sync instructions

**Files Modified**:
- `src/app/api/shortcuts/sync/route.ts` - Added workout schema fields, mapping function, and save logic
- `src/app/(dashboard)/settings/page.tsx` - Added workout sync instructions

**New API Fields**:
- `workout_type` - Apple Health workout type string (e.g., "Traditional Strength Training")
- `workout_duration` - Duration in minutes
- `workout_calories` - Active calories burned

**Status**: Feature Complete

---

## 2026-01-07: Phase 7 Started - Polish

**Summary**: Started Phase 7 polish work with mobile responsiveness review and bug fix.

**Changes**:
- Added Review page to sidebar and mobile navigation (was missing)
- Verified mobile responsiveness across all components
- Confirmed all forms have proper error handling with toast notifications
- Verified loading skeleton provides smooth page transitions

**Files Modified**:
- `src/components/dashboard/sidebar-nav.tsx` - Added Review nav item

**Review Findings**:
- Build passes with only middleware deprecation warning (non-critical for Next.js 16)
- All responsive layouts use appropriate breakpoints (md:, lg:, sm:)
- Forms use optimistic updates with error reverting
- Charts use ResponsiveContainer for responsive sizing
- Dev server starts in under 700ms

**Status**: Phase 7 In Progress

---

## 2026-01-07: Phase 6 Complete - Performance & Caching

**Summary**: Implemented shared data fetching in dashboard layout for instant page navigation between views.

**Changes**:
- Created DashboardProvider context to share data across all dashboard pages
- Moved common data fetching from individual pages to dashboard layout
- Fetches weight logs (90 days), habit logs, workouts, milestones, and achievements once on layout render
- Created client components (TodayContent, WeekContent) that use shared context data
- Pages now only fetch page-specific data (steps/sleep, nutrition logs)
- Added RefreshButton component for manual data refresh with router.refresh()
- Exported helper hooks: useWeightLogs, useHabitLogs, useWorkouts, useMilestone, useAchievements
- Added optional hook useDashboardOptional for pages outside dashboard context

**Files Added**:
- `src/components/providers/dashboard-provider.tsx`
- `src/components/pages/today-content.tsx`
- `src/components/pages/week-content.tsx`
- `src/components/dashboard/refresh-button.tsx`

**Files Modified**:
- `src/app/(dashboard)/layout.tsx` - Added data fetching and DashboardProvider wrapper
- `src/app/(dashboard)/today/page.tsx` - Refactored to use TodayContent client component
- `src/app/(dashboard)/week/page.tsx` - Refactored to use WeekContent client component

**Technical Decisions**:
- Fetch weight logs 90 days back to cover all timeframe views (daily, weekly, monthly, quarterly)
- Transform workouts array to ensure exercise_sets is always an array (not undefined)
- Use React Context for client-side state (data + isRefreshing)
- Separate concerns: Server fetches in layout, client components consume context
- Month/Quarter pages still fetch their own extended data ranges (not in context yet)
- RefreshButton uses router.refresh() to re-run server data fetching

**Benefits**:
- Navigation between Today and Week pages is now instant (data already loaded)
- Reduced database queries - shared data fetched once per layout render
- Pages share the same data source preventing inconsistencies
- Manual refresh capability for users who want latest data
- Foundation for future real-time subscriptions via Supabase

**Status**: ✅ Phase 6 Complete - Ready for Phase 7 (Polish)

---

## 2026-01-07: Phase 5 Complete - Milestones & Weekly Review

**Summary**: Implemented milestone tracking system with monthly weight and lifting targets, weekly review dashboard, and achievement celebrations.

**Changes**:
- Created database schema: `milestones`, `weekly_reviews`, `achievements` tables with RLS policies
- Built MilestoneCard component showing current month's progress with weight and lifting targets
- Created MilestoneSeed component to initialize 2026 fitness plan with monthly targets
- Built AchievementsList component for displaying earned achievements
- Implemented Confetti celebration component with CSS animations
- Created CelebrationProvider context for app-wide achievement animations
- Built Weekly Review page (/review) with auto-generated weekly summary stats
- Created WeeklyReviewForm component for reflection text inputs
- Implemented /api/milestones endpoint (GET/POST/PATCH) for milestone management
- Implemented /api/reviews endpoint (GET/POST) for weekly review management
- Integrated milestone and achievement indicators into Today dashboard
- Updated database types to match new schema

**Files Added**:
- `supabase/migrations/005_milestones_reviews.sql`
- `src/app/api/milestones/route.ts`
- `src/app/api/reviews/route.ts`
- `src/app/(dashboard)/review/page.tsx`
- `src/components/dashboard/milestone-card.tsx`
- `src/components/dashboard/milestone-seed.tsx`
- `src/components/dashboard/achievements-list.tsx`
- `src/components/forms/weekly-review-form.tsx`
- `src/components/ui/confetti.tsx`
- `src/components/providers/celebration-provider.tsx`

**Technical Decisions**:
- Used JSONB columns for flexible lifting target storage
- Linear progression formula for monthly lifting targets (12 months from start to 2026 goal)
- Lightweight CSS confetti animation instead of external libraries
- Weekly Review page fetches data in parallel for performance
- Sunday weekly review with auto-populated stats from the week

**Status**: ✅ Phase 5 Complete - Ready for Phase 6

---

## 2026-01-07: Phase 4 Complete - Multi-Timeframe Views

**Summary**: Added sidebar navigation and multi-timeframe views for weekly, monthly, and quarterly data analysis.

**Changes**:
- Created sidebar navigation component with active state highlighting
- Added mobile bottom navigation for responsive design
- Built Weekly Trends page (/week) with weight and habit analysis
- Built Monthly Progress page (/month) with lifting progression charts
- Built Quarterly Checkpoints page (/quarter) with year-progress visualization
- Created date utility functions for week/month/quarter calculations
- Fixed timezone issues across all pages (use America/New_York consistently)
- Added loading skeleton component for smooth page navigation

**Files Added**:
- `src/components/dashboard/sidebar-nav.tsx`
- `src/app/(dashboard)/loading.tsx`
- `src/app/(dashboard)/week/page.tsx`
- `src/app/(dashboard)/month/page.tsx`
- `src/app/(dashboard)/quarter/page.tsx`
- `src/lib/utils/dates.ts`

**Technical Decisions**:
- Timezone-aware date handling with getNow() function using America/New_York
- Parallel data fetching for dashboard performance across all views
- Loading skeleton improves perceived performance during navigation
- Mobile-first responsive design with grid layout adjustments

**Status**: ✅ Phase 4 Complete

---

## 2026-01-07: Phase 3 Complete - Workouts & Habits Tracking

**Summary**: Implemented complete workout logging system with exercise-level detail, habit tracking, and progression visualization.

**Changes**:
- Created database schema: `workouts`, `exercise_sets`, `habit_logs` tables with RLS policies
- Built workout logging form with exercise templates and dynamic set input
- Created workout history display component with exercise grouping
- Implemented lifting progression charts per exercise with target reference lines
- Built habit checklist with meditation, journal, and creatine tracking
- Integrated auto-imported sleep and steps data into habit checklist
- Implemented habit streak counter tracking consecutive days
- Created 7-day habit heatmap visualization with color-coded completion intensity
- Integrated all components into Today dashboard with parallel data fetching
- Implemented scheduled workout display based on day of week

**Files Added**:
- `supabase/migrations/004_workouts_habits_tables.sql`
- `src/app/api/workouts/route.ts`
- `src/app/api/habits/route.ts`
- `src/components/forms/workout-form.tsx`
- `src/components/forms/habit-checklist.tsx`
- `src/components/dashboard/workout-history.tsx`
- `src/components/dashboard/habit-heatmap.tsx`
- `src/components/charts/lifting-chart.tsx`
- `src/components/ui/checkbox.tsx`
- `src/lib/constants/workouts.ts`

**Technical Decisions**:
- Parallel data fetching for 6 queries in Today dashboard for performance
- Streak calculation counts any day with meditation OR journal (not requiring all habits)
- Exercise constants include 2026 target weights for progress visualization
- Two-column layout on desktop: habits on left, workout on right

**Status**: ✅ Phase 3 Complete - Ready for Phase 4

---

## 2026-01-07: Phase 2 Complete - Apple Health Data Import via iOS Shortcuts

**Summary**: Implemented complete automated data import system using free iOS Shortcuts instead of paid Health Auto Export app.

**Changes**:
- Created 3 new database tables: `steps_logs`, `sleep_logs`, `nutrition_logs`
- Built API key authentication system with SHA-256 hashing
- Created `/api/health-import` endpoint for automated data import
- Created `/api/shortcuts/sync` endpoint optimized for iOS Shortcuts
- Added Settings page with API key management and setup instructions
- Added sync status indicator to Today dashboard
- Fixed RLS (Row Level Security) bypass for API key authenticated requests
- Fixed SQL variable shadowing bug in `verify_api_key()` function
- Tested and verified iOS Shortcuts integration working with live data sync

**Files Added**:
- `supabase/migrations/002_health_data_tables.sql`
- `supabase/migrations/003_api_keys_table.sql`
- `src/app/api/health-import/route.ts`
- `src/app/api/health-import/batch/route.ts`
- `src/app/api/shortcuts/sync/route.ts`
- `src/app/api/api-keys/generate/route.ts`
- `src/app/(dashboard)/settings/page.tsx`
- `src/components/settings/api-key-manager.tsx`
- `src/components/dashboard/sync-status.tsx`
- `src/lib/supabase/service.ts`
- `src/lib/validations/health-import.ts`
- `src/lib/auth/api-key.ts`

**Decisions Made**:
- Chose iOS Shortcuts (free) over Health Auto Export ($9.99/month) for cost savings
- Used service role key for API endpoints to bypass RLS while maintaining data security
- Implemented Bearer token authentication for Shortcuts compatibility

**Status**: ✅ Phase 2 Complete - Ready for Phase 3

---

## 2026-01-06: Phase 1 Complete - MVP Setup

**Summary**: Initial project setup with authentication, dark mode, and basic weight tracking.

**Changes**:
- Created Next.js 16 project with TypeScript and Tailwind CSS v4
- Set up Supabase PostgreSQL database with RLS policies
- Implemented Supabase authentication (email/password)
- Created login/signup pages
- Configured shadcn/ui component library with dark mode
- Built Today Dashboard with weight tracking chart
- Deployed to Vercel with GitHub integration

**Status**: ✅ Phase 1 Complete
