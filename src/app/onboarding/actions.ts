"use server";

import { createClient } from "@/utils/supabase/server";

interface OnboardingData {
  goal: string;
  customGoalText: string;
  runsPerWeek: number;
  strengthDays: string[];
}

export async function completeOnboarding(data: OnboardingData) {
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
      goal: data.goal,
      custom_goal_text: data.customGoalText,
      runs_per_week: data.runsPerWeek,
      strength_days: data.strengthDays,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Return userId for edge function call (redirect handled in client)
  return { success: true, userId: user.id };
}
