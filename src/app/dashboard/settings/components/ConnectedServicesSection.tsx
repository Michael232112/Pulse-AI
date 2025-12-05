"use client";

import { useState } from "react";

export default function ConnectedServicesSection() {
  // Static state for now - will be connected to real OAuth later
  const [isConnected, setIsConnected] = useState(true);

  const handleToggleConnection = () => {
    // For now, just toggle the UI state
    // Later this will trigger real OAuth flow
    setIsConnected(!isConnected);
  };

  return (
    <section className="mb-10">
      <h2 className="text-[50px] font-medium tracking-figma text-black mb-4 max-md:text-2xl">
        Connected Services
      </h2>

      <div className="bg-primary rounded-[10px] p-6 max-md:p-4">
        <div className="flex items-center justify-between">
          {/* Strava Info */}
          <div className="flex items-center gap-4">
            {/* Strava Logo */}
            <div className="w-[90px] h-[90px] flex items-center justify-center max-md:w-[50px] max-md:h-[50px]">
              <svg
                viewBox="0 0 64 64"
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="32" cy="32" r="32" fill="#FC4C02" />
                <path
                  d="M38.5 44L33.5 34H28L38.5 54L49 34H43.5L38.5 44Z"
                  fill="white"
                />
                <path
                  d="M28 34L38.5 14L49 34H43.5L38.5 24L33.5 34H28Z"
                  fill="white"
                  fillOpacity="0.6"
                />
              </svg>
            </div>

            <div>
              <h3 className="text-white text-[60px] font-semibold tracking-figma leading-tight max-md:text-2xl">
                Strava
              </h3>
              <p className="text-white text-[30px] font-light tracking-figma max-md:text-sm">
                {isConnected ? "Connected" : "Not Connected"}
              </p>
            </div>
          </div>

          {/* Connect/Disconnect Button */}
          <button
            onClick={handleToggleConnection}
            className={`text-[30px] font-semibold tracking-tight transition-opacity hover:opacity-80 max-md:text-sm ${
              isConnected ? "text-red-500" : "text-white"
            }`}
          >
            {isConnected ? "Disconnect" : "Connect"}
          </button>
        </div>
      </div>
    </section>
  );
}
