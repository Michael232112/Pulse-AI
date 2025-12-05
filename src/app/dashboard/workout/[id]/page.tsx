import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardHeader from "../../components/DashboardHeader";
import { getWorkout, Workout } from "@/app/dashboard/actions"; // Import getWorkout and Workout type
import MarkAsCompleteButton from "./components/MarkCompleteButton"; // Import the new component

// Define types for workout structure
interface RunStructure {
  distance?: string;
  duration: string;
  pace?: string;
  instructions: string;
}

interface StrengthStructure {
  duration: string;
  exercises: string[];
  instructions: string;
}

interface RestStructure {
  instructions: string;
}

// Metric Card Component
function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white rounded-[10px] px-6 py-4 flex-1 min-w-[150px]">
      <p className="text-primary text-[20px] font-light tracking-figma mb-1">
        {label}
      </p>
      <p className="text-primary text-[40px] font-medium tracking-figma max-md:text-[28px]">
        {value}
      </p>
    </div>
  );
}

export default async function WorkoutDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workout = await getWorkout(id); // Fetch real workout data

  if (!workout) {
    notFound();
  }

  // Determine which metrics to show based on workout type and parse structure
  let metrics: { label: string; value: string | number }[] = [];
  let structureContent: React.ReactNode = null;

  switch (workout.activity_type) {
    case "Run":
      const runStructure = workout.structure as unknown as RunStructure;
      metrics = [
        { label: "Distance", value: runStructure?.distance || "-" },
        { label: "Duration", value: runStructure?.duration || "-" },
        { label: "Pace", value: runStructure?.pace || "-" },
      ];
      structureContent = <p>{runStructure?.instructions}</p>;
      break;
    case "Strength":
      const strengthStructure = workout.structure as unknown as StrengthStructure;
      metrics = [{ label: "Duration", value: strengthStructure?.duration || "-" }];
      structureContent = (
        <>
          <p className="mb-4">{strengthStructure?.instructions}</p>
          {strengthStructure?.exercises && strengthStructure.exercises.length > 0 && (
            <ul className="list-disc list-inside space-y-1">
              {strengthStructure.exercises.map((exercise, index) => (
                <li key={index}>{exercise}</li>
              ))}
            </ul>
          )}
        </>
      );
      break;
    case "Rest":
      const restStructure = workout.structure as unknown as RestStructure;
      metrics = []; // No specific metrics for rest days
      structureContent = <p>{restStructure?.instructions}</p>;
      break;
    default:
      structureContent = <p>{workout.description || "No specific instructions."}</p>;
      break;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/images/quill-background-2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <DashboardHeader />

        <main className="px-16 pb-12 max-md:px-5">
          <div className="max-w-[1300px] mx-auto">
            {/* Back Link */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-[35px] font-medium tracking-figma text-black mb-6 hover:opacity-70 transition-opacity max-md:text-xl"
            >
              <span className="text-[28px]">&lt;</span>
              Back to Plan
            </Link>

            {/* Main Workout Card */}
            <div className="bg-primary rounded-[10px] p-10 shadow-figma-card max-md:p-6">
              {/* Title & Subtitle */}
              <h1 className="text-white text-[50px] font-medium tracking-figma mb-2 max-md:text-3xl">
                {workout.title}
              </h1>
              <p className="text-white text-[30px] font-light tracking-figma mb-8 max-md:text-lg">
                {workout.description}
              </p>

              {/* Metrics Row */}
              {metrics.length > 0 && (
                <div className="flex gap-6 mb-10 flex-wrap max-md:flex-col">
                  {metrics.map((metric) => (
                    <MetricCard
                      key={metric.label}
                      label={metric.label}
                      value={metric.value}
                    />
                  ))}
                </div>
              )}

              {/* Structure Section */}
              <div className="mb-10 text-white text-[30px] font-light tracking-figma leading-relaxed max-md:text-base">
                <h2 className="text-white text-[50px] font-medium tracking-figma mb-4 max-md:text-2xl">
                  Structure
                </h2>
                {structureContent}
              </div>

              {/* Mark As Complete Button */}
              <div className="flex justify-end">
                <MarkAsCompleteButton
                  workoutId={workout.id}
                  initialIsCompleted={workout.is_completed}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}