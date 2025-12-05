"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  tool_calls: unknown | null;
  created_at: string;
}

// Fetch chat history for the current user (last 50 messages)
export async function getChatHistory(): Promise<ChatMessage[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("ai_chat_logs")
    .select("id, role, content, tool_calls, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }

  return (data || []) as ChatMessage[];
}

// Send a message to the AI chat Edge Function
export async function sendChatMessage(message: string): Promise<{
  success: boolean;
  message?: string;
  toolsExecuted?: string[];
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke("chat", {
      body: { userId: user.id, message },
    });

    if (error) {
      console.error("Edge Function error:", error);
      return { success: false, error: error.message || "Failed to send message" };
    }

    // If tools were executed, revalidate the dashboard pages
    if (data?.toolsExecuted?.length > 0) {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/progress");
    }

    return {
      success: data?.success ?? false,
      message: data?.message,
      toolsExecuted: data?.toolsExecuted,
      error: data?.error,
    };
  } catch (err) {
    console.error("Unexpected error sending chat message:", err);
    return { success: false, error: "Failed to send message" };
  }
}
