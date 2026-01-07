# Master Roadmap - 2026 Fitness Dashboard

**Last Updated**: 2026-01-07
**Project Status**: Phase 6 Complete - Ready for Phase 7
**Target MVP Launch**: Week 6 (mid-February 2026)
**Live URL**: https://2026-dashboard.vercel.app

---

## Overview

This is the master roadmap for the 2026 Fitness Dashboard web application. Track high-level progress, phases, and key milestones here.

---

## Active Roadmaps

### Major Projects
- [Roadmap: 2026 Fitness Dashboard](./Roadmap-2026%20Fitness%20Dashboard.md) - **Status: In Progress** - Full application roadmap with 6 phases (Currently: Phase 2)

---

## Current Phase

**Phase**: Phase 7 - Polish
**Status**: Ready to Start
**Previous Phase Completed**: 2026-01-07 (Phase 6 - Performance & Caching)

---

## Timeline

| Phase | Timeframe | Status | Deliverable |
|-------|-----------|--------|-------------|
| **Brainstorming** | Week 0 (Jan 6, 2026) | ✅ Complete | Comprehensive roadmap with tech stack, database schema, implementation plan |
| **Phase 1: MVP Setup** | Week 1-2 | ✅ Complete | Deployed app with login, dark mode, weight chart |
| **Phase 2: Data Import** | Week 2-3 | ✅ Complete | iOS Shortcuts integration for automated Apple Health sync |
| **Phase 3: Workouts & Habits** | Week 3-4 | ✅ Complete | Exercise tracking, habit checklist, progression charts |
| **Phase 4: Multi-Timeframe** | Week 3-4 | ✅ Complete | Sidebar navigation, weekly/monthly/quarterly views |
| **Phase 5: Milestones & Review** | Week 5 | ✅ Complete | Pre-loaded fitness plan, weekly review dashboard |
| **Phase 6: Performance & Caching** | Week 6 | ✅ Complete | Shared data fetching in layout, instant page navigation |
| **Phase 7: Polish** | Week 6+ | 🔄 In Progress | Bug fixes, mobile testing, UX improvements |

---

## Key Decisions Made

