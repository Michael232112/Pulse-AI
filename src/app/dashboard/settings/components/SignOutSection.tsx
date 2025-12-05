"use client";

import { useState } from "react";
import { signOut } from "../actions";

export default function SignOutSection() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    // Note: signOut will redirect, so this won't be reached
  };

  return (
    <section className="mt-12 mb-8">
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="w-full bg-black text-white text-[30px] font-medium tracking-figma py-4 rounded-[10px] hover:bg-black/80 transition-colors disabled:opacity-50 max-md:text-lg max-md:py-3"
      >
        {isSigningOut ? "Signing Out..." : "Sign Out"}
      </button>
    </section>
  );
}
