"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export interface ProfileUpdateData {
  name: string;
  goal: string;
  custom_goal_text: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
}

export async function updateProfile(data: ProfileUpdateData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      name: data.name,
      goal: data.goal,
      custom_goal_text: data.custom_goal_text,
      age: data.age,
      height: data.height,
      weight: data.weight,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function resetTrainingPlan() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Step 1: Get all training plan IDs for this user
  const { data: plans } = await supabase
    .from("training_plans")
    .select("id")
    .eq("user_id", user.id);

  if (plans && plans.length > 0) {
    const planIds = plans.map((p) => p.id);

    // Step 2: Delete all workouts for these plans
    await supabase
      .from("workouts")
      .delete()
      .in("plan_id", planIds);

    // Step 3: Delete all training plans for this user
    await supabase
      .from("training_plans")
      .delete()
      .eq("user_id", user.id);
  }

  // Step 4: Reset onboarding flag
  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_completed: false,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Redirect to onboarding
  redirect("/onboarding");
}

export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  // Redirect to landing page
  redirect("/");
}
