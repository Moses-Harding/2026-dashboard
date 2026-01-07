# Master Roadmap - 2026 Fitness Dashboard

**Last Updated**: 2026-01-07
**Project Status**: Phase 2 Complete - Ready for Phase 3
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

**Phase**: Phase 3 - Workouts & Habits Tracking
**Status**: Ready to Start
**Previous Phase Completed**: 2026-01-07

---

## Timeline

| Phase | Timeframe | Status | Deliverable |
|-------|-----------|--------|-------------|
| **Brainstorming** | Week 0 (Jan 6, 2026) | ✅ Complete | Comprehensive roadmap with tech stack, database schema, implementation plan |
| **Phase 1: MVP Setup** | Week 1-2 | ✅ Complete | Deployed app with login, dark mode, weight chart |
| **Phase 2: Data Import** | Week 2-3 | ✅ Complete | iOS Shortcuts integration for automated Apple Health sync |
| **Phase 3: Workouts & Habits** | Week 3-4 | 🔜 Next | Exercise tracking, habit checklist, progression charts |
| **Phase 4: Multi-Timeframe** | Week 4-5 | ⏸️ Pending | Sidebar navigation, weekly/monthly/quarterly views |
| **Phase 5: Milestones & Review** | Week 5-6 | ⏸️ Pending | Pre-loaded fitness plan, weekly review dashboard |
| **Phase 6: Polish** | Week 6+ | ⏸️ Pending | Bug fixes, mobile testing, UX improvements |

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