**Tech Stack**:
- Frontend: Next.js 16+ (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui
- Backend: Next.js API Routes + Supabase (PostgreSQL)
- Charts: Recharts
- Hosting: Vercel (frontend) + Supabase (database)
- Data Import: iOS Shortcuts (free) → `/api/shortcuts/sync` endpoint

**Design Direction**:
- Dark mode, minimalist aesthetic (Apple Fitness+ inspired)
- Sidebar navigation (not tabs or single-page scroll)
- Automated data import with manual entry fallback

**Core Features**:
- Multi-timeframe views (Daily, Weekly, Monthly, Quarterly)
- Exercise-level workout tracking (sets/reps/weight)
- Automated Apple Health data import (weight, steps, sleep, nutrition)
- Pre-loaded 2026 fitness plan milestones (editable)
- Weekly review dashboard with auto-generated summaries

---

## Risks & Open Questions

**Risks**:
- Learning curve for web stack (mitigated by similar patterns to SwiftUI)
- Health Auto Export reliability (mitigated by manual entry fallback)
- LoseIt API limitations (mitigated by Apple Health intermediary)

**Open Questions**:
- None currently (all decisions made during brainstorming)

---

## Completed

### Research Phase ✅
- [x] Investigated fitness dashboard UX best practices
- [x] Researched Apple Health data export options
- [x] Researched modern web stacks for iOS developers
- [x] Decided on tech stack (Next.js + TypeScript + Supabase)
- [x] Chose design aesthetic (dark, minimalist)
- [x] Defined MVP scope and phases

### Phase 1: MVP Setup ✅ (Completed 2026-01-06)
- [x] Install pnpm package manager
- [x] Create Next.js project with TypeScript and Tailwind
- [x] Set up Supabase project and database schema
- [x] Install and configure shadcn/ui components
- [x] Set up dark mode and base styling
- [x] Create authentication pages (login/signup)
- [x] Build Today Dashboard with weight chart
- [x] Deploy to Vercel
- [x] Push code to GitHub

### Phase 2: Apple Health Data Import ✅ (Completed 2026-01-07)
- [x] Create health data tables (steps_logs, sleep_logs, nutrition_logs)
- [x] Build API key authentication system with SHA-256 hashing
- [x] Create `/api/health-import` endpoint with Zod validation
- [x] Create `/api/shortcuts/sync` endpoint (iOS Shortcuts optimized)
- [x] Create Settings page with API key management
- [x] Add sync status indicator to Today dashboard
- [x] Test iOS Shortcuts integration with live data sync
- [x] Fixed RLS bypass issue for API key authenticated requests
- [x] Deployed to production and verified working

### Phase 3: Workouts & Habits Tracking ✅ (Completed 2026-01-07)
- [x] Create database schema (workouts, exercise_sets, habit_logs tables)
- [x] Build workout logging form with exercise-level detail (sets/reps/weight)
- [x] Create workout history display component
- [x] Build lifting progression charts per exercise with target reference lines
- [x] Create habit checklist component (meditation, journal, creatine)
- [x] Implement habit streak counter
- [x] Build 7-day habit heatmap visualization
- [x] Integrate all components into Today dashboard
- [x] Implement parallel data fetching for dashboard performance

### Phase 4: Multi-Timeframe Views ✅ (Completed 2026-01-07)
- [x] Create sidebar navigation with active state highlighting
- [x] Add mobile bottom navigation for small screens
- [x] Build Weekly Trends page (/week)
- [x] Build Monthly Progress page (/month)
- [x] Build Quarterly Checkpoints page (/quarter)
- [x] Add date utility functions for week/month/quarter calculations
- [x] Fix timezone issues (use America/New_York)
- [x] Add loading skeleton for smoother navigation

### Phase 5: Milestones & Weekly Review ✅ (Completed 2026-01-07)
- [x] Create milestones database table with monthly targets
- [x] Create weekly_reviews table for Sunday reflections
- [x] Create achievements table for tracking accomplishments
- [x] Build MilestoneCard component showing progress
- [x] Build MilestoneSeed component to initialize 2026 plan
- [x] Build AchievementsList component for earned badges
- [x] Create Confetti celebration animation component
- [x] Build Weekly Review page (/review) with auto-generated stats
- [x] Create WeeklyReviewForm for reflection inputs
- [x] Implement /api/milestones endpoint (GET/POST/PATCH)
- [x] Implement /api/reviews endpoint (GET/POST)
- [x] Integrate milestone and achievement indicators into Today dashboard

### Phase 6: Performance & Caching ✅ (Completed 2026-01-07)
- [x] Create DashboardProvider context for shared data
- [x] Move common data fetching from pages to layout
- [x] Fetch weight logs (90 days), habit logs, workouts, milestones, achievements in layout
- [x] Create client components (TodayContent, WeekContent) that use context
- [x] Refactor pages to only fetch page-specific data
- [x] Create RefreshButton component for manual data refresh
- [x] Export helper hooks (useWeightLogs, useHabitLogs, useWorkouts, etc.)
- [x] Ensure workout data properly typed with exercise_sets array
- [x] Use React Context for data + isRefreshing state
- [x] Navigation between Today and Week pages is instant

---

## Notes

**Project Philosophy**:
- Mobile-first (iPhone is primary device)
- Automation over manual entry (minimize friction)
- Big picture over details (see trends, not just today's data)
- Progress visualization (charts motivate consistency)

**Success Criteria**:
- MVP deployed and usable within 6 weeks
- Daily dashboard checks < 30 seconds
- 90%+ data auto-imported after Phase 2
- Helps achieve Q1 weight target (214 lbs by March)

---

## Resources

- [Full Roadmap](./Roadmap-2026%20Fitness%20Dashboard.md)
- [GitHub Repository](https://github.com/Moses-Harding/2026-dashboard)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
