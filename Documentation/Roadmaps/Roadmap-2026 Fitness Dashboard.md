# Roadmap: 2026 Fitness Dashboard Web App

**Status**: In Progress
**Created**: 2026-01-06
**Started**: 2026-01-06
**Type**: Full Application Roadmap
**Target Launch**: MVP in 4-6 weeks
**Current Phase**: Phase 5 - Milestones & Review

---

## Executive Summary

Build a modern, dark-themed web application that transforms your comprehensive 2026 fitness plan into an interactive dashboard with automated data import, multi-timeframe progress visualization, and milestone tracking. Coming from iOS development, you'll use a modern web stack (Next.js + TypeScript + Tailwind + shadcn/ui) that mirrors familiar patterns from SwiftUI while learning web development best practices.

**Core Value Proposition**: See the big picture of your fitness journey. Automatically import data from Apple Health and LoseIt, visualize progress across daily/weekly/monthly/quarterly timeframes, and track whether you're on pace to hit your 220→195 lbs goal with specific lifting milestones.

---

## Problem Statement

**Pain Point**: You have a detailed 12-month fitness plan with daily habits, weekly workouts, monthly weight/lifting goals, and quarterly checkpoints. Currently tracking data across multiple apps (LoseIt for nutrition, Apple Watch for steps/sleep, paper checklist for workouts), but **you can't see the big picture** - whether you're on track toward quarterly goals, how lifting progression compares to targets, or weekly habit consistency patterns.

**Current Workaround**: Manually review data across multiple apps, mentally calculate whether you're on pace, check paper workout logs against target weights.

**Impact**: Daily friction and missing the forest for the trees. Hard to stay motivated without seeing tangible progress visualization. Risk of drifting off-plan without realizing it until a monthly weigh-in reveals you're behind.

---

## Research Summary

### Industry Approaches to Fitness Progress Tracking

