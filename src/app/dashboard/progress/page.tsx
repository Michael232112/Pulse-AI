import { redirect } from "next/navigation";
import { getProfile } from "@/utils/auth/profile";
import DashboardHeader from "../components/DashboardHeader";
import { getUserStats, UserStats } from "./actions";
import Link from "next/link";
import { CheckCircle, Flame, Target, Timer } from "lucide-react"; // Icons for metric cards
import WeeklyActivityChart from "./components/WeeklyActivityChart"; // Import the chart component

// Metric Card Component
function MetricCard({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[10px] px-6 py-4 shadow-figma-card flex-1 min-w-[200px] max-w-[300px]">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-primary text-[20px] font-light tracking-figma">{label}</p>
      </div>
      <p className="text-primary text-[40px] font-medium tracking-figma max-md:text-[28px]">
        {value}
        {unit && <span className="text-xl ml-1">{unit}</span>}
      </p>
    </div>
  );
}

// Empty State Component
function EmptyProgressState() {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white rounded-[10px] shadow-figma-card text-center min-h-[400px]">
      <Flame size={64} className="text-primary mb-4" />
      <h2 className="text-3xl font-medium text-black mb-2">Your Journey Begins Now&apos;!</h2>
      <p className="text-lg text-gray-600 mb-6 max-w-md">
        Complete your first workout to start tracking your progress, streaks, and achievements.
      </p>
      <Link
        href="/dashboard"
        className="bg-primary text-white text-[20px] font-medium tracking-figma px-8 py-3 rounded-[10px] hover:bg-primary/90 transition-colors"
      >
        Go to Today's Workout
      </Link>
    </div>
  );
}

export default async function ProgressPage() {
  const { user, profile } = await getProfile();

  if (!user) {
    redirect("/login");
  }

  const stats = await getUserStats();

  if (!stats || stats.totalWorkouts === 0) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url('/images/quill-background-2.png')" }}
      >
        <DashboardHeader userName={profile?.name} />
        <main className="max-w-[1440px] mx-auto px-16 py-6 max-md:px-5">
          <h1 className="text-[70px] font-medium tracking-figma text-black mb-7 max-md:text-4xl leading-tight">
            Your Progress
          </h1>
          <EmptyProgressState />
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/images/quill-background-2.png')" }}
    >
      <DashboardHeader userName={profile?.name} />
      <main className="max-w-[1440px] mx-auto px-16 py-6 max-md:px-5">
        <h1 className="text-[70px] font-medium tracking-figma text-black mb-7 max-md:text-4xl leading-tight">
          Your Progress
        </h1>

        {/* Summary Cards */}
        <div className="flex gap-6 mb-10 flex-wrap justify-center">
          <MetricCard
            label="Current Streak"
            value={stats.currentStreak}
            unit="days"
            icon={<Flame size={24} className="text-orange-500" />}
          />
          <MetricCard
            label="Weekly Adherence"
            value={stats.weeklyAdherence}
            unit="%"
            icon={<Target size={24} className="text-green-500" />}
          />
          <MetricCard
            label="Total Run Distance"
            value={stats.totalRunDistance}
            unit="mi"
            icon={<CheckCircle size={24} className="text-blue-500" />}
          />
          <MetricCard
            label="Total Duration"
            value={stats.totalWorkoutDuration}
            unit="min"
            icon={<Timer size={24} className="text-purple-500" />}
          />
        </div>

        {/* Weekly Activity Chart */}
        <WeeklyActivityChart data={stats.weeklyActivity} />
      </main>
    </div>
  );
}
