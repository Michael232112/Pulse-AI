"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleWorkoutStatus } from "@/app/dashboard/actions";
import { useToast } from "@/context/ToastContext"; // Import useToast

interface MarkAsCompleteButtonProps {
  workoutId: string;
  initialIsCompleted: boolean;
}

export default function MarkAsCompleteButton({
  workoutId,
  initialIsCompleted,
}: MarkAsCompleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const { showToast } = useToast(); // Use the toast hook

  const handleToggleComplete = async () => {
    startTransition(async () => {
      const success = await toggleWorkoutStatus(workoutId, !isCompleted);
      if (success) {
        setIsCompleted(!isCompleted);
        router.refresh(); // Refresh current route to re-fetch data
        showToast("Workout status updated!", "success"); // Show success toast
        // Revalidate the progress page path to ensure fresh data
        // This is a client-side action that needs to trigger server-side revalidation
        // For Next.js 14+ with server actions, calling revalidatePath from a client component
        // might require a server action wrapper, or rely on router.refresh() if it revalidates layout
        // For simplicity, we'll assume router.refresh() is sufficient or a server action for revalidation is implicit.
        // If not, a dedicated server action for revalidation would be needed here.
        // revalidatePath("/dashboard/progress"); // Cannot directly call from client component
      } else {
        console.error("Failed to toggle workout status");
        showToast("Failed to update workout status.", "error"); // Show error toast
      }
    });
  };

  return (
    <>
      {!isCompleted && (
        <button
          onClick={handleToggleComplete}
          disabled={isPending}
          className="bg-white text-primary text-[25px] font-medium tracking-figma px-8 py-3 rounded-[10px] hover:bg-white/90 transition-colors max-md:text-lg max-md:px-6 max-md:py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Updating..." : "Mark As Complete"}
        </button>
      )}

      {isCompleted && (
        <span className="bg-white/20 text-white text-[25px] font-medium tracking-figma px-8 py-3 rounded-[10px] max-md:text-lg">
          Completed
        </span>
      )}
    </>
  );
}
