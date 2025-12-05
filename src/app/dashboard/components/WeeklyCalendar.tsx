"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import DayCell from "./DayCell";
import { getWeekWorkouts, type Workout } from "../actions";

// Map database activity_type to component type
function mapActivityType(activityType: string): "run" | "strength" | "rest" | "interval" {
  const type = activityType.toLowerCase();
  if (type === "run") return "run";
  if (type === "strength") return "strength";
  if (type === "rest") return "rest";
  return "run"; // default
}

interface WeeklyCalendarProps {
  initialWorkouts: Record<string, Workout[]>;
}

// Helper to get Monday of the week for a given date
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  return new Date(d.setDate(diff));
}

// Helper to format date as YYYY-MM-DD
function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Helper to check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export default function WeeklyCalendar({ initialWorkouts }: WeeklyCalendarProps) {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState(() => getMonday(today));
  const [workouts, setWorkouts] = useState<Record<string, Workout[]>>(initialWorkouts);
  const [isLoading, setIsLoading] = useState(false);

  const handleWorkoutClick = (workoutId: string) => {
    router.push(`/dashboard/workout/${workoutId}`);
  };

  // Fetch workouts when week changes
  useEffect(() => {
    const fetchWorkouts = async () => {
      setIsLoading(true);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const startStr = formatDateKey(weekStart);
      const endStr = formatDateKey(weekEnd);

      const data = await getWeekWorkouts(startStr, endStr);
      setWorkouts(data);
      setIsLoading(false);
    };

    // Only fetch if we're not on the initial week
    const initialWeekStart = getMonday(today);
    if (formatDateKey(weekStart) !== formatDateKey(initialWeekStart)) {
      fetchWorkouts();
    }
  }, [weekStart, today]);

  // Generate the 7 days of the current week
  const weekDays = useMemo(() => {
    const days = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateKey = formatDateKey(date);

      // Map database workouts to component format
      const dayWorkouts = (workouts[dateKey] || []).map((w) => ({
        id: w.id,
        name: w.title,
        type: mapActivityType(w.activity_type),
      }));

      days.push({
        date,
        dayName: dayNames[i],
        dayNumber: date.getDate(),
        activities: dayWorkouts,
        isToday: isSameDay(date, today),
      });
    }
    return days;
  }, [weekStart, today, workouts]);

  // Get month/year display
  const monthYear = weekStart.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handlePrevWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(weekStart.getDate() - 7);
    setWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(weekStart.getDate() + 7);
    setWeekStart(newStart);
  };

  return (
    <div className="bg-white rounded-[15px] p-6 shadow-figma-dropdown">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevWeek}
          className="w-10 h-10 flex items-center justify-center text-[20px] font-medium text-black hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Previous week"
        >
          &lt;
        </button>

        <h3 className="text-[24px] font-medium tracking-figma text-black">
          {monthYear}
        </h3>

        <button
          onClick={handleNextWeek}
          className="w-10 h-10 flex items-center justify-center text-[20px] font-medium text-black hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Next week"
        >
          &gt;
        </button>
      </div>

      {/* Days Grid - 7 columns on desktop, horizontal scroll on mobile */}
      <div className="grid grid-cols-7 gap-1 max-md:flex max-md:overflow-x-auto max-md:gap-2 max-md:pb-2 scrollbar-hide">
        {weekDays.map((day, index) => (
          <DayCell
            key={formatDateKey(day.date)}
            dayNumber={day.dayNumber}
            dayName={day.dayName}
            activities={day.activities}
            isToday={day.isToday}
            isAlternate={index % 2 === 1}
            onWorkoutClick={handleWorkoutClick}
          />
        ))}
      </div>
    </div>
  );
}
