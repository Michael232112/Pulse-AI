# Pulse AI - Project Plan & Progress

## Project Overview

**Pulse AI** is a Next.js fitness application that provides personalized AI-powered running training plans. Users sign up, complete an onboarding wizard to specify their goals, and receive customized workout schedules.

## Tech Stack

- **Frontend:** Next.js 16.0.4 (App Router)
- **Backend:** Supabase (Auth, Database, RLS)
- **Database:** PostgreSQL (via Supabase)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Language:** TypeScript

## Supabase Project

- **Project ID:** `xprhcpkjyhhhuwvgwsam`
- **Organization:** Michael232112's Org (`vjepxtskygylbqpefttt`)

---

## Completed Work (Session: 2025-11-30)

### 1. Supabase MCP Connection
- Successfully connected Claude Code to Supabase via MCP server
- Can execute SQL, apply migrations, and manage the database directly

### 2. Database Migrations Applied
- `add_profiles_trigger_function`: Auto-creates profile on signup
- `add_profiles_user_trigger`: Links auth.users to profiles
- `add_updated_at_trigger`: Auto-updates timestamps
- `add_update_profile_on_signup_function`: RPC for onboarding data

### 3. Security & Scalability Audit
- Fixed RLS policies for UPDATE/DELETE
- Added `protect_onboarding_flag()` trigger
- Added CHECK constraints for data integrity
- Added performance indexes

---

## Completed Work (Session: 2025-12-02)

### 1. Database Tables Created
- `training_plans`: Stores plan metadata
- `workouts`: Stores individual daily workouts (JSONB structure)

### 2. AI Plan Generation - Edge Function (`generate-plan`)
- Integrated Google Gemini 2.0 Flash API
- Generates 56-day (8-week) plans based on user profile
- Handles bulk insertion into database

### 3. Dashboard Data Integration
- Replaced mock data with real Supabase data
- Implemented Server Actions for fetching/updating workouts
- Connected UI components (`TodaysPlan`, `WeeklyCalendar`) to real data

---

## Completed Work (Session: 2025-12-03)

### 1. Workout Details & Status (Phase 1)
- Built dynamic Workout Details page (`/dashboard/workout/[id]`)
- Implemented "Mark as Complete" with Server Actions
- Added optimistic UI updates

---

## Completed Work (Session: 2025-12-04)

### 1. Progress Tracking (Phase 2) - ✅ COMPLETED
- **Analytics Engine:** Built `getUserStats` server action to calculate:
  - Weekly Adherence (%)
  - Current Streak (logic handles skipped days correctly)
  - Total Volume (Distance/Duration parsed from JSONB)
- **UI Implementation:**
  - Created `/dashboard/progress/page.tsx`
  - Added Summary Cards (Streak, Adherence, Volume)
  - Built `WeeklyActivityChart` component
- **Feedback Loop:**
  - Implemented `ToastContext` for success notifications
  - Integrated toast feedback into "Mark as Complete" action

### 2. AI Plan Generation - Strength Training Variety - ✅ COMPLETED
**Problem:** AI was generating identical strength workouts ("Squats, Lunges, Planks") every time.
**Solution:** Hybrid "Smart Coach" Strategy
1.  **Workout Templates:** Added `STRENGTH_TEMPLATES` with A/B/C rotation:
    - A: Lower Body Power (Squats, RDLs, Lunges, Glute Bridges, Calf Raises)
    - B: Upper Body & Core (Push-ups, Rows, Overhead Press, Plank Hold, Dead Bugs)
    - C: Full Body Conditioning (Burpees, KB Swings, Box Step-ups, Mountain Climbers)
2.  **Progression Phases:** Added `PROGRESSION_PHASES` (2-week increments):
    - Week 1-2: Foundation (2 sets)
    - Week 3-4: Build (3 sets)
    - Week 5-6: Intensify (3 sets, 12-15 reps)
    - Week 7-8: Peak (4 sets)
3.  **Smart Overwrite Logic:** Trusts AI output when valid, falls back to templates otherwise.

**Status:** Deployed to Supabase (v26).

### 3. AI Plan Generation - Run Variety & Progression - ✅ COMPLETED
**Problem:** AI was generating identical runs ("Training Run, 3mi, 30min, easy") every time.
**Solution:** Applied same "Smart Coach" pattern to runs
1.  **Run Templates:** Added `RUN_TEMPLATES` with 4-type rotation:
    - Easy Run (conversational pace)
    - Long Run (extended distance)
    - Tempo Run (comfortably hard)
    - Interval Training (speed work)
