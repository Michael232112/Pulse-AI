"use client";

import { useState } from "react";
import { resetTrainingPlan } from "../actions";

export default function ManagePlanSection() {
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleResetClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    await resetTrainingPlan();
    // Note: resetTrainingPlan will redirect, so this won't be reached
  };

  const handleCancelReset = () => {
    setShowConfirm(false);
  };

  return (
    <section className="mb-10">
      <h2 className="text-[50px] font-medium tracking-figma text-black mb-4 max-md:text-2xl">
        Manage Plan
      </h2>

      <div className="bg-primary rounded-[10px] p-8 max-md:p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Info */}
          <div className="flex-1 min-w-[300px]">
            <h3 className="text-white text-[35px] font-medium tracking-figma mb-2 max-md:text-xl">
              Reset Your Training Plan
            </h3>
            <p className="text-white text-[25px] font-light tracking-figma leading-relaxed max-md:text-sm">
              This will clear your current progress and generate a new plan based
              on your updated goals. This action cannot be undone.
            </p>
          </div>

          {/* Button */}
          <div>
            {showConfirm ? (
              <div className="flex flex-col gap-2">
                <p className="text-white text-[20px] font-medium mb-2 max-md:text-sm">
                  Are you sure?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelReset}
                    className="bg-white/20 text-white text-[20px] font-medium tracking-figma px-4 py-2 rounded-[10px] hover:bg-white/30 transition-colors max-md:text-sm max-md:px-3 max-md:py-1"
                    disabled={isResetting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReset}
                    className="bg-white text-primary text-[20px] font-medium tracking-figma px-4 py-2 rounded-[10px] hover:bg-white/90 transition-colors max-md:text-sm max-md:px-3 max-md:py-1"
                    disabled={isResetting}
                  >
                    {isResetting ? "Resetting..." : "Yes, Reset"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleResetClick}
                className="bg-white text-primary text-[28px] font-medium tracking-figma px-6 py-3 rounded-[10px] hover:bg-white/90 transition-colors whitespace-nowrap max-md:text-sm max-md:px-4 max-md:py-2"
              >
                Change Goal & Reset Plan
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
