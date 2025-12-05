# Pulse AI Running Coach - Project Documentation Report

## 1. Project Overview

**Title:** Pulse AI Running Coach
**Version:** 0.1.0 (MVP)
**Date:** December 4, 2025

### Purpose & Problem Statement
Traditional training plans (PDFs, static apps) are rigid and often lead to burnout because they fail to account for an athlete's full schedule. "Hybrid Athletes"—those who combine running with serious strength training—face a specific challenge: static plans often schedule heavy long runs the day after heavy leg workouts, leading to injury or poor performance.

**Pulse AI** solves this by acting as an intelligent, adaptive coach. It generates training plans that explicitly respect the user's designated "Strength Days," ensuring runs are scheduled optimally around lifting sessions.

### Target Audience
- **The Hybrid Athlete:** Individuals who want to run a 5K/Marathon but refuse to give up their gym days.
- **Busy Professionals:** Users who need a plan that adapts to their specific weekly availability constraints.

---

## 2. Technical Architecture

Pulse AI is built on a modern, server-less, and edge-first architecture designed for performance and scalability.

### The Tech Stack
- **Frontend:** Next.js 16.0.4 (App Router) & React 19
  - **Styling:** Tailwind CSS v4 (Alpha/Beta)
  - **UI Components:** Lucide React, Framer Motion
- **Backend:** Supabase (BaaS)
  - **Database:** PostgreSQL with Row Level Security (RLS)
  - **Auth:** Supabase Auth (Email/Password)
  - **Compute:** Supabase Edge Functions (Deno/TypeScript)
- **AI Engine:** Google Gemini 2.0 Flash
  - Selected for its sub-second latency and massive context window, enabling it to process weeks of workout history in a single prompt.

### High-Level Data Flow
1.  **User Interaction:** Client (Next.js) sends request (e.g., "Generate Plan").
2.  **Security:** Request passes through Supabase Auth & RLS policies.
3.  **Intelligence:** Edge Function invokes Google Gemini API with strict JSON constraints.
4.  **Persistence:** Validated plan is bulk-inserted into PostgreSQL `workouts` table.
5.  **Delivery:** Client reads data via Server Components (direct DB connection) for zero-latency rendering.

---

## 3. Data & Logic ("The Brain")

### Database Schema
The relational model is designed for flexibility and historical tracking.
- **`profiles`:** Stores user constraints (`strength_days`, `runs_per_week`, `goal`).
- **`training_plans`:** Metadata for a specific 8-week block (`is_active`, `plan_name`).
- **`workouts`:** The core atomic unit.
  - Columns: `scheduled_date`, `activity_type` (Run/Strength/Rest), `structure` (JSONB).
  - **JSONB Structure:** Allows extreme flexibility. A "Run" stores `{ distance, pace }`, while "Strength" stores `{ exercises[], split }` in the same column.
- **`ai_chat_logs`:** Persists conversation history for the contextual AI coach.

### The "Smart Coach" Engine (Edge Function)
The core innovation lies in `supabase/functions/generate-plan/index.ts`. It is not a simple wrapper around an LLM. It employs a **Hybrid Intelligence** architecture:

1.  **Prompt Engineering:** The System Prompt enforces strict rules: *"NEVER schedule a run on a designated strength day."*
2.  **Deterministic Safety Net:** The code strictly validates the AI's output.
    - **Scenario:** The AI hallucinates a "Run" on a "Leg Day."
    - **Fix:** The code intercepts this, forces the day to "Strength," and applies a **Validated Template** (e.g., "Lower Body Power A") from a hard-coded rotation.
3.  **Progressive Overload:** The logic ensures an 8-week progression.
    - *Weeks 1-2:* Foundation (Low volume).
    - *Weeks 7-8:* Peak (High volume/intensity).
    - This logic is applied *programmatically* if the AI output is vague.

---

## 4. Key Features & User Flow

### 1. Onboarding "Wizard"
A step-by-step flow that gathers critical data:
- **Goal:** (e.g., "Run a sub-25min 5k").
- **Constraints:** "I lift weights on Mondays and Thursdays."
- **Outcome:** These inputs become the "Seed" for the AI generation.

### 2. Dashboard "Command Center"
- **Today's Plan:** A prominent view of the current day's task.
- **Weekly Calendar:** A 7-day rolling view of the schedule.
- **Real-time Updates:** Uses `unstable_noStore` to bypass caching, ensuring the schedule updates immediately if the AI modifies the plan.

### 3. Workout Details & Execution
- **Drill Down:** Users click a workout to see specific intervals or exercises.
- **Completion:** "Mark as Complete" button triggers optimistic UI updates and invalidates analytics caches.

### 4. Progress Analytics
A dynamic analytics engine (no static stats table) ensuring a "Single Source of Truth."
- **Current Streak:** Calculated recursively. *Crucially, "Rest Days" count towards the streak*, rewarding consistency and recovery equally.
- **Adherence Score:** `(Completed Workouts / Scheduled Workouts)` calculated for the *current week* only.
- **Volume Tracking:** RegEx parsing extracts "miles" and "minutes" from the JSONB structure to visualize total volume.

### 5. Context-Aware AI Chat (Phase 3)
- **Persona:** "Coach Pulse."
- **Capabilities:** Users can chat naturally ("I'm sick today", "Move my long run to Sunday").
- **Tool Use:** The AI calls database functions (`update_workout`, `swap_workouts`) to actually modify the schedule in real-time.

---

## 5. Current Status

**Status:** MVP Complete & Functional

- **Fully Implemented:**
    - ✅ Authentication & Secure Onboarding.
    - ✅ Reliable AI Plan Generation (with Template Fallbacks).
    - ✅ Interactive Dashboard & Calendar.
    - ✅ Comprehensive Analytics (Streak/Adherence).
    - ✅ AI Chat Interface (UI & Logic).

- **Pending / Next Steps:**
    - 🔄 Deployment of AI Chat "Context Fix" (removing technical IDs from user view).
    - 📱 Final Mobile UI Polish (Chat overlay responsiveness).

This project successfully demonstrates a **Production-Ready AI Application** that moves beyond simple chatbots to complex, stateful, and reliable agentic behaviors.