2.  **Progressive Distances:** Added `RUN_PROGRESSION`:
    - Week 1-2: 3mi easy, 5mi long, 3mi tempo, 2mi intervals
    - Week 7-8: 4.5mi easy, 8mi long, 4.5mi tempo, 3mi intervals
3.  **Smart Overwrite Logic:** Preserves AI-generated runs when valid, uses template rotation otherwise.

**Status:** Deployed to Supabase (v27).

---

## Completed Work (Session: 2025-12-04 - Session 3)

### 1. Progress Analytics Bug Fixes - ✅ COMPLETED
**Problems Found:**
- Distance always showing 0 (regex matched "km" but AI generates "mi")
- Weekly Activity showing future weeks (January 2026)
- Streak breaking on Rest days
- Cache not invalidating after marking workouts complete

**Fixes Applied:**
1. **Distance Parsing:** Changed regex from `/km/` to `/mi|miles/i`
2. **Week Calculation:** Added `getWeekKey()` helper for Monday-based weeks
3. **Future Week Filter:** Added filter to exclude weeks beyond current week
4. **Streak Logic:** Modified to include Rest days in streak calculation
5. **Cache Invalidation:** Added `revalidatePath()` calls after workout updates
6. **UI Label:** Changed "km" to "mi" in Progress page

**Files Modified:**
- `src/app/dashboard/progress/actions.ts` - Analytics logic fixes
- `src/app/dashboard/progress/page.tsx` - UI label change
- `src/app/dashboard/actions.ts` - Added revalidatePath() calls

### 2. Reset Training Plan Fix - ✅ COMPLETED
**Problem:** "Change Goal & Reset Plan" wasn't deleting old data, causing duplicates.

**Root Cause:** RLS policies only had SELECT/INSERT/UPDATE - no DELETE policy existed.

**Fixes Applied:**
1. **DELETE RLS Policy for `training_plans`:**
   ```sql
   CREATE POLICY "Users can delete own plans"
   ON training_plans FOR DELETE
   USING (auth.uid() = user_id);
   ```

2. **DELETE RLS Policy for `workouts`:**
   ```sql
   CREATE POLICY "Users can delete own workouts"
   ON workouts FOR DELETE
   USING (plan_id IN (SELECT id FROM training_plans WHERE user_id = auth.uid()));
   ```

3. **Code Update:** Modified `resetTrainingPlan()` to delete workouts first, then training plans

**Files Modified:**
- `src/app/dashboard/settings/actions.ts` - Reset plan logic
- Supabase Database - Added 2 DELETE RLS policies

### 3. Streak Calculation Clarification - ✅ VERIFIED WORKING
**User Report:** "Streak stuck at 1"

**Investigation Result:** Streak = 1 is CORRECT behavior.
- Streak counts consecutive days **backwards from today**
- Plan started on Dec 4, so max possible streak is 1
- Completing future workouts doesn't increase streak until that day arrives
- Streak will naturally increment as user completes workouts on consecutive days

---

## Completed Work (Session: 2025-12-04 - Session 4 & 5)

### 1. AI Chat Interface (Phase 3) - ✅ COMPLETED

**Database:**
- Created `ai_chat_logs` table for persistent chat history
- Added RLS policies for user-scoped access
- Index for fast user queries ordered by time

**Edge Function (`supabase/functions/chat/index.ts`):**
- Context-aware AI (fetches user profile, recent 7-day history, upcoming 7-day schedule)
- "Coach Pulse" persona - elite running coach
- Gemini 2.0 Flash with function calling
- 4 CRUD tools:
  - `update_workout` - Change workout details
  - `swap_workouts` - Swap two workouts between days
  - `add_rest_day` - Convert workout to rest
  - `reschedule_workout` - Move to different date
- Tool execution loop with natural language confirmation

**Frontend:**
- `ChatInterface.tsx` refactored with real API integration
- Optimistic UI (user message appears immediately)
- Typing indicator while AI processes
- Welcome message for empty state
- Chat history persistence across sessions
- Server actions in `chat-actions.ts`

### 2. AI Chat Bug Fixes

**Bug 1: Profile Column Error (v2) - ✅ FIXED**
- **Problem:** Edge Function queried `full_name` but column is `name`
- **Status:** ✅ DEPLOYED (v2)

**Bug 2: Dashboard Not Updating After Tool Execution - ✅ FIXED**
- **Problem:** Dashboard components (`WeeklyCalendar`, `TodaysPlan`) showed stale data after AI modifications despite `router.refresh()`.
- **Fix:**
    - Implemented `unstable_noStore()` in `src/app/dashboard/actions.ts` for `getTodaysWorkouts` and `getWeekWorkouts` to bypass Next.js server-side caching.
    - Added a temporary "🔄 Plan updated! Refreshing your calendar..." system message in `ChatInterface.tsx` for immediate user feedback.
