# Pulse AI - Architecture & Data Flow

A simple guide explaining how Pulse AI works under the hood.

---

## 1. Overview

**Pulse AI** is an AI-powered running coach that creates personalized 8-week training plans. Users sign up, tell the app their goals, and receive a custom workout schedule that adapts through AI chat.

**Core Features:**
- User authentication (sign up, login, sessions)
- Onboarding wizard (collect training preferences)
- AI-generated 56-day training plans
- Daily workout tracking with completion status
- Progress analytics (streak, adherence, volume)
- AI chat coach for plan modifications

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16 + React 19 | User interface |
| Backend | Supabase Edge Functions | Serverless AI operations |
| Database | PostgreSQL (Supabase) | Data storage |
| Auth | Supabase Auth | User sessions |
| AI | Google Gemini 2.0 Flash | Plan generation & chat |
| Styling | Tailwind CSS v4 | UI styling |
| Hosting | Vercel + Supabase | Production deployment |

---

## 3. Database Schema

### Tables Overview

```
auth.users (Supabase managed)
    │
    ▼
profiles ────────► training_plans ────────► workouts
    │                                           │
    └──────────────► ai_chat_logs ◄─────────────┘
```

### `profiles` - User Data
Stores personal info and training preferences.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Links to auth.users |
| name | text | User's name |
| email | text | User's email |
| age, height, weight | numeric | Physical stats |
| goal | text | "marathon", "5k", "habit", "custom" |
| runs_per_week | integer | 2-7 runs per week |
| strength_days | text[] | ["monday", "thursday"] |
| onboarding_completed | boolean | Has finished setup? |

### `training_plans` - Plan Metadata
Each user has one active 8-week plan.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Plan identifier |
| user_id | UUID | Links to profiles |
| plan_name | text | "8-Week Marathon Prep" |
| is_active | boolean | Current active plan |

### `workouts` - Daily Workouts
56 workouts per plan (8 weeks × 7 days).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Workout identifier |
| plan_id | UUID | Links to training_plans |
| scheduled_date | date | When to do this workout |
| title | text | "Easy Run" or "Lower Body Strength" |
| activity_type | enum | "Run", "Strength", "Rest" |
| structure | JSONB | Workout details (varies by type) |
| is_completed | boolean | User marked done? |

**Structure Examples:**

```json
// Run Workout
{
  "distance": "3 mi",
  "duration": "30 min",
  "pace": "easy"
}

// Strength Workout
{
  "duration": "45 min",
  "exercises": ["Squats", "Lunges", "Planks"],
  "sets": 3,
  "reps": "10-12"
}

// Rest Day
{
  "instructions": "Focus on recovery"
}
```

### `ai_chat_logs` - Chat History
Stores conversation with AI coach.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Message identifier |
| user_id | UUID | Who sent/received |
| role | enum | "user" or "assistant" |
| content | text | Message text |
| tool_calls | JSONB | Actions AI executed |

---

## 4. Authentication Flow

### Sign Up Process

```
User fills form (email, password, name, age, height, weight)
         │
         ▼
    signup() server action
         │
         ▼
    Supabase Auth creates user in auth.users
         │
         ▼
    Database trigger auto-creates profile row
         │
         ▼
    RPC function saves bio data to profile
         │
         ▼
    Redirect to /onboarding
```

**Key Files:**
- `src/app/signup/page.tsx` - Sign up form
- `src/app/signup/actions.ts` - Server action

### Session Management

```
Every page request
         │
         ▼
    middleware.ts intercepts
         │
         ▼
    Calls supabase.auth.getUser()
         │
         ▼
    Refreshes auth tokens if needed
         │
         ▼
    Sets new cookies
         │
         ▼
    Route protection checks:
    - /dashboard requires auth + onboarding_completed
    - /onboarding requires auth
    - /signup redirects to dashboard if logged in
```

**Key Files:**
- `src/middleware.ts` - Route protection
- `src/utils/supabase/server.ts` - Server client

---

## 5. Onboarding Flow

User completes 4 steps to configure their training preferences.

```
Step 1: Select Goal
    │   (Marathon, 5K, Build Habit, Custom)
    ▼
Step 2: Running Frequency
    │   (How many runs per week? 2-7)
    ▼
Step 3: Strength Days
    │   (Which days? Monday, Wednesday, Friday)
    ▼
Step 4: Generate Plan
    │   (Loading screen while AI works)
    ▼
Dashboard (Plan ready!)
```

