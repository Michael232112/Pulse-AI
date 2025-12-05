"use server";

import { createClient } from "@/utils/supabase/server";

// Define types for workout structure
interface RunStructure {
  distance?: string;
  duration: string;
  pace?: string;
  instructions: string;
}

interface StrengthStructure {
  duration: string;
  exercises: string[];
  instructions: string;
}

interface RestStructure {
  instructions: string;
}

interface Workout {
  id: string;
  scheduled_date: string;
  activity_type: "Run" | "Strength" | "Rest";
  is_completed: boolean;
  structure: RunStructure | StrengthStructure | RestStructure | null;
}

export interface UserStats {
  totalWorkouts: number;
  completedWorkouts: number;
  weeklyAdherence: number; // percentage
  currentStreak: number; // days
  totalRunDistance: number; // miles
  totalWorkoutDuration: number; // minutes
  activityDistribution: {
    run: number;
    strength: number;
    rest: number;
  };
  weeklyActivity: {
    date: string;
    completed: number;
    scheduled: number;
  }[];
}

function parseDurationToMinutes(durationString: string): number {
  const matchHours = durationString.match(/(\d+)\s*hr/);
  const matchMinutes = durationString.match(/(\d+)\s*min/);
  let totalMinutes = 0;
  if (matchHours) {
    totalMinutes += parseInt(matchHours[1], 10) * 60;
  }
  if (matchMinutes) {
    totalMinutes += parseInt(matchMinutes[1], 10);
  }
  return totalMinutes;
}

