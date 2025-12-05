import React from "react";

interface WeeklyActivityData {
  date: string;
  completed: number;
  scheduled: number;
}

interface WeeklyActivityChartProps {
  data: WeeklyActivityData[];
}

export default function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  // Find max scheduled workouts for scaling the bars
  const maxScheduled = Math.max(...data.map((week) => week.scheduled), 1); // Avoid division by zero

  return (
    <div className="bg-white rounded-[10px] p-6 shadow-figma-card">
      <h2 className="text-black text-3xl font-medium mb-6">Weekly Activity (Last 4 Weeks)</h2>
      <div className="flex justify-between items-end h-48 gap-4 px-2">
        {data.map((week, index) => {
          const weekLabel = new Date(week.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          const completedHeight = (week.completed / maxScheduled) * 100;
          const scheduledHeight = (week.scheduled / maxScheduled) * 100;

          return (
            <div key={index} className="flex flex-col items-center flex-1 h-full justify-end">
              <div className="relative w-full h-full flex items-end justify-center">
                {/* Scheduled Bar (background) */}
                <div
                  className="absolute bottom-0 w-3/4 bg-gray-200 rounded-t-sm"
                  style={{ height: `${scheduledHeight}%` }}
                ></div>
                {/* Completed Bar (foreground) */}
                <div
                  className="absolute bottom-0 w-3/4 bg-primary rounded-t-sm"
                  style={{ height: `${completedHeight}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{weekLabel}</p>
              <p className="text-xs text-gray-500">
                {week.completed}/{week.scheduled}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
