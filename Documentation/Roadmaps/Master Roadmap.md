# Master Roadmap - 2026 Fitness Dashboard

**Last Updated**: 2026-01-06
**Project Status**: In Progress - Phase 1
**Target MVP Launch**: Week 6 (mid-February 2026)

---

## Overview

This is the master roadmap for the 2026 Fitness Dashboard web application. Track high-level progress, phases, and key milestones here.

---

## Active Roadmaps

### Major Projects
- [Roadmap: 2026 Fitness Dashboard](./Roadmap-2026%20Fitness%20Dashboard.md) - **Status: In Progress** - Full application roadmap with 6 phases (Currently: Phase 1)

---

## Current Phase

**Phase**: Phase 1 - Project Setup & Today Dashboard 🚧
**Status**: In Progress
**Started**: 2026-01-06

---

## Timeline

| Phase | Timeframe | Status | Deliverable |
|-------|-----------|--------|-------------|
| **Brainstorming** | Week 0 (Jan 6, 2026) | ✅ Complete | Comprehensive roadmap with tech stack, database schema, implementation plan |
| **Phase 1: MVP Setup** | Week 1-2 | 🚧 In Progress | Deployed app with login, dark mode, weight chart |
| **Phase 2: Data Import** | Week 2-3 | ⏸️ Pending | Apple Health auto-import pipeline |
| **Phase 3: Workouts & Habits** | Week 3-4 | ⏸️ Pending | Exercise tracking, habit checklist, progression charts |
| **Phase 4: Multi-Timeframe** | Week 4-5 | ⏸️ Pending | Sidebar navigation, weekly/monthly/quarterly views |
| **Phase 5: Milestones & Review** | Week 5-6 | ⏸️ Pending | Pre-loaded fitness plan, weekly review dashboard |
| **Phase 6: Polish** | Week 6+ | ⏸️ Pending | Bug fixes, mobile testing, UX improvements |

---

## Key Decisions Made

**Tech Stack**:
- Frontend: Next.js 14+ (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Next.js API Routes + Supabase (PostgreSQL)
- Charts: Recharts
- Hosting: Vercel (frontend) + Supabase (database)
- Data Import: Health Auto Export app → API endpoint

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
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
