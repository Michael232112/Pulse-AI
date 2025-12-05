"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import ChatInterface from "./ChatInterface";

interface ChatFloatingButtonProps {
  initialHistory?: {
    id: string;
    role: "user" | "assistant";
    content: string;
  }[];
}

export default function ChatFloatingButton({ initialHistory = [] }: ChatFloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button - Only visible on mobile/tablet */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-lg
                   flex items-center justify-center lg:hidden z-40
                   transition-transform hover:scale-105 active:scale-95"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* Modal Overlay - Only on mobile/tablet */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          {/* Modal Content - Slides up from bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[80vh] bg-beige rounded-t-3xl overflow-hidden">
            <ChatInterface
              initialHistory={initialHistory}
              onClose={() => setIsOpen(false)}
              showCloseButton={true}
            />
          </div>
        </div>
      )}
    </>
  );
}
