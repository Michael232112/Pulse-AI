"use client";

import { useRouter } from "next/navigation";
import WorkoutCard from "./WorkoutCard";
import type { Workout } from "../actions";

interface TodaysPlanProps {
  workouts: Workout[];
}

// Map database activity_type to component type
function mapActivityType(activityType: string): "run" | "strength" | "rest" {
  const type = activityType.toLowerCase();
  if (type === "run") return "run";
  if (type === "strength") return "strength";
  if (type === "rest") return "rest";
  return "run"; // default
}

export default function TodaysPlan({ workouts }: TodaysPlanProps) {
  const router = useRouter();

  // Get current day name
  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const handleWorkoutClick = (workoutId: string) => {
    router.push(`/dashboard/workout/${workoutId}`);
  };

  return (
    <div className="bg-primary rounded-[10px] p-8 shadow-figma-card max-w-[664px]">
      {/* Header */}
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="text-[40px] font-medium tracking-figma text-white leading-tight">
          Today&apos;s Plan
        </h2>
        <span className="text-[40px] font-medium tracking-figma text-white/90 leading-tight">
          ({dayName})
        </span>
      </div>

      {/* Workout Cards */}
      <div className="space-y-4">
        {workouts.length === 0 ? (
          <div className="bg-white/90 rounded-[10px] p-6 text-center">
            <p className="text-gray-600">No workouts scheduled for today</p>
          </div>
        ) : (
          workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              id={workout.id}
              type={mapActivityType(workout.activity_type)}
              title={workout.title}
              subtitle={workout.description || ""}
              status={workout.is_completed ? "completed" : "pending"}
              onClick={() => handleWorkoutClick(workout.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
