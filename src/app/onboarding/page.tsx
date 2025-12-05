"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingEffectHandler from "./OnboardingEffectHandler"; // Import the new component

const goals = [
  { id: "marathon", label: "Finish a Marathon", variant: "primary" },
  { id: "5k", label: "Run a Faster 5K", variant: "secondary" },
  { id: "habit", label: "Build a running Habit", variant: "primary" },
  { id: "custom", label: "Custom Training", variant: "secondary" },
] as const;

// Dynamic text mapping for Step 2
const goalLabels: Record<string, string> = {
  marathon: "Training for a marathon",
  "5k": "Training for a 5K",
  habit: "Building a running habit",
  custom: "Your custom goal",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [formData, setFormData] = useState({
    goal: "",
    customGoalText: "",
    runsPerWeek: 0,
    strengthDaysText: "", // Text input for strength training days
  });
  const [scheduleError, setScheduleError] = useState("");

  // Render the effect handler component
  // It will manage the side effect for step 4
  // We render it conditionally to ensure its effect runs only when step is 4
  // This also means its props (like formData) are only accessed when step is 4
  const renderOnboardingEffectHandler = step === 4;

  const handleGoalSelect = (goalId: string) => {
    setFormData((prev) => ({ ...prev, goal: goalId }));

    if (goalId === "custom") {
      setStep(1.5);
    } else {
      setStep(2);
    }
  };

  const handleCustomGoalSubmit = () => {
    if (formData.customGoalText.trim()) {
      setStep(2);
    }
  };

  const handleFrequencySubmit = () => {
    if (formData.runsPerWeek >= 2 && formData.runsPerWeek <= 7) {
      setStep(3);
    }
  };

  const isValidFrequency =
    formData.runsPerWeek >= 2 && formData.runsPerWeek <= 7;

  const handleStrengthDaysSubmit = () => {
    // Parse strength days from text input
    const strengthDays = formData.strengthDaysText
      .split(/[,\s]+/)
      .map(d => d.trim().toLowerCase())
      .filter(d => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(d));

    // Validate schedule is possible
    const totalActivities = formData.runsPerWeek + strengthDays.length;
    if (totalActivities > 7) {
      setScheduleError(
        `Cannot schedule ${formData.runsPerWeek} runs and ${strengthDays.length} strength days in one week (${totalActivities} > 7 days). Please reduce either runs per week or strength days.`
      );
      return;
    }

    setScheduleError("");
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8C9A8] to-[#F5E6D8]">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 md:px-10">
        <div className="w-16" /> {/* Spacer for centering */}
        <h1 className="text-3xl font-bold tracking-[-0.05em]">pulse.</h1>
        {step !== 4 && (
          <Link
            href="/"
            className="text-black text-lg font-normal hover:opacity-70 transition-opacity"
          >
            Back
          </Link>
        )}
        {step === 4 && <div className="w-16" />}
      </header>

      {/* Conditionally render the OnboardingEffectHandler */}
      {renderOnboardingEffectHandler && (
        <OnboardingEffectHandler
          step={step}
          isSaving={isSaving}
          setIsSaving={setIsSaving}
          setLoadingStatus={setLoadingStatus}
          formData={formData}
        />
      )}

      {/* Content */}
      <main className="flex flex-col items-center px-5 md:px-10 pt-16">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-[500px]"
            >
              {/* AI Question */}
              <div className="flex items-start gap-4 mb-12">
                <Image
                  src="/images/pulse-logo.png"
                  alt="Pulse AI"
                  width={32}
                  height={32}
                  className="flex-shrink-0 mt-1"
                />
                <p className="text-lg md:text-xl font-normal text-black">
                  Hey there! I&apos;m your AI running coach. To get started,
                  what&apos;s your primary goal?
                </p>
              </div>

              {/* Goal Buttons */}
              <div className="flex flex-col gap-4">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => handleGoalSelect(goal.id)}
                    className={`
                      w-full py-4 px-6 rounded-full text-base font-medium
                      transition-all duration-300 hover:-translate-y-0.5
                      hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]
                      ${
                        goal.variant === "primary"
                          ? "bg-primary text-white"
                          : "bg-white text-black"
                      }
                      ${formData.goal === goal.id ? "ring-2 ring-black ring-offset-2" : ""}
                    `}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1.5: Custom Training Input */}
          {step === 1.5 && (
            <motion.div
              key="step1.5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-[500px]"
            >
              {/* AI Question */}
              <div className="flex items-start gap-4 mb-8">
                <Image
                  src="/images/pulse-logo.png"
                  alt="Pulse AI"
                  width={32}
                  height={32}
                  className="flex-shrink-0 mt-1"
                />
                <p className="text-lg md:text-xl font-normal text-black">
                  Got it. Tell me more about your specific training goal. Are
                  you training for a sport, sprinting, or something else?
                </p>
              </div>

              {/* Custom Goal Textarea */}
              <textarea
                value={formData.customGoalText}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customGoalText: e.target.value,
                  }))
                }
                placeholder="e.g., I play rugby and want to run faster"
                className="w-full h-32 px-4 py-3 rounded-2xl bg-white text-black text-base font-normal resize-none focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-400"
              />

              {/* Next Button */}
              <button
                onClick={handleCustomGoalSubmit}
                disabled={!formData.customGoalText.trim()}
                className={`
                  w-full mt-6 py-4 px-6 rounded-full text-base font-medium
                  transition-all duration-300
                  ${
                    formData.customGoalText.trim()
                      ? "bg-primary text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }
                `}
              >
                Next
              </button>
            </motion.div>
          )}

          {/* Step 2: Frequency Input */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-[500px]"
            >
              {/* AI Question */}
              <div className="flex items-start gap-4 mb-12">
                <Image
                  src="/images/pulse-logo.png"
                  alt="Pulse AI"
                  width={32}
                  height={32}
                  className="flex-shrink-0 mt-1"
                />
                <p className="text-lg md:text-xl font-normal text-black">
                  Great! {goalLabels[formData.goal] || "Your goal"} is an
                  excellent goal. How many days per week can you dedicate to
                  running?
                </p>
              </div>

              {/* Frequency Input */}
              <input
                type="number"
                min={2}
                max={7}
                value={formData.runsPerWeek || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setFormData((prev) => ({ ...prev, runsPerWeek: value }));
                }}
                placeholder="Please enter between 2-7"
                className="w-full px-6 py-4 rounded-full bg-white text-black text-base font-normal text-center focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-400"
              />

              {/* Next Button */}
              <button
                onClick={handleFrequencySubmit}
                disabled={!isValidFrequency}
                className={`
                  w-full mt-6 py-4 px-6 rounded-full text-base font-medium
                  transition-all duration-300
                  ${
                    isValidFrequency
                      ? "bg-primary text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                      : "bg-primary/50 text-white/70 cursor-not-allowed"
                  }
                `}
              >
                Next
              </button>
            </motion.div>
          )}

          {/* Step 3: Strength Training Days */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-[500px]"
            >
              {/* AI Question */}
              <div className="flex items-start gap-4 mb-12">
                <Image
                  src="/images/pulse-logo.png"
                  alt="Pulse AI"
                  width={32}
                  height={32}
                  className="flex-shrink-0 mt-1"
                />
                <p className="text-lg md:text-xl font-normal text-black">
                  Great. To prevent burnout, I need to plan your hard runs
                  around your other high-intensity workouts. On which days do
                  you typically do strength training?
                </p>
              </div>

              {/* Strength Days Input */}
              <input
                type="text"
                value={formData.strengthDaysText}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    strengthDaysText: e.target.value,
                  }));
                  setScheduleError(""); // Clear error when user types
                }}
                placeholder="e.g., 'Monday', 'Wednesday', 'Friday'."
                className="w-full px-6 py-4 rounded-full bg-white text-black text-base font-normal text-center focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-400"
              />

              {/* Schedule Error Message */}
              {scheduleError && (
                <p className="mt-3 text-sm text-red-600 text-center">
                  {scheduleError}
                </p>
              )}

              {/* Next Button */}
              <button
                onClick={handleStrengthDaysSubmit}
                className="w-full mt-6 py-4 px-6 rounded-full text-base font-medium bg-primary text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              >
                Next
              </button>
            </motion.div>
          )}

          {/* Step 4: Building Plan with AI */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-[500px] text-center"
            >
              {/* Animated Pulse Logo */}
              <div className="flex justify-center mb-8">
                <Image
                  src="/images/pulse-logo.png"
                  alt="Pulse AI"
                  width={64}
                  height={64}
                  className="animate-pulse"
                />
              </div>

              <h2 className="text-2xl font-bold text-black mb-4">
                {loadingStatus || "Building your plan..."}
              </h2>
              <p className="text-lg text-black/70">
                {loadingStatus.includes("Error")
                  ? "Something went wrong. Please try again."
                  : "Analyzing your goals and schedule to create the perfect training program for you."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}