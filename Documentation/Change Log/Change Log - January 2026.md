# Change Log - January 2026

**2026 Fitness Dashboard** version history and completed work.

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
