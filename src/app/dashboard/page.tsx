import { redirect } from "next/navigation";
import { getProfile } from "@/utils/auth/profile";
import DashboardHeader from "./components/DashboardHeader";
import TodaysPlan from "./components/TodaysPlan";
import WeeklyCalendar from "./components/WeeklyCalendar";
import ChatInterface from "./components/ChatInterface";
import ChatFloatingButton from "./components/ChatFloatingButton";
import { getTodaysWorkouts, getWeekWorkouts } from "./actions";
import { getChatHistory } from "./chat-actions";

// Helper to get Monday of the current week
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Format date as YYYY-MM-DD
function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default async function DashboardPage() {
  const { user, profile } = await getProfile();

  if (!user) {
    redirect("/login");
  }

  // Fetch today's workouts
  const todaysWorkouts = await getTodaysWorkouts();

  // Fetch this week's workouts
  const today = new Date();
  const weekStart = getMonday(today);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekWorkouts = await getWeekWorkouts(
    formatDateKey(weekStart),
    formatDateKey(weekEnd)
  );

  // Fetch chat history for the AI chat interface
  const chatHistory = await getChatHistory();

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/images/quill-background-2.png')" }}
    >
      {/* Header */}
      <DashboardHeader userName={profile?.name} />

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-16 py-6 max-md:px-5">
        {/* Welcome Heading */}
        <h1 className="text-[70px] font-medium tracking-figma text-black mb-7 max-md:text-4xl leading-tight">
          Welcome Back, {profile?.name || "Runner"}!
        </h1>

        {/* Two Column Layout */}
        <div className="flex gap-10 max-lg:flex-col">
          {/* Left Column - Main Content */}
          <div className="flex-1 space-y-8">
            <TodaysPlan workouts={todaysWorkouts} />
            <WeeklyCalendar initialWorkouts={weekWorkouts} />
          </div>

          {/* Right Column - Chat (hidden on mobile) */}
          <div className="hidden lg:block w-[500px] h-[550px]">
            <ChatInterface initialHistory={chatHistory} />
          </div>
        </div>
      </main>

      {/* Mobile Floating Chat Button */}
      <ChatFloatingButton initialHistory={chatHistory} />
    </div>
  );
}