// Helper function to get Monday-based week key (returns Monday's date as YYYY-MM-DD)
function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Get to Monday of this week (0 = Sunday, 1 = Monday, etc.)
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function getUserStats(): Promise<UserStats | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch all workouts for the user, ordered by date
  const { data: workoutsData, error } = await supabase
    .from("workouts")
    .select(
      `
      id,
      scheduled_date,
      activity_type,
      is_completed,
      structure,
      training_plans!inner(user_id)
    `
    )
    .eq("training_plans.user_id", user.id)
    .order("scheduled_date", { ascending: true });

  if (error) {
    console.error("Error fetching workouts for user stats:", error);
    return null;
  }

  const workouts: Workout[] = workoutsData as Workout[];

  if (workouts.length === 0) {
    return {
      totalWorkouts: 0,
      completedWorkouts: 0,
      weeklyAdherence: 0,
      currentStreak: 0,
      totalRunDistance: 0,
      totalWorkoutDuration: 0,
      activityDistribution: { run: 0, strength: 0, rest: 0 },
      weeklyActivity: [],
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Create timezone-safe date key for today
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // --- Calculate Totals and Activity Distribution ---
  const totalWorkouts = workouts.length;
  let completedWorkouts = 0;
  let totalRunDistance = 0;
  let totalWorkoutDuration = 0;
  const activityDistribution = { run: 0, strength: 0, rest: 0 };

  for (const workout of workouts) {
    if (workout.is_completed) {
      completedWorkouts++;

      if (workout.activity_type === "Run" && workout.structure) {
        const runStructure = workout.structure as RunStructure;
        if (runStructure.distance) {
          const distanceStr = String(runStructure.distance);
          // Match "3 mi", "3.5 mi", "3mi", "3.5mi", "3 miles", etc.
          const match = distanceStr.match(/(\d+(\.\d+)?)\s*(mi|miles)?/i);
          if (match) {
            totalRunDistance += parseFloat(match[1]);
          }
        }
        if (runStructure.duration) {
          totalWorkoutDuration += parseDurationToMinutes(String(runStructure.duration));
        }
      } else if (workout.activity_type === "Strength" && workout.structure) {
        const strengthStructure = workout.structure as StrengthStructure;
        if (strengthStructure.duration) {
          totalWorkoutDuration += parseDurationToMinutes(String(strengthStructure.duration));
        } else if (strengthStructure.exercises) {
          // Estimate duration for strength if not explicitly provided in structure
          // A simple heuristic: 5 minutes per exercise for example
          totalWorkoutDuration += strengthStructure.exercises.length * 5;
        }
      } else if (workout.activity_type === "Rest" && workout.structure) {
        const restStructure = workout.structure as RestStructure;
        // Rest days typically have no duration for tracking, but if it had, process it here
      }
    }

    // Count activity types regardless of completion for distribution
    if (workout.activity_type === "Run") activityDistribution.run++;
    else if (workout.activity_type === "Strength") activityDistribution.strength++;
    else if (workout.activity_type === "Rest") activityDistribution.rest++;
  }

  // --- Calculate Current Streak ---
  // Include both completed workouts AND rest days (rest days count toward streak)
  const streakDates = new Set(
    workouts
      .filter((w) => w.is_completed || w.activity_type === "Rest")
      .map((w) => w.scheduled_date.split("T")[0])
  );

  let currentStreak = 0;
  const checkDate = new Date(today);

  // Check up to 365 days back
  for (let i = 0; i < 365; i++) {
    const dateKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;

    if (streakDates.has(dateKey)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0) {
      // Today not completed - streak is 0
      break;
    } else {
      // Gap found - streak ends
      break;
    }
  }


  // --- Calculate Weekly Adherence and Weekly Activity (last 4 weeks) ---
  const weeklyActivityMap = new Map<string, { completed: number; scheduled: number }>();
  const startOfCurrentWeek = new Date(today);
  startOfCurrentWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday of current week

  let currentWeekCompleted = 0;
  let currentWeekScheduled = 0;

  for (const workout of workouts) {
    // Parse date from string to avoid timezone issues
    const [year, month, day] = workout.scheduled_date.split("T")[0].split("-").map(Number);
    const workoutDate = new Date(year, month - 1, day);
    workoutDate.setHours(0, 0, 0, 0);

    // Use Monday-based week key for grouping
    const weekKey = getWeekKey(workoutDate);

    if (!weeklyActivityMap.has(weekKey)) {
      weeklyActivityMap.set(weekKey, { completed: 0, scheduled: 0 });
    }
    const weekStats = weeklyActivityMap.get(weekKey)!;
    weekStats.scheduled++;
    if (workout.is_completed) {
      weekStats.completed++;
    }

    // Calculate current week's adherence
    if (workoutDate >= startOfCurrentWeek && workoutDate <= today) {
      currentWeekScheduled++;
      if (workout.is_completed) {
        currentWeekCompleted++;
      }
    }
  }

  const weeklyAdherence = currentWeekScheduled > 0 ? (currentWeekCompleted / currentWeekScheduled) * 100 : 0;


  // Filter weeklyActivity for the last 4 weeks (or all if less than 4)
  // Week keys are already Monday dates in YYYY-MM-DD format
  const currentWeekKey = getWeekKey(today);

  const sortedWeeklyActivity = Array.from(weeklyActivityMap.entries())
    .sort(([weekA], [weekB]) => weekA.localeCompare(weekB))
    .map(([weekKey, stats]) => ({
      date: weekKey, // Already the Monday's date
      completed: stats.completed,
      scheduled: stats.scheduled,
    }));

  // Filter to only include weeks up to and including current week (exclude future weeks)
  const pastAndCurrentWeeks = sortedWeeklyActivity.filter(
    (week) => week.date <= currentWeekKey
  );

  return {
    totalWorkouts,
    completedWorkouts,
    weeklyAdherence: parseFloat(weeklyAdherence.toFixed(1)),
    currentStreak,
    totalRunDistance: parseFloat(totalRunDistance.toFixed(1)),
    totalWorkoutDuration: parseFloat(totalWorkoutDuration.toFixed(1)),
    activityDistribution,
    weeklyActivity: pastAndCurrentWeeks.slice(-4), // Get last 4 past/current weeks
  };
}