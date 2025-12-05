"use client";

interface Activity {
  id: string;
  name: string;
  type: "run" | "strength" | "rest" | "interval";
}

interface DayCellProps {
  dayNumber: number;
  dayName: string;
  activities: Activity[];
  isToday: boolean;
  isAlternate?: boolean;
  onWorkoutClick?: (workoutId: string) => void;
}

// Get pill styles based on workout type
function getPillStyles(type: Activity["type"]): string {
  switch (type) {
    case "run":
      return "bg-primary text-white";
    case "strength":
      return "bg-black text-white";
    case "interval":
      return "bg-primary/80 text-white";
    case "rest":
      return "bg-transparent border border-dashed border-gray-400 text-gray-500";
    default:
      return "bg-gray-200 text-gray-700";
  }
}

export default function DayCell({
  dayNumber,
  dayName,
  activities,
  isToday,
  isAlternate = false,
  onWorkoutClick,
}: DayCellProps) {
  // Determine background color
  const bgColor = isToday
    ? "bg-primary/10"
    : isAlternate
    ? "bg-[#F5EDE6]"
    : "bg-white";

  return (
    <div
      className={`
        flex flex-col p-3 min-w-[80px] min-h-[120px] rounded-lg
        ${bgColor}
        ${isToday ? "ring-2 ring-primary ring-inset" : ""}
        transition-colors hover:bg-primary/5
      `}
    >
      {/* Day Header */}
      <div className="text-center mb-2">
        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
          {dayName}
        </span>
        <div
          className={`
            text-[18px] font-semibold mt-0.5
            ${isToday ? "text-primary" : "text-black"}
          `}
        >
          {dayNumber}
        </div>
      </div>

      {/* Activity Pills */}
      <div className="flex flex-col gap-1.5 flex-1">
        {activities.length === 0 ? (
          <div className="text-[10px] text-gray-400 text-center mt-2">
            No workouts
          </div>
        ) : (
          activities.map((activity) => (
            <button
              key={activity.id}
              onClick={() => onWorkoutClick?.(activity.id)}
              className={`
                rounded px-2 py-1 text-[10px] font-medium text-center truncate
                ${getPillStyles(activity.type)}
                ${onWorkoutClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
              `}
              title={activity.name}
            >
              {activity.name}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
