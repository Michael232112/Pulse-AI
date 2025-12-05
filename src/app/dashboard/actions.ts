"use server";

import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export interface Workout {
  id: string;
  plan_id: string;
  scheduled_date: string;
  day_offset: number;
  title: string;
  activity_type: "Run" | "Strength" | "Rest";
  description: string | null;
  structure: Record<string, unknown> | null;
  is_completed: boolean;
}

// Get today's workouts for the current user
export async function getTodaysWorkouts(): Promise<Workout[]> {
  noStore();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  const { data: workouts, error } = await supabase
    .from("workouts")
    .select(
      `
      id,
      plan_id,
      scheduled_date,
      day_offset,
      title,
      activity_type,
      description,
      structure,
      is_completed,
      training_plans!inner(user_id)
    `
    )
    .eq("training_plans.user_id", user.id)
    .eq("scheduled_date", today)
    .order("day_offset", { ascending: true });

  if (error) {
    console.error("Error fetching today's workouts:", error);
    return [];
  }

  return (workouts || []) as unknown as Workout[];
}

// Get workouts for a date range (for weekly calendar)
export async function getWeekWorkouts(
  startDate: string,
  endDate: string
): Promise<Record<string, Workout[]>> {
  noStore();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {};
  }

  const { data: workouts, error } = await supabase
    .from("workouts")
    .select(
      `
      id,
      plan_id,
      scheduled_date,
      day_offset,
      title,
      activity_type,
      description,
      structure,
      is_completed,
      training_plans!inner(user_id)
    `
    )
    .eq("training_plans.user_id", user.id)
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate)
    .order("scheduled_date", { ascending: true });

  if (error) {
    console.error("Error fetching week workouts:", error);
    return {};
  }

  // Group workouts by date
  const grouped: Record<string, Workout[]> = {};
  for (const workout of (workouts || []) as unknown as Workout[]) {
    const dateKey = workout.scheduled_date;
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(workout);
  }

  return grouped;
}

// Get a single workout by ID for the current user
export async function getWorkout(id: string): Promise<Workout | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: workout, error } = await supabase
    .from("workouts")
    .select(
      `
      id,
      plan_id,
      scheduled_date,
      day_offset,
      title,
      activity_type,
      description,
      structure,
      is_completed,
      training_plans!inner(user_id)
    `
    )
    .eq("id", id)
    .eq("training_plans.user_id", user.id)
    .single(); // Ensure only one workout is returned

  if (error) {
    console.error("Error fetching workout:", error);
    return null;
  }

  return (workout || null) as unknown as Workout | null;
}

// Toggle workout completion status
export async function toggleWorkoutStatus(
  id: string,
  isCompleted: boolean
): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("User not authenticated.");
    return false;
  }

  // First, verify the workout belongs to the user
  const { data: existingWorkout, error: fetchError } = await supabase
    .from("workouts")
    .select("id, training_plans(user_id)")
    .eq("id", id)
    .single();

  const trainingPlan = existingWorkout?.training_plans as unknown as { user_id: string } | null;
  if (fetchError || !existingWorkout || !trainingPlan || trainingPlan.user_id !== user.id) {
    console.error("Workout not found or does not belong to user:", fetchError?.message);
    return false;
  }

  const { error } = await supabase
    .from("workouts")
    .update({ is_completed: isCompleted })
    .eq("id", id)
    .select(); // Select the updated row to ensure it worked

  if (error) {
    console.error("Error updating workout status:", error);
    return false;
  }

  // Invalidate cached pages that display workout data
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/progress");

  return true;
}
