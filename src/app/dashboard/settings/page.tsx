import { redirect } from "next/navigation";
import { getProfile } from "@/utils/auth/profile";
import DashboardHeader from "../components/DashboardHeader";
import ProfileSection from "./components/ProfileSection";
import ConnectedServicesSection from "./components/ConnectedServicesSection";
import ManagePlanSection from "./components/ManagePlanSection";
import SignOutSection from "./components/SignOutSection";

export default async function SettingsPage() {
  const { user, profile } = await getProfile();

  if (!user) {
    redirect("/login");
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
            {/* Settings Title */}
            <h1 className="text-[70px] font-medium tracking-figma text-black mb-8 max-md:text-4xl">
              Settings
            </h1>

            {/* Profile Section */}
            <ProfileSection
              initialProfile={{
                name: profile?.name || "",
                goal: profile?.goal || "",
                custom_goal_text: profile?.custom_goal_text || null,
                age: profile?.age || null,
                height: profile?.height || null,
                weight: profile?.weight || null,
              }}
            />

            {/* Connected Services */}
            <ConnectedServicesSection />

            {/* Manage Plan */}
            <ManagePlanSection />

            {/* Sign Out */}
            <SignOutSection />
          </div>
        </main>
      </div>
    </div>
  );
}