**What happens in Step 4:**

```
completeOnboarding() server action
         │
         ▼
    Update profiles table with preferences
         │
         ▼
    Set onboarding_completed = true
         │
         ▼
    Call generate-plan Edge Function
         │
         ▼
    AI creates 56 workouts
         │
         ▼
    Redirect to /dashboard
```

**Key Files:**
- `src/app/onboarding/page.tsx` - Wizard UI
- `src/app/onboarding/actions.ts` - Save preferences

---

## 6. AI Plan Generation

The `generate-plan` Edge Function creates personalized 8-week plans.

### Process Flow

```
Input: userId
         │
         ▼
    Fetch user profile (goal, runs_per_week, strength_days)
         │
         ▼
    Build AI prompt with rules:
    - "Never schedule a run on a strength day"
    - "Create exactly 56 workouts"
    - "Include progressive overload"
         │
         ▼
    Call Google Gemini 2.0 Flash API
         │
         ▼
    Validate AI response
         │
         ▼
    Apply fallback templates if AI hallucinated
         │
         ▼
    Bulk insert 56 workouts to database
```

### Smart Coach Logic

The AI sometimes makes mistakes (e.g., scheduling a run on a strength day). The system has fallback templates:

**Strength Templates (A/B/C rotation):**
- A: Lower Body (Squats, RDLs, Lunges)
- B: Upper Body (Push-ups, Rows, Planks)
- C: Full Body (Burpees, KB Swings, Mountain Climbers)

**Run Templates (4-type rotation):**
- Easy Run (conversational pace)
- Long Run (extended distance)
- Tempo Run (comfortably hard)
- Intervals (speed work)

**Progressive Overload:**
- Weeks 1-2: 2 sets, foundation
- Weeks 3-4: 3 sets, build
- Weeks 5-6: 3 sets, intensify
- Weeks 7-8: 4 sets, peak

**Key File:**
- `supabase/functions/generate-plan/index.ts`

---

## 7. Dashboard Data Flow

### Fetching Today's Workouts

```
User visits /dashboard
         │
         ▼
    getTodaysWorkouts() server action
         │
         ▼
    Query: SELECT * FROM workouts
           WHERE scheduled_date = TODAY
           AND user belongs to current user
         │
         ▼
    Return workout array
         │
         ▼
    TodaysPlan component renders
```

### Fetching Week View

```
getWeekWorkouts(startDate, endDate)
         │
         ▼
    Query: SELECT * FROM workouts
           WHERE scheduled_date BETWEEN start AND end
         │
         ▼
    Group by date: { "2025-12-08": [...], "2025-12-09": [...] }
         │
         ▼
    WeeklyCalendar component renders
```

**Key Files:**
- `src/app/dashboard/page.tsx` - Main layout
- `src/app/dashboard/actions.ts` - Data fetching
- `src/app/dashboard/components/TodaysPlan.tsx`
- `src/app/dashboard/components/WeeklyCalendar.tsx`

---

## 8. Workout Completion

### Marking a Workout Complete

```
User clicks "Mark Complete" button
         │
         ▼
    toggleWorkoutStatus(workoutId, true)
         │
         ▼
    UPDATE workouts SET is_completed = true
         │
         ▼
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/progress")
         │
         ▼
    Cache invalidated - fresh data on next load
         │
         ▼
    Toast notification: "Great job!"
```

**Key Files:**
- `src/app/dashboard/workout/[id]/page.tsx` - Workout details
- `src/app/dashboard/workout/[id]/components/MarkCompleteButton.tsx`

---

## 9. Progress Analytics

### How Stats Are Calculated

The `getUserStats()` function calculates metrics from workout data:

**Weekly Adherence:**
```
Completed workouts this week / Scheduled workouts this week × 100
```

**Current Streak:**
```
Start from today, go backwards
Count consecutive days with completed workout OR rest day
Stop at first gap
```

**Total Distance:**
```
For each completed run:
  Parse structure.distance (e.g., "3 mi" → 3)
Sum all distances
```

**Weekly Activity Chart:**
```
Group workouts by week (Monday-based)
For each week: { completed: X, scheduled: Y }
Return last 4 weeks
```

