"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { sendChatMessage } from "../chat-actions";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
}

interface ChatInterfaceProps {
  initialHistory?: {
    id: string;
    role: "user" | "assistant";
    content: string;
  }[];
  onClose?: () => void;
  showCloseButton?: boolean;
}

export default function ChatInterface({
  initialHistory = [],
  onClose,
  showCloseButton = false,
}: ChatInterfaceProps) {
  const router = useRouter();

  // Convert initial history to ChatMessage format
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    initialHistory.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
    }))
  );
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isPending) return;

    const userMessage = input.trim();
    setInput("");

    // Optimistic UI: Add user message immediately
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
    };

    // Add typing indicator
    const loadingMsg: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: "assistant",
      content: "",
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);

    // Call the server action
    startTransition(async () => {
      const result = await sendChatMessage(userMessage);

      // Remove loading indicator and add real response
      setMessages((prev) => {
        const withoutLoading = prev.filter((m) => !m.isLoading);

        if (result.success && result.message) {
          return [
            ...withoutLoading,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant" as const,
              content: result.message,
            },
          ];
        } else {
          // Error case - show error message
          return [
            ...withoutLoading,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant" as const,
              content: result.error || "Sorry, I couldn't process that. Please try again.",
            },
          ];
        }
      });

      // If AI modified the plan, refresh the page to show updated data
      if (result.toolsExecuted && result.toolsExecuted.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${Date.now()}`,
            role: "assistant",
            content: "🔄 Plan updated! Refreshing your calendar...",
          },
        ]);
        router.refresh();
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      {/* Close Button (for mobile modal) */}
      {showCloseButton && onClose && (
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>
      )}

      {/* Messages Area with Custom Scrollbar */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pr-2 custom-scrollbar">
        {/* Welcome message for empty state */}
        {messages.length === 0 && (
          <div className="flex gap-2 justify-start items-start">
            <div className="flex-shrink-0 w-12 h-20">
              <Image
                src="/images/pulse-logo-1-17a8cd.png"
                alt="Pulse AI"
                width={48}
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="max-w-[75%] px-4 py-3 bg-white text-black rounded-[15px] rounded-bl-none">
              <p className="text-[20px] font-light tracking-figma leading-[1.25em]">
                Hey! I&apos;m Coach Pulse. Ask me anything about your training plan, or tell me if you need to make changes!
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start items-start"}`}
          >
            {/* AI Icon */}
            {message.role === "assistant" && (
              <div className="flex-shrink-0 w-12 h-20">
                <Image
                  src="/images/pulse-logo-1-17a8cd.png"
                  alt="Pulse AI"
                  width={48}
                  height={80}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`
                max-w-[75%] px-4 py-3
                ${
                  message.role === "user"
                    ? "bg-primary text-white rounded-[15px] rounded-br-none"
                    : "bg-white text-black rounded-[15px] rounded-bl-none"
                }
              `}
            >
              {message.isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-black/50" />
                  <span className="text-[20px] font-light tracking-figma text-black/50">
                    Thinking...
                  </span>
                </div>
              ) : (
                <p className="text-[20px] font-light tracking-figma leading-[1.25em]">
                  {message.content}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 pt-2">
        <div className="flex items-center gap-3 bg-white rounded-[15px] px-4 py-3 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message...."
            disabled={isPending}
            className="flex-1 bg-transparent outline-none text-[20px] font-light tracking-figma text-black placeholder:text-black/50 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isPending}
            className="w-9 h-9 bg-black rounded-full text-white disabled:opacity-50 transition-all hover:scale-105 disabled:hover:scale-100 flex items-center justify-center"
            aria-label="Send message"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" fill="white" />
            )}
          </button>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E4E4E4;
          border-radius: 30px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d0d0d0;
        }
      `}</style>
    </div>
  );
}