**Best Practices Identified**:
1. **"Today at a glance" dashboard** - Top metrics prominently displayed with line charts showing trends ([source: FusionCharts](https://www.fusioncharts.com/blog/10-inspiring-fitness-app-dashboards/))
2. **Multi-timeframe visualization** - Calendar heatmaps for daily habits, line charts for weekly trends, performance manager charts for seasonal progress ([source: TrainingPeaks](https://www.trainingpeaks.com/blog/the-top-7-dashboard-charts-for-coaches/))
3. **Visual motivation elements** - Streak counters, progress bars, achievement badges, trend indicators like "+15% since last month" ([source: Zfort Group](https://www.zfort.com/blog/How-to-Design-a-Fitness-App-UX-UI-Best-Practices-for-Engagement-and-Retention))
4. **Minimal cognitive load** - Show 3-5 key metrics prominently, use color intensity to encode data, keep it glanceable ([source: UX Matters](https://www.uxmatters.com/mt/archives/2025/07/designing-a-fitness-platform-ux-design-challenges-and-solutions.php))

**Key Insight**: Research shows that 30% higher continued usage for fitness apps with customizable interfaces, and 40% boost in engagement with personalized progress notifications ([source: Nielsen Norman Group via Zfort](https://www.zfort.com/blog/How-to-Design-a-Fitness-App-UX-UI-Best-Practices-for-Engagement-and-Retention)).

### Data Integration Research

**Apple Health Export**:
- Native XML export available
- **Third-party solution**: Health Auto Export app can automatically export to CSV/JSON and POST to HTTP endpoints
- **Chosen approach**: Build API endpoint to receive automated Apple Health data pushes

**LoseIt Integration**:
- Limited public API (Validic offers developer integration)
- Most integrations are one-way (LoseIt pulls data, doesn't export easily)
- **Alternative**: Export LoseIt data to Apple Health, then use Health Auto Export to your web app

### Web Stack for iOS Developers

**Recommended Modern Stack** ([source: Robin Wieruch](https://www.robinwieruch.de/react-tech-stack/), [Wisp CMS](https://www.wisp.blog/blog/what-nextjs-tech-stack-to-try-in-2025-a-developers-guide-to-modern-web-development)):
- **Next.js 14+**: React framework with server-side rendering, routing, API routes (similar to SwiftUI's declarative approach)
- **TypeScript**: Type safety like Swift, better developer experience
- **Tailwind CSS**: Utility-first CSS (fast like SwiftUI modifiers)
- **shadcn/ui**: Pre-built components with dark mode built-in, copy-paste approach ([source: shadcn/ui docs](https://ui.shadcn.com/docs/dark-mode))
- **Supabase**: PostgreSQL database with real-time features, authentication, storage
- **Recharts/Chart.js**: Data visualization libraries for React

---

## Solution Design

### Overview

A single-page web application with sidebar navigation, dark minimalist aesthetic (Apple Fitness+ inspired), and four main views:

1. **Today Dashboard** (default view)
2. **Weekly Trends**
3. **Monthly Progress**
4. **Quarterly Checkpoints**

Data flows automatically from Apple Health → Health Auto Export app → Your API endpoint → Supabase database → Dashboard visualizations.

### User Flow

**Initial Setup Flow**:
1. User creates account (email/password via Supabase Auth)
2. App presents onboarding: "Load your 2026 fitness plan"
3. User confirms plan details (220→195 lbs, start date, monthly milestones)
4. App generates 12 months of milestone data
5. Instructions shown: "Install Health Auto Export app and configure API endpoint"
6. User completes mobile setup, data begins flowing

**Daily Usage Flow**:
1. Open dashboard (default: Today view)
2. See at-a-glance: today's weight trend, nutrition progress (auto-imported), workout due, habit checklist
3. Manually check off habits: meditation, journal, creatine (simple checkboxes)
4. Click "Log Workout" → select workout type → enter exercise details (sets/reps/weight)
5. Charts update in real-time showing progression
6. Navigate to Weekly/Monthly/Quarterly views via sidebar to see big picture

**Sunday Weekly Review Flow**:
1. On Sundays, "Weekly Review" badge appears in sidebar
2. Click to see automated review dashboard:
   - Weekly weight average vs target
   - Workout completion % (5/5 workouts done?)
   - Nutrition adherence (hit calorie/protein targets?)
   - Habit streak status
3. Add notes: "What went well?" "What to adjust?"
4. Save review, continue to next week

### Key Behaviors

**Data Import (Automated)**:
- Every 1-6 hours, Health Auto Export pushes data to `/api/health-import` endpoint
- Endpoint validates data, stores in Supabase
- Imports: weight measurements, steps, sleep hours, nutrition (if LoseIt syncs to Apple Health)

**Data Entry (Manual)**:
- Habits: Simple checkbox per habit per day, shows streak counter
- Workouts: Select workout template (e.g., "Chest & Triceps"), log each exercise with sets/reps/weight
- Notes: Optional daily notes field

**Progress Tracking**:
- Weight: Line chart with weekly average overlay, trend line toward goal, monthly target indicators
- Lifting: Per-exercise charts showing weight progression, monthly milestone markers
- Habits: Calendar heatmap (7-day grid), color intensity = completion rate
- Nutrition: Bar chart of daily calories/protein with target lines

**Milestone Alerts**:
- When current weight is within 2-3 lbs of monthly target: green "On Track" indicator
- When behind pace: yellow "Adjust Plan?" suggestion
- When lifting milestone hit: celebration animation + badge

**Responsive Design**:
- Desktop: Sidebar navigation, multi-column layouts for charts
- Mobile: Bottom tab navigation, single-column stacked views
- PWA-ready: Can install to home screen for app-like experience

---

## Technical Implementation

### Tech Stack

**Frontend**:
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts (React charting library)
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand (lightweight state management)

**Backend**:
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes
- **Real-time**: Supabase real-time subscriptions (optional)

**Hosting**:
- **Frontend/API**: Vercel (free tier, auto-deploys from Git)
- **Database**: Supabase (free tier: 500 MB, 2 GB bandwidth)

**Development Tools**:
- **Package Manager**: pnpm
- **Version Control**: Git + GitHub
- **Code Quality**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode

### Database Schema

**Tables**:

```sql
-- Users (managed by Supabase Auth)
users (
  id UUID PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP
)

-- Fitness plan milestones (pre-loaded)
milestones (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  month INTEGER, -- 1-12
  year INTEGER, -- 2026
  target_weight DECIMAL,
  target_lifts JSONB, -- {"flat_db_press": 50, "curls": 30}
  created_at TIMESTAMP
)

-- Daily weight measurements (auto-imported)
weight_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE,
  weight DECIMAL,
  source TEXT, -- 'apple_health', 'manual'
  created_at TIMESTAMP,
  UNIQUE(user_id, date)
)

-- Daily nutrition (auto-imported from Apple Health)
nutrition_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE,
  calories INTEGER,
  protein INTEGER,
  fiber INTEGER,
  source TEXT, -- 'loseit_via_apple_health', 'manual'
  created_at TIMESTAMP,
  UNIQUE(user_id, date)
)

-- Daily habit tracking (manual checkboxes)
habit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE,
  sleep_hours DECIMAL, -- auto-imported
  steps INTEGER, -- auto-imported
  meditation BOOLEAN, -- manual
  journal BOOLEAN, -- manual
  creatine BOOLEAN, -- manual
  created_at TIMESTAMP,
  UNIQUE(user_id, date)
)

-- Workouts (manual entry)
workouts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE,
  workout_type TEXT, -- 'chest_triceps', 'shoulders_biceps', 'volume', 'cardio'
  completed BOOLEAN,
  notes TEXT,
  created_at TIMESTAMP
)

-- Exercise sets (manual entry)
exercise_sets (
  id UUID PRIMARY KEY,
  workout_id UUID REFERENCES workouts(id),
  exercise_name TEXT, -- 'flat_db_press', 'curls', etc.
  set_number INTEGER,
  reps INTEGER,
  weight DECIMAL,
  created_at TIMESTAMP
)

-- Weekly reviews (manual notes)
weekly_reviews (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  week_start_date DATE,
  went_well TEXT,
  needs_adjustment TEXT,
  created_at TIMESTAMP,
  UNIQUE(user_id, week_start_date)
)
```

### API Endpoints

**Public Endpoints**:
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

**Protected Endpoints** (require auth):
- `POST /api/health-import` - Receive Apple Health data from Health Auto Export app
  - Request body: `{type: 'weight' | 'steps' | 'sleep' | 'nutrition', date: 'YYYY-MM-DD', value: number}`
  - Validates API key (configured in Health Auto Export app)
  - Inserts into appropriate table
- `GET /api/dashboard/today` - Today's data (weight, nutrition, habits, workout due)
- `GET /api/dashboard/week?start_date=YYYY-MM-DD` - Weekly trends
- `GET /api/dashboard/month?month=1&year=2026` - Monthly progress
- `GET /api/dashboard/quarter?quarter=1&year=2026` - Quarterly checkpoint
- `POST /api/workouts` - Log workout
- `POST /api/habits` - Update habit checkboxes
- `POST /api/reviews` - Save weekly review

### File Structure

```
2026-dashboard/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx         // Sidebar + layout
│   │   │   ├── today/
│   │   │   │   └── page.tsx       // Today Dashboard
│   │   │   ├── week/
│   │   │   │   └── page.tsx       // Weekly Trends
│   │   │   ├── month/
│   │   │   │   └── page.tsx       // Monthly Progress
│   │   │   ├── quarter/
│   │   │   │   └── page.tsx       // Quarterly Checkpoints
│   │   │   └── review/
│   │   │       └── page.tsx       // Weekly Review
│   │   ├── api/
│   │   │   ├── health-import/
│   │   │   │   └── route.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── today/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── week/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── month/
│   │   │   │   │   └── route.ts
│   │   │   │   └── quarter/
│   │   │   │       └── route.ts
│   │   │   ├── workouts/
│   │   │   │   └── route.ts
│   │   │   ├── habits/
│   │   │   │   └── route.ts
│   │   │   └── reviews/
│   │   │       └── route.ts
│   │   ├── layout.tsx             // Root layout (dark mode provider)
│   │   └── page.tsx               // Landing page
│   ├── components/
│   │   ├── ui/                    // shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── ...
│   │   ├── charts/
│   │   │   ├── weight-chart.tsx
│   │   │   ├── lifting-chart.tsx
│   │   │   ├── habit-heatmap.tsx
│   │   │   └── nutrition-chart.tsx
│   │   ├── dashboard/
│   │   │   ├── stat-card.tsx      // Reusable metric card
│   │   │   ├── milestone-tracker.tsx
│   │   │   └── streak-counter.tsx
│   │   └── forms/
│   │       ├── workout-form.tsx
│   │       └── habit-checklist.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          // Supabase client
│   │   │   └── server.ts          // Server-side Supabase
│   │   ├── utils.ts               // Utility functions
│   │   └── constants.ts           // Exercise names, workout types
│   ├── types/
│   │   └── index.ts               // TypeScript types
│   └── styles/
│       └── globals.css            // Tailwind imports
├── public/
│   └── images/
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### Patterns to Follow

**Component Structure** (similar to SwiftUI Views):
```typescript
// Today Dashboard page
'use client'

import { StatCard } from '@/components/dashboard/stat-card'
import { WeightChart } from '@/components/charts/weight-chart'
import { HabitChecklist } from '@/components/forms/habit-checklist'

export default function TodayPage() {
  // Fetch data (similar to @State in SwiftUI)
  const { data, isLoading } = useTodayData()

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {/* Stats row - like HStack */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Current Weight" value={data.weight} target={data.targetWeight} />
        <StatCard title="Calories Today" value={data.calories} target={1800} />
        <StatCard title="Workout Status" value={data.workoutCompleted ? 'Done' : 'Pending'} />
      </div>

      {/* Charts */}
      <WeightChart data={data.weightHistory} />

      {/* Habits */}
      <HabitChecklist habits={data.habits} onUpdate={updateHabits} />
    </div>
  )
}
```

**Dark Mode Setup** (using shadcn/ui pattern):
```typescript
// app/layout.tsx
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="dark"> {/* Force dark mode */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Data Fetching Pattern** (Next.js App Router):
```typescript
// Server Component (default in App Router)
export default async function MonthPage({ searchParams }: { searchParams: { month: string, year: string } }) {
  // Fetch data server-side (like async/await in Swift)
  const data = await getMonthlyData(searchParams.month, searchParams.year)

  return <MonthlyProgressView data={data} />
}

// Or use Client Component with React Query for client-side fetching
'use client'
export function useTodayData() {
  return useQuery({
    queryKey: ['today'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/today')
      return res.json()
    }
  })
}
```

---

## Edge Cases & Error Handling

| Scenario | Expected Behavior | Implementation Notes |
|----------|-------------------|---------------------|
| **No weight data for today** | Show last known weight with "(Yesterday)" label. Prompt to weigh in. | Query last weight_log entry, display with timestamp |
| **Missed workout day** | Show red "Missed" indicator on calendar. Allow retroactive logging. | workout.completed = false, allow date picker to log past workouts |
| **Apple Health sync fails** | Show "Last synced: 2 hours ago" warning. Provide manual entry form. | Track last_import timestamp, show warning if > 6 hours |
| **First day of plan** | No historical data for charts. Show "Start tracking today!" message. | Check if user has < 7 days of data, show onboarding message |
| **Weight measurement fluctuation** | Use weekly average for progress calculation. Show daily as dots, weekly as line. | Calculate 7-day rolling average for trend line |
| **Exercise not in predefined list** | Allow custom exercise name entry. Save to user's exercise library. | exercises table with user_id + name, autocomplete from past entries |
| **Weekly review not completed** | Show "Incomplete" badge. Persist in sidebar until completed. | weekly_reviews.completed BOOLEAN, show banner |
| **Milestone achieved** | Show celebration modal with confetti animation. Save badge. | Check after each weight/workout log, trigger modal |
| **Mobile browser without PWA** | App still works fully, just no home screen icon. | No special handling needed, progressive enhancement |
| **User ahead of schedule** | Show "Ahead of pace!" indicator. Suggest maintaining current approach. | If current weight < target for month, show green badge |
| **User behind schedule** | Show "Behind pace" warning. Offer to adjust plan or increase deficit. | If current weight > target + 3 lbs, show adjustment prompt |
| **Data import duplicate** | Upsert based on (user_id, date). Keep most recent value. | Use Supabase upsert with UNIQUE constraint |
| **Invalid API request** | Return 400 with clear error message. Log for debugging. | Validate with Zod schema, return typed errors |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| **Health Auto Export app reliability** | Provide manual entry fallback for all imported data. Show sync status prominently. |
| **LoseIt doesn't sync to Apple Health** | Document how to enable LoseIt → Apple Health sync. Provide CSV import as backup. |
| **User abandons plan mid-year** | Allow plan editing (adjust targets). Show progress even if off-plan. |
| **Data privacy concerns** | Store data in Supabase (GDPR compliant). Add data export feature. No third-party analytics. |
| **Learning curve for web stack** | Start with Next.js official tutorial. Use shadcn/ui docs heavily. Leverage ChatGPT for React patterns. |
| **Scope creep** | Focus on MVP first: Today dashboard + data import + weight chart. Add features incrementally. |
| **Mobile UX on small screens** | Test on iPhone from day 1. Use Tailwind responsive utilities (`md:`, `lg:`). |
| **Free tier limits (Supabase 500 MB)** | 1 year of daily data ≈ 10 KB. Well within limits. Can upgrade to $25/mo if needed. |

---

## Acceptance Criteria

When this project is complete, you will be able to:

**Phase 1: MVP (Week 1-2)**
- [ ] Create account and login
- [ ] See Today Dashboard with sample data
- [ ] Dark mode aesthetic (minimalist, Apple Fitness+ inspired)
- [ ] Weight chart displaying last 30 days
- [ ] Manual weight entry form
- [ ] Deployed to Vercel (accessible via URL)

**Phase 2: Data Import (Week 2-3)**
- [ ] API endpoint receives Apple Health data
- [ ] Health Auto Export app configured and pushing data
- [ ] Weight and steps auto-populate in dashboard
- [ ] Manual entry fallback for all metrics
- [ ] Sync status indicator shows last import time

**Phase 3: Workouts & Habits (Week 3-4)**
- [ ] Log workout with exercise-level detail (sets/reps/weight)
- [ ] Habit checklist with checkboxes (meditation, journal, creatine)
- [ ] Workout templates pre-loaded (Chest & Triceps, etc.)
- [ ] Lifting progression chart per exercise
- [ ] Habit streak counter

**Phase 4: Multi-Timeframe Views (Week 4-5)**
- [ ] Sidebar navigation functional
- [ ] Weekly Trends view with 7-day data
- [ ] Monthly Progress view with milestone tracking
- [ ] Quarterly Checkpoints view
- [ ] All views responsive on mobile

**Phase 5: Milestones & Reviews (Week 5-6)**
- [ ] 2026 plan milestones pre-loaded in database
- [ ] Monthly targets editable by user
- [ ] "On track" / "Behind pace" indicators
- [ ] Weekly Review dashboard (Sundays)
- [ ] Weekly review notes saved

**Quality Criteria** (All Phases):
- [ ] No compiler errors or TypeScript warnings
- [ ] Mobile-responsive (tested on iPhone)
- [ ] Dark mode consistent across all views
- [ ] Loading states for all async data
- [ ] Error handling for failed API calls
- [ ] Data persists across sessions

---

## Out of Scope (Future Enhancements)

**V2 Features** (Post-MVP):
- Social features (share progress, compare with friends)
- AI-powered insights ("You're strongest on Mondays")
- Workout video library
- Meal planning integration
- Photo progress tracking (before/after)
- Integration with Strong app (import workouts)
- Apple Watch companion app
- Push notifications (weekly review reminder)
- Advanced charts (body measurements, 1RM calculators)
- Export data to CSV/PDF

**Won't Build**:
- Native mobile apps (web-first approach)
- Complex meal tracking (use LoseIt for that)
- Workout programming (plan is already defined)
- Social network features (not a community app)

---

## Implementation Phases (Detailed)

### Phase 1: Project Setup & Today Dashboard (Week 1-2)

**Goals**: Get development environment running, deploy basic app with dark mode and weight chart.

**Tasks**:
1. **Environment Setup**
   - Install Node.js 20+, pnpm
   - Create Next.js 14 project: `pnpm create next-app@latest 2026-dashboard --typescript --tailwind --app`
   - Initialize Git repo, push to GitHub
   - Create Vercel account, connect GitHub repo (auto-deploy on push)
   - Create Supabase project (free tier)

2. **Dark Mode & UI Foundation**
   - Install shadcn/ui: `pnpm dlx shadcn-ui@latest init`
   - Configure Tailwind for dark mode (force dark theme in layout)
   - Set up color palette (minimalist: grays + accent color)
   - Create root layout with dark background
   - Install Recharts: `pnpm add recharts`

3. **Database Schema**
   - Write SQL migration for initial tables (users, weight_logs, milestones)
   - Run migration in Supabase dashboard
   - Create TypeScript types matching schema

4. **Authentication**
   - Set up Supabase Auth (email/password)
   - Create login/signup pages
   - Add middleware for protected routes
   - Test: Create account, login, logout

5. **Today Dashboard (Static)**
   - Create `/today` page with placeholder data
   - Build StatCard component (reusable metric display)
   - Build WeightChart component (line chart with Recharts)
   - Layout: 3-column stat cards + chart below
   - Test on mobile (responsive)

6. **Manual Weight Entry**
   - Create weight entry form (date picker + number input)
   - POST to `/api/weight` endpoint
   - Insert into weight_logs table
   - Refresh chart after submission
   - Test: Enter weight, see chart update

**Deliverable**: Deployed app at `2026-dashboard.vercel.app` with functional login and weight tracking.

---

### Phase 2: Apple Health Data Import ✅ (Week 2-3) - COMPLETED

**Goals**: Automate data flow from Apple Health to dashboard.

**Decision**: Replaced Health Auto Export (paid $9.99/month) with iOS Shortcuts (free, built-in).

**Completed Tasks**:
1. ✅ **API Endpoint for Health Data** - `/api/health-import` POST endpoint
   - Accepts payload: `{type: 'weight' | 'steps' | 'sleep' | 'nutrition', date, value, api_key}`
   - Zod schema validation for all data types
   - Upserts to appropriate tables (handles duplicates)

2. ✅ **iOS Shortcuts Integration** - `/api/shortcuts/sync` endpoint
   - Optimized for iOS Shortcuts (simpler payload format)
   - Authorization: Bearer token in header
   - Accepts: weight, steps, sleep, calories, protein, carbs, fat
   - Date defaults to today if not specified

3. ✅ **API Key Authentication**
   - Created `api_keys` table with SHA-256 hashed keys
   - `verify_api_key()` RPC function for secure validation
   - API key generation with one-time display

4. ✅ **Settings Page**
   - API key management interface
   - Generate/view/manage API keys
   - Step-by-step Shortcuts setup guide with action instructions
   - Health data import instructions

5. ✅ **Sync Status Indicator**
   - Displays last sync time across all data types
   - Color-coded status (green: <24h, yellow: 24-48h, red: 48+h)
   - Shows "Last synced: {timestamp}" on dashboard

6. ✅ **Health Data Tables**
   - steps_logs (daily step count)
   - sleep_logs (sleep duration in hours)
   - nutrition_logs (calories, protein, carbs, fat)
   - Row Level Security (RLS) on all tables

7. ✅ **Bug Fixes**
   - Fixed RLS bypass for API key authenticated requests (service role client)
   - Fixed SQL variable shadowing in verify_api_key function

**Deliverable**: Fully automated, free data pipeline from iPhone to dashboard via iOS Shortcuts.

---

### Phase 3: Workouts & Habits Tracking ✅ (Completed 2026-01-07)

**Goals**: Log workouts with exercise detail, track daily habits.

**Completed Tasks**:
1. ✅ **Database Tables**
   - Created `workouts`, `exercise_sets`, `habit_logs` tables with RLS policies
   - Defined 12 exercises as constants with 2026 target weights
   - Created workout templates: Chest & Triceps, Shoulders & Biceps, Volume Day, Cardio, Active Rest

2. ✅ **Workout Logging Form**
   - Built WorkoutForm component with dialog interface
   - Workout type selector with dynamic exercise list
   - Exercise inputs with set/rep/weight tracking (up to 6 sets per exercise)
   - POST to `/api/workouts` with full validation
   - Inserts workout + exercise_sets rows atomically

3. ✅ **Workout History Display**
   - Created WorkoutHistory component
   - Shows recent workouts with exercise grouping
   - Displays max weight per exercise
   - Supports up to 3 recent workouts

4. ✅ **Lifting Progression Chart**
   - Created LiftingChart component with Recharts line charts
   - Shows weight progression per exercise with target reference line
   - LiftingProgress component displays top 3 exercises by activity
   - Integrated into Today dashboard

5. ✅ **Habit Checklist**
   - Created HabitChecklist component with Meditation, Journal, Creatine checkboxes
   - Auto-populated Sleep (from Apple Health) and Steps (from Apple Health)
   - Optimistic UI updates with rollback on error
   - Streak counter showing consecutive days with habits completed

6. ✅ **Habit Heatmap**
   - Created HabitHeatmap component (7-day calendar grid)
   - Color intensity based on completion % (0-100%)
   - Highlights today with ring styling
   - Shows completion legend

**Files Added**:
- `src/app/api/workouts/route.ts`
- `src/app/api/habits/route.ts`
- `src/components/forms/workout-form.tsx`
- `src/components/forms/habit-checklist.tsx`
- `src/components/dashboard/workout-history.tsx`
- `src/components/dashboard/habit-heatmap.tsx`
- `src/components/charts/lifting-chart.tsx`
- `src/lib/constants/workouts.ts`
- `supabase/migrations/004_workouts_habits_tables.sql`

**Key Implementation Details**:
- Parallel data fetching in Today dashboard for 6 queries (weight, habits, workouts, steps, sleep)
- Streak calculation: counts consecutive days with meditation OR journal completed
- Workout templates with pre-defined exercise lists per workout type
- Exercise targets for 2026 for progress visualization
- Two-column layout: habits on left, workout on right
- Scheduled workout display based on day of week (WEEKLY_SCHEDULE)

**Deliverable**: Full workout and habit tracking with progression visualization integrated into Today dashboard.

---

### Phase 4: Multi-Timeframe Views (Week 4-5)

**Goals**: Build sidebar navigation and Weekly/Monthly/Quarterly views.

**Tasks**:
1. **Sidebar Layout**
   - Create reusable sidebar component
   - Navigation links: Today, Week, Month, Quarter, Review
   - Active state styling
   - Collapse on mobile (hamburger menu)
   - Wrap dashboard pages in layout

2. **Weekly Trends Page** (`/week`)
   - Date range selector (default: current week)
   - Metrics:
     - Weekly weight average (calculate from daily weights)
     - Workout completion % (how many of 5 workouts done?)
     - Habit consistency (% of days all habits completed)
     - Nutrition adherence (% of days hit calorie/protein targets)
   - Charts:
     - Weight line chart (7 days)
     - Habit heatmap (7 days)
     - Workout completion bar chart
   - "Previous Week" / "Next Week" navigation buttons

3. **Monthly Progress Page** (`/month`)
   - Month/year selector (default: current month)
   - Metrics:
     - Current weight vs monthly target (e.g., "214 lbs target, currently 215 lbs")
     - Lifting milestones progress (e.g., "Flat DB Press: 48/50 lbs")
   - Charts:
     - Weight trend for month (30 days)
     - Lifting progression (all exercises, separate lines)
     - Habit completion calendar (30-day heatmap)
   - On-track indicator: Green if within 2 lbs of target, yellow if 3-5 lbs off, red if > 5 lbs off

4. **Quarterly Checkpoints Page** (`/quarter`)
   - Quarter selector: Q1, Q2, Q3, Q4
   - Display quarterly goal (e.g., "Q1: 214 lbs, visible strength gains")
   - Metrics:
     - Weight progress graph (all weeks in quarter)
     - Lifting summary (start vs current vs target)
     - Habit consistency over quarter
   - Narrative text: "What you should see" from original plan

5. **Milestone Tracking**
   - Query milestones table for current month/quarter
   - Display targets prominently
   - Calculate progress percentage
   - Show "Achieved!" badge when milestone hit

**Deliverable**: Fully navigable dashboard with all timeframe views.

---

### Phase 5: Milestones & Weekly Review (Week 5-6)

**Goals**: Pre-load fitness plan, enable milestone editing, build weekly review.

**Tasks**:
1. **Load 2026 Fitness Plan**
   - Create seed script to populate milestones table
   - Data from original plan:
     - 12 monthly weight targets (218, 216, 214, ..., 195)
     - 12 monthly lifting milestones (flat press, curls, etc.)
   - Run script for user on signup

2. **Milestone Editing**
   - Add "Edit Plan" button in Monthly/Quarterly views
   - Modal with form: Edit target weight, target lifts
   - Save updates to milestones table
   - Recalculate progress indicators

3. **Weekly Review Dashboard** (`/review`)
   - Show only on Sundays (or with "Review Week" button)
   - Auto-generated summary:
     - Weight: "Weekly avg: 217 lbs (target: 218 lbs) ✅"
     - Workouts: "5/5 completed ✅"
     - Nutrition: "6/7 days hit targets ✅"
     - Habits: "Meditation: 6/7, Journal: 5/7, Creatine: 7/7"
   - Text fields:
     - "What went well this week?"
     - "What needs adjustment next week?"
   - Save button: POST to `/api/reviews`
   - Show past reviews (history view)

4. **Celebration Animations**
   - Detect milestone achievement (weight target hit, lifting target hit)
   - Trigger confetti animation (use `react-confetti` library)
   - Show modal: "Milestone achieved! 🎉"
   - Save badge to user profile

5. **Progress Indicators**
   - "On track" logic:
     - Weight: Within 2 lbs of monthly target = green
     - Lifting: Hit or exceeded target = green
     - Habits: > 80% consistency = green
   - Display badges throughout dashboard
   - Suggest adjustments if behind pace

**Deliverable**: Complete MVP with milestone tracking and weekly reviews.

---

### Phase 6: Performance & Caching (Week 6)

**Goals**: Eliminate page navigation latency by sharing data across dashboard pages.

**Tasks**:
1. **Shared Data Context**
   - Create DashboardDataProvider context in layout
   - Fetch common data once (weight logs, habit logs, workouts, nutrition)
   - Pass data to child pages via React Context

2. **Layout-Level Data Fetching**
   - Move parallel data fetching from individual pages to layout
   - Fetch data for configurable date range (e.g., last 90 days)
   - Cache in context for instant access by all pages

3. **Page Optimization**
   - Update Today, Week, Month, Quarter pages to consume shared context
   - Remove duplicate data fetching from individual pages
   - Pages render instantly with pre-fetched data

4. **Revalidation Strategy**
   - Refresh data when user submits forms (weight, workout, habits)
   - Optional: Add manual refresh button
   - Consider time-based revalidation for stale data

**Deliverable**: Instant page navigation with shared data layer.

---

### Phase 7: Polish & Testing (Week 6+)

**Goals**: Fix bugs, improve UX, optimize performance.

**Tasks**:
1. **Mobile Testing**
   - Test all views on iPhone (Safari + Chrome)
   - Fix layout issues (buttons too small, text overflow)
   - Ensure forms are usable on mobile

2. **Loading States**
   - Add skeleton loaders for charts
   - Show spinner during data fetch
   - Disable buttons during submission

3. **Error Handling**
   - Toast notifications for errors (use shadcn/ui toast)
   - Fallback UI if chart data is empty
   - Retry logic for failed API calls

4. **Performance**
   - Optimize chart rendering (memoization)
   - Lazy load heavy components
   - Enable Next.js image optimization

5. **Accessibility**
   - Keyboard navigation (tab through forms)
   - ARIA labels for charts
   - High-contrast mode (already handled by dark theme)

6. **Documentation**
   - Write README with setup instructions
   - Document API endpoints
   - Create user guide (how to configure Health Auto Export)

**Deliverable**: Production-ready app with excellent UX.

---

## Test Strategy

### Manual Testing (Human Verification)

**Phase 1 Tests**:
- [ ] Create account, login, logout, login again (session persistence)
- [ ] Enter weight on mobile, verify chart updates on desktop (responsive + sync)
- [ ] Dark mode looks clean (no white flashes, consistent colors)

**Phase 2 Tests**:
- [ ] Health Auto Export sends data, verify appears in dashboard within 5 min
- [ ] Manually enter weight, verify doesn't conflict with auto-import (upsert works)
- [ ] Sync status shows correct timestamp

**Phase 3 Tests**:
- [ ] Log complete workout (5 exercises, 4 sets each), verify saves correctly
- [ ] Check habit checkboxes, reload page, verify persisted
- [ ] Complete all habits for 3 days, verify streak counter shows "3 days"

**Phase 4 Tests**:
- [ ] Navigate to Weekly view, verify correct date range
- [ ] Change month selector in Monthly view, verify data updates
- [ ] On mobile, sidebar collapses into hamburger menu

**Phase 5 Tests**:
- [ ] Edit monthly weight target, verify chart updates milestone marker
- [ ] Complete weekly review on Sunday, verify saves
- [ ] Hit weight milestone, verify celebration animation triggers

### Automated Tests (Future)

**Unit Tests** (Jest + React Testing Library):
- Component rendering (StatCard displays correct value)
- Form validation (workout form requires all fields)
- Utility functions (date calculations, progress percentage)

**Integration Tests** (Playwright):
- Full user flow: signup → enter weight → log workout → view weekly review
- API endpoint tests (POST /api/workouts returns 201)

**Not Testing** (Out of Scope for MVP):
- Load testing (not needed for single-user app)
- Security testing (rely on Supabase Auth)

---

## Learning Resources for iOS → Web Transition

### Recommended Learning Path

**Week 1: React Fundamentals**
- [Next.js Official Tutorial](https://nextjs.org/learn) (2-3 hours)
- [React Docs - Quick Start](https://react.dev/learn) (1 hour)
- Mental model: React components = SwiftUI Views, props = parameters, state = @State

**Week 2: TypeScript & Styling**
- [TypeScript for Swift Developers](https://www.typescriptlang.org/) (1 hour)
- [Tailwind CSS Docs](https://tailwindcss.com/docs) (1 hour)
- Mental model: TypeScript = Swift types, Tailwind classes = SwiftUI modifiers

**Week 3: Data Fetching & APIs**
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching) (1 hour)
- [Supabase Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) (1 hour)
- Mental model: API routes = Swift URLSession, Supabase = CloudKit/Core Data

**Week 4+: Build & Debug**
- Use ChatGPT/Claude for specific questions ("How do I create a line chart in Recharts?")
- Read shadcn/ui component source code (learn by example)
- Debug with browser DevTools (Console = Xcode console, Network tab = Charles Proxy)

### Key Concepts for iOS Developers

| iOS Concept | Web Equivalent | Notes |
|-------------|----------------|-------|
| SwiftUI View | React Component | Both are declarative UI |
| @State | useState hook | Local component state |
| @ObservedObject | Zustand store | Shared state across components |
| Combine | React Query | Async data fetching |
| URLSession | fetch() / axios | HTTP requests |
| Codable | Zod schemas | Type-safe data validation |
| CloudKit | Supabase | Backend + database |
| NavigationStack | Next.js App Router | File-based routing |
| .padding() | className="p-4" | Tailwind utility classes |

---

## Success Metrics

**After 1 Month of Use**:
- [ ] 90%+ of weight data auto-imported (minimal manual entry)
- [ ] All workouts logged with exercise-level detail
- [ ] 4 weekly reviews completed
- [ ] Can see clear weight trend line toward goal
- [ ] Dashboard checks become daily habit (< 30 sec to review)

**After 3 Months (Q1 Complete)**:
- [ ] Hit Q1 weight target (214 lbs) or within 2 lbs
- [ ] Lifting progression visible in charts (measurable gains)
- [ ] 80%+ habit consistency (sleep, steps, meditation, journal, creatine)
- [ ] Weekly reviews provide actionable insights

**Technical Metrics**:
- Page load time < 2 seconds (on 4G)
- Mobile-responsive on iPhone (100% features work)
- Zero data loss (Supabase backups working)
- No critical bugs (app doesn't crash)

---

## Next Steps After Completion

Once MVP is complete and you've been using it for 1-2 weeks, consider:

1. **Gather Feedback**
   - What features do you use most?
   - What's missing or frustrating?
   - What charts are most motivating?

2. **Iterate on UX**
   - Adjust layout based on usage patterns
   - Add shortcuts (quick workout logging)
   - Improve mobile experience

3. **Add V2 Features** (Based on Priority)
   - Photo progress tracking (before/after)
   - AI insights ("You lift heavier on Tuesdays")
   - Export data to CSV
   - Push notifications (weekly review reminder)

4. **Consider Sharing**
   - Clean up code, write documentation
   - Open-source on GitHub?
   - Blog post: "Building a Fitness Dashboard as an iOS Dev"

5. **Expand to Other Goals**
   - Could this dashboard pattern work for other tracking (finance, habits, projects)?
   - Generalize into a "Goal Tracking Platform"?

---

## Sources & References

**UX Research**:
- [How to Design a Fitness App: UX/UI Best Practices](https://www.zfort.com/blog/How-to-Design-a-Fitness-App-UX-UI-Best-Practices-for-Engagement-and-Retention)
- [Designing a Fitness Platform: UX Design Challenges and Solutions](https://www.uxmatters.com/mt/archives/2025/07/designing-a-fitness-platform-ux-design-challenges-and-solutions.php)
- [10 Inspiring Fitness App Dashboards](https://www.fusioncharts.com/blog/10-inspiring-fitness-app-dashboards/)
- [The Top 7 Dashboard Charts for TrainingPeaks](https://www.trainingpeaks.com/blog/the-top-7-dashboard-charts-for-coaches/)

**Data Integration**:
- [Health Auto Export App](https://apps.apple.com/us/app/health-auto-export-json-csv/id1115567069)
- [How to Export Apple Health Data & Workouts to JSON or CSV](https://www.healthyapps.dev/how-to-export-apple-health-data-workouts-to-a-json-or-csv-file)
- [Lose It! API Integration for Developers](https://help.validic.com/space/VCS/2010087433/Lose+It!+API+Integration+for+Developers)

**Web Stack**:
- [React Tech Stack 2025](https://www.robinwieruch.de/react-tech-stack/)
- [What Next.js Tech Stack to Try in 2025](https://www.wisp.blog/blog/what-nextjs-tech-stack-to-try-in-2025-a-developers-guide-to-modern-web-development)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Dark Mode in shadcn/ui](https://ui.shadcn.com/docs/dark-mode)
- [Shadcn Dashboard Template](https://github.com/Roopali-02/shadcn-dashboard)

---

## Appendix: Original Fitness Plan Summary

**Goal**: 220 → 195 lbs over 12 months (Jan-Dec 2026)
**Focus**: Build muscle (pecs, biceps, triceps, delts) while losing fat

**Quarterly Targets**:
- Q1 (March): 214 lbs - muscle memory returning
- Q2 (June): 208 lbs - visible changes in mirror
- Q3 (September): 202 lbs - midsection smaller
- Q4 (December): 195 lbs - goal weight, significantly more muscular

**Weekly Workout Schedule**:
- Monday: Chest & Triceps (6 exercises)
- Tuesday: Cardio (elliptical 30-45 min)
- Wednesday: Shoulders & Biceps (6 exercises)
- Thursday: Cardio
- Friday: Volume Day (6 exercises)
- Saturday: Active rest
- Sunday: Rest + weekly review

**Daily Habits**:
- Sleep: 9 hours
- Steps: 7,500
- Meditation: 5 min
- Gratitude journal: 3 items
- Creatine: 5g

**Nutrition Targets** (Weekly):
- Mon-Thu: 1,800 cal, 160-180g protein
- Fri: 2,400 cal (flex day)
- Sat: 3,250 cal (social day)
- Sun: 2,200 cal (reset)
- Weekly total: ~15,050 cal (~0.5 lb/week loss)

**Lifting Progression Targets** (Dec 2026):
- Flat DB press: 45 → 65 lbs
- Curls: 25 → 40 lbs
- Lateral raises: 15 → 25 lbs

**Weekly Review Questions**:
1. Weekly weight average - on track?
2. All workouts completed?
3. Hit nutrition targets?
4. Habit consistency?
5. What went well?
6. What needs adjustment?

---

## Document Version History

- **v1.0** (2026-01-06): Initial roadmap created after brainstorming session

---

**End of Roadmap**