**Key Files:**
- `src/app/dashboard/progress/page.tsx` - Progress UI
- `src/app/dashboard/progress/actions.ts` - Stats calculation

---

## 10. AI Chat Coach

### How Chat Works

```
User types: "I'm sore, make tomorrow a rest day"
         │
         ▼
    sendChatMessage() server action
         │
         ▼
    Call chat Edge Function with message
         │
         ▼
    Edge Function:
    1. Fetch user profile
    2. Fetch last 7 days of workouts
    3. Fetch next 7 days of workouts
    4. Build context for AI
         │
         ▼
    Call Gemini with function calling enabled
         │
         ▼
    Gemini decides to call: add_rest_day(tomorrow_workout_id)
         │
         ▼
    Edge Function executes the tool
         │
         ▼
    Gemini generates response: "Done! Tomorrow is now a rest day."
         │
         ▼
    Save messages to ai_chat_logs
         │
         ▼
    Return to frontend
         │
         ▼
    Dashboard refreshes with updated plan
```

### Available AI Tools

| Tool | What It Does |
|------|-------------|
| `update_workout` | Change workout title, type, or description |
| `swap_workouts` | Exchange two workouts between days |
| `add_rest_day` | Convert any workout to a rest day |
| `reschedule_workout` | Move workout to a different date |

**Key Files:**
- `src/app/dashboard/components/ChatInterface.tsx` - Chat UI
- `src/app/dashboard/chat-actions.ts` - Server actions
- `supabase/functions/chat/index.ts` - AI logic

---

## 11. Complete User Journey

### Day 1: Getting Started

```
1. SIGN UP
   User creates account with email/password
   Profile auto-created in database

2. ONBOARDING
   Select goal: "Marathon"
   Runs per week: 4
   Strength days: Monday, Thursday
   → AI generates 56-workout plan

3. DASHBOARD
   See today's workout: "Easy 3 mi run"
   See week overview in calendar
   Chat with AI coach available
```

### Day 2+: Daily Use

```
4. VIEW WORKOUT
   Click today's workout
   See details: Distance, Duration, Pace
   Read instructions

5. COMPLETE WORKOUT
   Click "Mark Complete"
   Streak increases
   Progress updates

6. CHECK PROGRESS
   View stats: Streak, Adherence, Volume
   See weekly activity chart

7. CHAT WITH COACH
   "Move my long run to Sunday"
   AI swaps workouts
   Calendar updates automatically
```

---

## 12. Security (Row-Level Security)

All database tables use RLS policies:

```sql
-- Users can only see their own data
CREATE POLICY "Users can view own workouts"
ON workouts FOR SELECT
USING (plan_id IN (
  SELECT id FROM training_plans WHERE user_id = auth.uid()
));
```

This means:
- User A cannot see User B's workouts
- Even with direct database access, data is protected
- Edge Functions use Service Role Key (trusted backend only)

---

## 13. Key Files Reference

```
/src
├── app/
│   ├── signup/actions.ts        # Sign up logic
│   ├── onboarding/actions.ts    # Save preferences + trigger AI
│   ├── dashboard/
│   │   ├── actions.ts           # Fetch workouts
│   │   ├── chat-actions.ts      # AI chat
│   │   └── progress/actions.ts  # Calculate stats
│   └── middleware.ts            # Auth + route protection
├── utils/supabase/
│   ├── server.ts                # Server-side DB client
│   └── middleware.ts            # Token refresh
│
/supabase/functions/
├── generate-plan/index.ts       # AI plan generation
└── chat/index.ts                # AI chat with tools
```

---

## 14. Data Flow Summary

```
┌─────────────────────────────────────────────────────────┐
│                      USER                                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   NEXT.JS APP                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Pages     │  │   Server    │  │  Components │     │
│  │  (Routes)   │  │   Actions   │  │    (UI)     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │    Auth     │  │  Database   │  │    Edge     │     │
│  │  (Sessions) │  │ (PostgreSQL)│  │  Functions  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   GOOGLE GEMINI                          │
│              (AI Plan Generation + Chat)                 │
└─────────────────────────────────────────────────────────┘
```

---

*This document explains how Pulse AI works. For development progress and session notes, see `PLAN.md`.*
