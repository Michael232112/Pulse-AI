"use client";

import { useState, memo } from "react";
import { updateProfile, type ProfileUpdateData } from "../actions";

interface ProfileSectionProps {
  initialProfile: ProfileUpdateData;
}

interface ProfileRowProps {
  label: string;
  value: string | number | null;
  editValue: string | number | null;
  isEditing: boolean;
  type?: string;
  suffix?: string;
  onChange: (value: string | number | null) => void;
}

// Goal type labels
const goalLabels: Record<string, string> = {
  marathon: "Marathon",
  "5k": "5K",
  habit: "Build Running Habit",
  custom: "Custom",
};

// Memoized ProfileRow component to prevent re-renders on each keystroke
const ProfileRow = memo(function ProfileRow({
  label,
  value,
  editValue,
  isEditing,
  type = "text",
  suffix = "",
  onChange,
}: ProfileRowProps) {
  return (
    <div className="py-4 border-b-[3px] border-primary last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="w-full">
          <p className="text-primary text-[35px] font-medium tracking-figma leading-tight max-md:text-xl">
            {label}
          </p>
          {isEditing ? (
            <input
              type={type}
              value={editValue !== null ? editValue : ""}
              onChange={(e) => {
                const val =
                  type === "number"
                    ? e.target.value
                      ? parseFloat(e.target.value)
                      : null
                    : e.target.value;
                onChange(val);
              }}
              className="mt-1 text-primary text-[35px] font-medium tracking-figma bg-transparent border-b border-primary focus:outline-none w-full max-w-[300px] max-md:text-lg"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          ) : (
            <p className="text-primary text-[35px] font-medium tracking-figma max-md:text-lg">
              {value !== null && value !== "" ? `${value}${suffix}` : "-"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

export default function ProfileSection({ initialProfile }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [editedProfile, setEditedProfile] = useState(initialProfile);

  const handleEdit = () => {
    setEditedProfile(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateProfile(editedProfile);

    if (result.error) {
      alert(`Error saving profile: ${result.error}`);
      setIsSaving(false);
      return;
    }

    setProfile(editedProfile);
    setIsEditing(false);
    setIsSaving(false);
  };

  return (
    <section className="mb-10">
      <h2 className="text-[40px] font-semibold tracking-figma text-black mb-4 max-md:text-2xl">
        Profile
      </h2>

      <div className="bg-white rounded-[10px] shadow-figma-card p-8 max-md:p-4">
        {/* Edit/Save/Cancel buttons */}
        <div className="flex justify-end mb-4">
          {isEditing ? (
            <div className="flex gap-4">
              <button
                onClick={handleCancel}
                className="text-[35px] font-semibold tracking-figma text-gray-500 hover:text-gray-700 transition-colors max-md:text-lg"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="text-[35px] font-semibold tracking-figma text-primary hover:opacity-80 transition-opacity max-md:text-lg"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              className="text-[35px] font-semibold tracking-figma text-black hover:opacity-70 transition-opacity max-md:text-lg"
            >
              Edit
            </button>
          )}
        </div>

        {/* Profile Fields */}
        <ProfileRow
          label="Name"
          value={profile.name}
          editValue={editedProfile.name}
          isEditing={isEditing}
          onChange={(val) => setEditedProfile({ ...editedProfile, name: val as string })}
        />

        {/* Goal Type Dropdown */}
        <div className="py-4 border-b-[3px] border-primary">
          <div className="w-full">
            <p className="text-primary text-[35px] font-medium tracking-figma leading-tight max-md:text-xl">
              Current Goal
            </p>
            {isEditing ? (
              <select
                value={editedProfile.goal}
                onChange={(e) => {
                  const newGoal = e.target.value;
                  setEditedProfile({
                    ...editedProfile,
                    goal: newGoal,
                    custom_goal_text: newGoal === "custom" ? editedProfile.custom_goal_text : null,
                  });
                }}
                className="mt-1 text-primary text-[35px] font-medium tracking-figma bg-transparent border-b border-primary focus:outline-none max-md:text-lg"
              >
                <option value="marathon">Marathon</option>
                <option value="5k">5K</option>
                <option value="habit">Build Running Habit</option>
                <option value="custom">Custom</option>
              </select>
            ) : (
              <p className="text-primary text-[35px] font-medium tracking-figma max-md:text-lg">
                {profile.goal === "custom" && profile.custom_goal_text
                  ? profile.custom_goal_text
                  : goalLabels[profile.goal] || profile.goal || "-"}
              </p>
            )}
          </div>
        </div>

        {/* Custom Goal Text - only show when goal is "custom" */}
        {(isEditing ? editedProfile.goal === "custom" : profile.goal === "custom") && (
          <div className="py-4 border-b-[3px] border-primary">
            <div className="w-full">
              <p className="text-primary text-[35px] font-medium tracking-figma leading-tight max-md:text-xl">
                Custom Goal Details
              </p>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.custom_goal_text || ""}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, custom_goal_text: e.target.value || null })
                  }
                  className="mt-1 text-primary text-[35px] font-medium tracking-figma bg-transparent border-b border-primary focus:outline-none w-full max-w-[300px] max-md:text-lg"
                  placeholder="Enter your custom goal"
                />
              ) : (
                <p className="text-primary text-[35px] font-medium tracking-figma max-md:text-lg">
                  {profile.custom_goal_text || "-"}
                </p>
              )}
            </div>
          </div>
        )}

        <ProfileRow
          label="Age"
          value={profile.age}
          editValue={editedProfile.age}
          isEditing={isEditing}
          type="number"
          onChange={(val) => setEditedProfile({ ...editedProfile, age: val as number | null })}
        />
        <ProfileRow
          label="Height"
          value={profile.height}
          editValue={editedProfile.height}
          isEditing={isEditing}
          type="number"
          suffix=" cm"
          onChange={(val) => setEditedProfile({ ...editedProfile, height: val as number | null })}
        />
        <ProfileRow
          label="Weight"
          value={profile.weight}
          editValue={editedProfile.weight}
          isEditing={isEditing}
          type="number"
          suffix=" kg"
          onChange={(val) => setEditedProfile({ ...editedProfile, weight: val as number | null })}
        />
      </div>
    </section>
  );
}