- **Status:** ✅ VERIFIED locally.

**Bug 3: AI Response Too Technical (Showing IDs) - ⏸️ PENDING DEPLOYMENT**
- **Problem:** AI was showing workout UUIDs to users.
- **Fix:** Modified `supabase/functions/chat/index.ts` to remove IDs from the prompt context given to the AI.
- **Status:** ⏸️ Code updated locally, deployment skipped by user request.

---

## Completed Work (Session: 2025-12-05)

### 1. Vercel Deployment - ✅ COMPLETED

**Deployment Setup:**
- Deployed to Vercel via GitHub integration
- Live URL: `https://pulse-ai-w44h.vercel.app/`
- Auto-deploys on push to `main` branch

**Environment Variables Configured:**
- `NEXT_PUBLIC_SUPABASE_URL`: `https://xprhcpkjyhhhuwvgwsam.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon JWT key

### 2. Deployment Bug Fixes - ✅ COMPLETED

**Bug 1: "Unexpected end of JSON input" on Signup**
- **Problem:** User entered wrong Supabase URL (dashboard URL instead of API URL)
- **Fix:** Changed from `https://supabase.com/dashboard/project/...` to `https://xprhcpkjyhhhuwvgwsam.supabase.co`

**Bug 2: Redirect to localhost after signup**
- **Problem:** Supabase "Site URL" was set to `http://localhost:3000`
- **Fix:** Updated Supabase Auth → URL Configuration → Site URL to `https://pulse-ai-w44h.vercel.app`

**Bug 3: Redirect URLs not configured**
- **Fix:** Added `https://pulse-ai-w44h.vercel.app/**` to Supabase Redirect URLs

### 3. Landing Page Improvements - ✅ COMPLETED

**Sticky Header:**
- Made navbar fixed at top when scrolling
- Added `fixed top-0 left-0 right-0 z-50` to Navbar component
- Added padding wrapper to prevent content overlap

**Smooth Scroll Navigation:**
- Added `id="about"` to TrainingPreviewSection
- Added `id="features"` to TrainAnywhereSection
- Added `scroll-behavior: smooth` to globals.css
- "About" link scrolls to TrainingPreviewSection
- "Features" link scrolls to TrainAnywhereSection

**Files Modified:**
- `src/components/Navbar.tsx` - Fixed positioning
- `src/components/landing/TrainingPreviewSection.tsx` - Added section ID
- `src/components/landing/TrainAnywhereSection.tsx` - Added section ID
- `src/app/globals.css` - Smooth scroll behavior
- `src/app/page.tsx` - Padding wrapper for fixed header

---

## Current Development Status

**COMPLETED:**
- ✅ Authentication & Onboarding
- ✅ Database Schema & Security
- ✅ AI Plan Generation (Smart Coach + Variety + Progression)
- ✅ Dashboard (Calendar, Today's View)
- ✅ Workout Details & Completion
- ✅ Progress Tracking (Analytics & Charts)
- ✅ Strength Training Variety (A/B/C rotation + 8-week progression)
- ✅ Run Variety (4-type rotation + progressive distances)
- ✅ Progress Analytics Bug Fixes (Cache, Distance, Weeks, Streak)
- ✅ Reset Training Plan (DELETE RLS Policies)
- ✅ AI Chat Interface (Phase 3)
- ✅ Dashboard Data Refresh Bug (Chat Actions)
- ✅ Vercel Deployment (Production Live)
- ✅ Landing Page (Sticky Header + Smooth Scroll)

**UP NEXT:**
- 🔜 Deploy AI Chat Fixes (Bug 3)
- 🔜 Polish & Testing (Mobile Responsiveness)
- 🔜 Custom Domain Setup (Optional)

---

## Key Files

### New Files (Phase 2 & Fixes)
- `src/app/dashboard/progress/page.tsx` - Progress Dashboard
- `src/app/dashboard/progress/actions.ts` - Analytics Logic
- `src/context/ToastContext.tsx` - Notification System
- `src/app/onboarding/OnboardingEffectHandler.tsx` - Refactored Onboarding Logic

### Updated Files (Smart Coach AI)
- `supabase/functions/generate-plan/index.ts` - Smart Coach AI Logic
- `supabase/functions/chat/index.ts` - Chat AI Logic (Locally updated with fix)
- `src/app/dashboard/actions.ts` - Dashboard Data Fetching (Added noStore)

---

*Last updated: 2025-12-05 (Session 6 - Vercel Deployment & Landing Page Improvements)*
