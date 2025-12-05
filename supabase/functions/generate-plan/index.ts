// Define interfaces for workout structures
interface RunStructure {
  distance?: string; // e.g., "X mi"
  duration: string;  // e.g., "XX min"
  pace?: string;     // e.g., "easy/moderate/tempo"
  instructions: string;
}

interface StrengthStructure {
  duration: string;  // e.g., "XX min"
  split?: "Lower Body" | "Upper Body" | "Full Body";
  exercises: string[]; // e.g., ["exercise1", "exercise2"]
  sets?: number;
  reps?: string;
  rest?: string;
  instructions: string;
}

interface RestStructure {
  instructions: string;
}

// Workout Templates for A/B/C Rotation (Smart Coach Fallback)
const STRENGTH_TEMPLATES = {
  A: {
    name: "Lower Body Power",
    split: "Lower Body" as const,
    exercises: ["Squats", "Romanian Deadlifts", "Walking Lunges", "Glute Bridges", "Calf Raises"],
    focus: "Build leg strength for running power"
  },
  B: {
    name: "Upper Body & Core",
    split: "Upper Body" as const,
    exercises: ["Push-ups", "Dumbbell Rows", "Overhead Press", "Plank Hold", "Dead Bugs"],
    focus: "Upper body balance and core stability"
  },
  C: {
    name: "Full Body Conditioning",
    split: "Full Body" as const,
    exercises: ["Burpees", "Kettlebell Swings", "Box Step-ups", "Mountain Climbers", "Turkish Get-ups"],
    focus: "Total body conditioning and endurance"
  }
};

// Progression phases for 8-week plan
const PROGRESSION_PHASES = [
  { weeks: [1, 2], sets: 2, reps: "10-12", rest: "60s", note: "Foundation" },
  { weeks: [3, 4], sets: 3, reps: "10-12", rest: "60s", note: "Build" },
  { weeks: [5, 6], sets: 3, reps: "12-15", rest: "45s", note: "Intensify" },
  { weeks: [7, 8], sets: 4, reps: "12-15", rest: "45s", note: "Peak" }
];

// Run Templates for 4-type rotation (Smart Coach Fallback)
const RUN_TEMPLATES = {
  easy: {
    name: "Easy Run",
    pace: "easy",
    description: "Relaxed pace to build aerobic base. Should feel comfortable.",
    instructions: "Maintain a conversational pace. If you can't chat, slow down."
  },
  long: {
    name: "Long Run",
    pace: "easy",
    description: "Extended distance run to build endurance.",
    instructions: "Start slow, finish strong. Fuel and hydrate as needed."
  },
  tempo: {
    name: "Tempo Run",
    pace: "moderate",
    description: "Sustained effort at comfortably hard pace.",
    instructions: "Run at a pace you could hold for about an hour. Challenging but controlled."
  },
  intervals: {
    name: "Interval Training",
    pace: "hard",
    description: "Speed work with recovery periods.",
    instructions: "Alternate between hard efforts and recovery jogs. Push yourself on the fast segments."
  }
};

// Run progression by week (gradual distance/duration increase)
const RUN_PROGRESSION = [
  { weeks: [1, 2], easy: "3 mi / 30 min", long: "5 mi / 50 min", tempo: "3 mi / 25 min", intervals: "2 mi / 20 min" },
  { weeks: [3, 4], easy: "3.5 mi / 35 min", long: "6 mi / 60 min", tempo: "3.5 mi / 28 min", intervals: "2.5 mi / 25 min" },
  { weeks: [5, 6], easy: "4 mi / 40 min", long: "7 mi / 70 min", tempo: "4 mi / 32 min", intervals: "3 mi / 30 min" },
  { weeks: [7, 8], easy: "4.5 mi / 45 min", long: "8 mi / 80 min", tempo: "4.5 mi / 36 min", intervals: "3 mi / 30 min" }
];

// Interface for a single workout object from AI response
interface AiWorkout {
  day_offset: number;
  title: string;
  activity_type: "Run" | "Strength" | "Rest";
  description: string;
  structure: RunStructure | StrengthStructure | RestStructure;
}

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get start date (today)
function getStartDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Clean JSON response from LLM
function cleanJsonResponse(text: string): string {
  let cleaned = text.replace(/```json\n?/gi, "").replace(/```\n?/gi, "");
  cleaned = cleaned.trim();
  return cleaned;
}

