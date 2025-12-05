"use client";

import Image from "next/image";

interface WorkoutCardProps {
  id: string;
  type: "strength" | "run" | "rest";
  title: string;
  subtitle: string;
  status: "pending" | "completed";
  onClick?: () => void;
}

export default function WorkoutCard({
  type,
  title,
  subtitle,
  status,
  onClick,
}: WorkoutCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-[15px] p-4 pr-6 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-left relative"
    >
      {/* Icon Container with Gradient Overlay */}
      <div className="flex-shrink-0 relative w-[50px] h-[50px]">
        {type === "strength" && (
          <>
            <Image
              src="/images/black-to-white-1.png"
              alt="Strength icon"
              width={50}
              height={50}
              className="w-full h-full object-contain"
            />
          </>
        )}
        {type === "run" && (
          <Image
            src="/images/run-icon-1.png"
            alt="Run icon"
            width={50}
            height={50}
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Title & Subtitle */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[30px] font-medium tracking-figma text-black leading-tight">
          {title}
        </h3>
        <p className="text-[20px] font-light tracking-figma text-black/80 leading-tight mt-1">
          {subtitle}
        </p>
      </div>

      {/* Completed Badge */}
      {status === "completed" && (
        <span className="text-[20px] font-semibold text-black flex-shrink-0 leading-[2.5em]">
          Completed
        </span>
      )}
    </button>
  );
}
