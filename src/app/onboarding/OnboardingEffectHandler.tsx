"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "./actions";
import { createClient } from "@/utils/supabase/client";

interface OnboardingEffectHandlerProps {
  step: number;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  setLoadingStatus: (status: string) => void;
  formData: {
    goal: string;
    customGoalText: string;
    runsPerWeek: number;
    strengthDaysText: string;
  };
}

export default function OnboardingEffectHandler({
  step,
  isSaving,
  setIsSaving,
  setLoadingStatus,
  formData,
}: OnboardingEffectHandlerProps) {
  const router = useRouter();
  const hasStartedSavingRef = useRef(false);

  const startOnboardingProcess = useCallback(async () => {
    setIsSaving(true);
    setLoadingStatus("Saving your preferences...");
    const strengthDaysArray = formData.strengthDaysText
      .split(",")
      .map((day) => day.trim().toLowerCase())
      .filter((day) => day.length > 0);

    const result = await completeOnboarding({
      goal: formData.goal,
      customGoalText: formData.customGoalText,
      runsPerWeek: formData.runsPerWeek,
      strengthDays: strengthDaysArray,
    });

    if (result?.error || !result?.userId) {
      console.error("Failed to save onboarding data:", result?.error);
      setLoadingStatus("Error saving. Please try again.");
      setIsSaving(false);
      hasStartedSavingRef.current = false; // Reset ref on error to allow retry
      return;
    }

    setLoadingStatus("Building your personalized plan...");
    const supabase = createClient();
    const { error } = await supabase.functions.invoke("generate-plan", {
      body: { userId: result.userId },
    });

    if (error) {
      console.error("Failed to generate plan:", error);
      setLoadingStatus("Finishing up...");
    }

    router.push("/dashboard");
  }, [formData, router, setIsSaving, setLoadingStatus, hasStartedSavingRef]);

  useEffect(() => {
    if (step === 4 && !isSaving && !hasStartedSavingRef.current) {
      hasStartedSavingRef.current = true;
      startOnboardingProcess();
    }
  }, [step, isSaving, hasStartedSavingRef, startOnboardingProcess]);

  return null; // This component doesn't render anything visually
}