// Normalize activity type to match DB constraint
function normalizeActivityType(type: string): "Run" | "Strength" | "Rest" {
  const normalized = type.toLowerCase().trim();
  if (normalized === "run" || normalized === "running") return "Run";
  if (normalized === "strength" || normalized === "cross-training" || normalized === "cross training") return "Strength";
  if (normalized === "rest" || normalized === "recovery" || normalized === "off") return "Rest";
  return "Rest";
}

// Get day of week name from start date + offset
function getDayOfWeek(startDate: Date, dayOffset: number): string {
  const date = new Date(startDate);
  date.setDate(startDate.getDate() + dayOffset);
  return date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY")!;

    // Parse request body
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required", code: "MISSING_USER_ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("goal, custom_goal_text, runs_per_week, strength_days")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return new Response(
        JSON.stringify({ error: "User profile not found", code: "PROFILE_NOT_FOUND" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the goal description
    let goalDescription = profile.goal || "general fitness";
    if (profile.goal === "custom" && profile.custom_goal_text) {
      goalDescription = profile.custom_goal_text;
    }

    const runsPerWeek = profile.runs_per_week || 3;
    const strengthDays = profile.strength_days || [];

    // Calculate start date (today)
    const startDate = getStartDate();

    // Calculate available days and expected rest days
    const availableDaysForRuns = 7 - strengthDays.length;
    const expectedRestDays = Math.max(0, 7 - strengthDays.length - runsPerWeek);

    // Build system prompt with explicit scheduling rules
    const systemPrompt = `
You are a professional running coach AI. Generate a training plan as a JSON array.

CONTEXT:
- User Goal: ${goalDescription}
- Custom Details: ${profile.custom_goal_text || 'None'}
- Running Frequency: ${runsPerWeek} runs per week
- Designated Strength Days: ${strengthDays.length > 0 ? strengthDays.join(', ') : 'None specified'}
- Available Days for Runs: ${availableDaysForRuns} days (7 - ${strengthDays.length} strength days)
- Expected Rest Days: ${expectedRestDays} per week

CRITICAL SCHEDULING RULES:
1. Return ONLY valid JSON - no markdown, no explanation.
2. Response must be a JSON array of exactly 56 objects (8 weeks × 7 days).
3. Structure: { "day_offset": number, "title": string, "activity_type": "Run" | "Strength" | "Rest", "description": string, "structure": {...} }

4. **STRENGTH DAYS (HIGHEST PRIORITY):**
   ${strengthDays.length > 0 ? `
   - The user lifts weights on: ${strengthDays.join(', ')}
   - You MUST schedule "activity_type": "Strength" on these specific days
   - NEVER schedule a "Run" on strength days
   ` : '- No strength days specified - all 7 days available for runs/rest'}

5. **RUNNING DAYS (SECOND PRIORITY):**
   - Schedule exactly ${runsPerWeek} runs per week
   - Runs MUST be on non-strength days only
   - Distribute runs evenly across ${strengthDays.length > 0 ? `available days (NOT ${strengthDays.join(', ')})` : 'the week'}
   - Vary run types based on goal: easy runs, long runs, tempo runs, intervals

6. **REST DAYS (FILL REMAINING):**
   - Fill ALL remaining days with "activity_type": "Rest"
   - Calculation: 7 days - ${strengthDays.length} strength - ${runsPerWeek} runs = ${expectedRestDays} rest days per week
   - Rest days are essential for recovery

7. **WORKOUT VARIETY & PROGRESSION:**
   - SPLITS: If user has 3+ strength days, rotate: Lower Body → Upper Body → Full Body.
     If 2 or fewer, alternate Full Body A and Full Body B.
   - PROGRESSION: Increase intensity every 2 weeks (add sets, duration, or complexity).
     Week 1-2: Foundation (2 sets). Week 3-4: Build (3 sets). Week 5-6: Intensify. Week 7-8: Peak (4 sets).
   - NO REPETITION: Do NOT repeat the exact same exercise list on consecutive strength days.
   - Each strength workout MUST include:
     - "split": "Lower Body" | "Upper Body" | "Full Body"
     - "exercises": Array of 4-5 specific exercises (not generic)
     - "sets" and "reps": Based on the progression week

8. **RUN VARIETY & PROGRESSION:**
   - Rotate run types: Easy Run, Long Run, Tempo Run, Interval Training
   - NEVER schedule the same run type on consecutive run days
   - Increase distance/duration every 2 weeks (progressive overload)
   - Each run MUST include:
     - "title": Specific run type (e.g., "Easy Run", "Tempo Run", NOT just "Training Run")
     - "pace": "easy" | "moderate" | "hard"
     - "distance" and "duration": Based on progression week

IMPORTANT: Do NOT use "Strength" as a filler. Only schedule Strength on designated strength days. Use "Rest" for all other non-run days.
`;

    // Build user prompt
    const userPrompt = `Create an 8-week training plan with these parameters:
- Goal: ${goalDescription}
- Running days per week: ${runsPerWeek}
- Strength/rest days: ${strengthDays.length > 0 ? strengthDays.join(", ") : "none specified"}
- Start date: ${formatDate(startDate)}

Return exactly 56 workout objects as a JSON array. Day 0 = ${formatDate(startDate)}.`;

    console.log("Calling Gemini API...");

    // Call Gemini API with increased maxOutputTokens (FIX for v21)
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            maxOutputTokens: 65536,  // Increased from default to prevent truncation
            temperature: 0.7,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      return new Response(
        JSON.stringify({ error: "AI service unavailable", code: "AI_ERROR" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiResponse.json();
    const rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      console.error("No content from Gemini");
      return new Response(
        JSON.stringify({ error: "AI returned empty response", code: "AI_EMPTY" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Raw content length:", rawContent.length);

    // Parse the JSON response
    let workoutPlan: AiWorkout[]; // Specify the type here
    try {
      const cleanedJson = cleanJsonResponse(rawContent);
      workoutPlan = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw content:", rawContent.substring(0, 500));
      return new Response(
        JSON.stringify({ error: "Failed to parse training plan", code: "PARSE_ERROR" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(workoutPlan) || workoutPlan.length !== 56) {
      console.error("Invalid workout plan length:", workoutPlan?.length);
      return new Response(
        JSON.stringify({ error: "Invalid training plan format", code: "INVALID_FORMAT" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Enhanced Safety Net: Smart Coach with Variety & Progression ---
    console.log("Applying Smart Coach workout distribution...");
    console.log(`Config: runs_per_week=${runsPerWeek} | strength_days=[${strengthDays.join(', ')}]`);

    const normalizedStrengthDays = strengthDays.map((d: string) => d.toLowerCase().trim());
    let strengthDayCounter = 0; // Track strength days for A/B/C rotation
    let runDayCounter = 0; // Track run days for type rotation

    // Process workouts week by week (8 weeks × 7 days)
    for (let week = 0; week < 8; week++) {
      const weekStart = week * 7;
      const weekWorkouts = workoutPlan.slice(weekStart, weekStart + 7);

      console.log(`\n--- Processing Week ${week + 1} (days ${weekStart}-${weekStart + 6}) ---`);

      // Step 1: Identify strength days and available days for this week
      const strengthDayIndices: number[] = [];
      const availableDayIndices: number[] = [];

      weekWorkouts.forEach((workout, idx) => {
        const globalOffset = weekStart + idx;
        const dayName = getDayOfWeek(startDate, globalOffset);

        if (normalizedStrengthDays.includes(dayName)) {
          // This is a designated strength day
          strengthDayIndices.push(idx);

          // Get current week number (1-8) and progression phase
          const weekNum = week + 1;
          const phase = PROGRESSION_PHASES.find(p => p.weeks.includes(weekNum))!;

          // SMART OVERWRITE: Check if AI already generated a valid strength workout
          const structure = workout.structure as StrengthStructure;
          const aiGeneratedValid =
            workout.activity_type === "Strength" &&
            structure?.exercises?.length >= 3 &&
            structure?.split;

          if (aiGeneratedValid) {
            // TRUST AI: Keep the AI-generated workout, just ensure progression
            structure.sets = phase.sets;
            structure.reps = phase.reps;
            structure.rest = phase.rest;
            structure.instructions = `${phase.note} phase: ${phase.sets} sets of ${phase.reps}. Rest ${phase.rest} between sets.`;
            console.log(`  Day ${idx} (${dayName}): PRESERVED AI workout (${structure.split}) with ${phase.note} progression`);
          } else {
            // FALLBACK: AI failed, use template rotation (A/B/C)
            const templateKeys = ["A", "B", "C"] as const;
            const templateKey = templateKeys[strengthDayCounter % 3];
            const template = STRENGTH_TEMPLATES[templateKey];

            workout.activity_type = "Strength";
            workout.title = template.name;
            workout.description = template.focus;
            workout.structure = {
              duration: "40-50 min",
              split: template.split,
              exercises: [...template.exercises],
              sets: phase.sets,
              reps: phase.reps,
              rest: phase.rest,
              instructions: `${phase.note} phase: ${phase.sets} sets of ${phase.reps}. Rest ${phase.rest} between sets.`
            } as StrengthStructure;
            console.log(`  Day ${idx} (${dayName}): FALLBACK to template ${templateKey} (${template.name}) with ${phase.note} progression`);
          }

          strengthDayCounter++;
        } else {
          // This day is available for runs or rest
          availableDayIndices.push(idx);
        }
      });

      // Step 2: Distribute runs evenly on available days
      const runsToSchedule = Math.min(runsPerWeek, availableDayIndices.length);
      console.log(`  Available days: ${availableDayIndices.length} | Runs to schedule: ${runsToSchedule}`);

      if (runsPerWeek > availableDayIndices.length) {
        console.warn(`  WARNING: Not enough available days! Requested ${runsPerWeek} runs but only ${availableDayIndices.length} days available.`);
      }

      // Track which available days will be runs
      const runDayIndices: number[] = [];
      let runsScheduled = 0;

      for (let i = 0; i < availableDayIndices.length && runsScheduled < runsToSchedule; i++) {
        // Distribute runs evenly across available days
        const shouldScheduleRun = Math.floor(i * runsToSchedule / availableDayIndices.length) === runsScheduled;

        if (shouldScheduleRun) {
          const dayIdx = availableDayIndices[i];
          runDayIndices.push(dayIdx);
          const workout = weekWorkouts[dayIdx];
          const globalOffset = weekStart + dayIdx;
          const dayName = getDayOfWeek(startDate, globalOffset);

          // SMART RUN OVERWRITE: Check if AI already generated a valid run
          const runStructure = workout.structure as RunStructure;
          const aiRunValid =
            workout.activity_type === "Run" &&
            runStructure?.distance &&
            runStructure?.pace &&
            workout.title !== "Training Run"; // Not generic

          if (aiRunValid) {
            console.log(`  Day ${dayIdx} (${dayName}): PRESERVED AI run (${workout.title})`);
          } else {
            // FALLBACK: Use run template rotation with progression
            const weekNum = week + 1;
            const runTypes = ["easy", "long", "tempo", "intervals"] as const;
            const runType = runTypes[runDayCounter % 4];
            const template = RUN_TEMPLATES[runType];
            const progression = RUN_PROGRESSION.find(p => p.weeks.includes(weekNum))!;
            const distDur = progression[runType].split(" / ");

            workout.activity_type = "Run";
            workout.title = template.name;
            workout.description = template.description;
            workout.structure = {
              distance: distDur[0],
              duration: distDur[1],
              pace: template.pace,
              instructions: template.instructions
            } as RunStructure;
            console.log(`  Day ${dayIdx} (${dayName}): FALLBACK to ${template.name} (${distDur[0]})`);
          }
          runDayCounter++;
          runsScheduled++;
        }
      }

      // Step 3: Fill remaining available days with Rest
      for (const dayIdx of availableDayIndices) {
        if (!runDayIndices.includes(dayIdx)) {
          const workout = weekWorkouts[dayIdx];
          const globalOffset = weekStart + dayIdx;
          const dayName = getDayOfWeek(startDate, globalOffset);

          workout.activity_type = "Rest";
          workout.title = "Rest Day";
          workout.description = "Take it easy today. Light stretching or complete rest.";
          workout.structure = {
            instructions: "Recovery is essential. Stay hydrated and get good sleep.",
          } as RestStructure;

          console.log(`  Day ${dayIdx} (${dayName}): SET as Rest`);
        }
      }

      console.log(`Week ${week + 1} distribution: ${strengthDayIndices.length} Strength | ${runsScheduled} Runs | ${availableDayIndices.length - runsScheduled} Rest`);
    }

    console.log("\n✓ Deterministic distribution complete");
    // --- End Enhanced Safety Net ---

    // --- Pre-Database Validation ---
    console.log("\n--- Final Validation ---");

    let totalStrength = 0;
    let totalRuns = 0;
    let totalRest = 0;

    for (let week = 0; week < 8; week++) {
      const weekStart = week * 7;
      const weekWorkouts = workoutPlan.slice(weekStart, weekStart + 7);

      const counts = {
        strength: weekWorkouts.filter(w => w.activity_type === "Strength").length,
        runs: weekWorkouts.filter(w => w.activity_type === "Run").length,
        rest: weekWorkouts.filter(w => w.activity_type === "Rest").length,
      };

      totalStrength += counts.strength;
      totalRuns += counts.runs;
      totalRest += counts.rest;

      // Validate weekly distribution
      const expectedStrength = strengthDays.length;
      const expectedRuns = Math.min(runsPerWeek, 7 - strengthDays.length);

      if (counts.strength !== expectedStrength) {
        console.warn(`⚠️ Week ${week + 1}: Expected ${expectedStrength} Strength, got ${counts.strength}`);
      }
      if (counts.runs !== expectedRuns) {
        console.warn(`⚠️ Week ${week + 1}: Expected ${expectedRuns} Runs, got ${counts.runs}`);
      }

      console.log(`Week ${week + 1}: ${counts.strength} Strength | ${counts.runs} Runs | ${counts.rest} Rest ✓`);
    }

    console.log("\nTotal Distribution (56 days):");
    console.log(`  Strength: ${totalStrength} (${((totalStrength / 56) * 100).toFixed(1)}%)`);
    console.log(`  Runs: ${totalRuns} (${((totalRuns / 56) * 100).toFixed(1)}%)`);
    console.log(`  Rest: ${totalRest} (${((totalRest / 56) * 100).toFixed(1)}%)`);
    console.log("✓ Validation complete - proceeding to database insertion\n");
    // --- End Validation ---

    console.log("Creating training plan in database...");

    // Create training plan record
    const { data: trainingPlan, error: planError } = await supabase
      .from("training_plans")
      .insert({
        user_id: userId,
        plan_name: `8-Week ${goalDescription} Plan`,
        goal: goalDescription,
        is_active: true,
      })
      .select("id")
      .single();

    if (planError || !trainingPlan) {
      console.error("Training plan insert error:", planError);
      return new Response(
        JSON.stringify({ error: "Failed to save training plan", code: "DB_ERROR" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Training plan created:", trainingPlan.id);

    // Prepare workout records with proper dates
    const workoutRecords = workoutPlan.map((workout: AiWorkout) => { // Use AiWorkout type here
      const workoutDate = new Date(startDate);
      workoutDate.setDate(startDate.getDate() + workout.day_offset);

      return {
        plan_id: trainingPlan.id,
        scheduled_date: formatDate(workoutDate),
        day_offset: workout.day_offset,
        title: workout.title || "Workout",
        activity_type: normalizeActivityType(workout.activity_type),
        description: workout.description || null,
        structure: workout.structure || {},
        is_completed: false,
      };
    });

    console.log("Inserting", workoutRecords.length, "workouts...");

    // Bulk insert workouts
    const { error: workoutsError } = await supabase
      .from("workouts")
      .insert(workoutRecords);

    if (workoutsError) {
      console.error("Workouts insert error:", workoutsError);
      // Clean up the training plan if workouts fail
      await supabase.from("training_plans").delete().eq("id", trainingPlan.id);
      return new Response(
        JSON.stringify({ error: "Failed to save training plan", code: "DB_ERROR" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully created plan with 56 workouts");

    return new Response(
      JSON.stringify({ success: true, planId: trainingPlan.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", code: "INTERNAL_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
