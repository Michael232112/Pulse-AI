import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Types
interface ChatRequest {
  userId: string;
  message: string;
}

interface WorkoutContext {
  id: string;
  scheduled_date: string;
  title: string;
  activity_type: string;
  description: string | null;
  is_completed: boolean;
}

interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

interface ToolResult {
  name: string;
  success: boolean;
  result?: string;
  error?: string;
}

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Get date range for context window
function getDateRange(daysBack: number, daysForward: number): { start: string; end: string } {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - daysBack);
  const end = new Date(today);
  end.setDate(today.getDate() + daysForward);
  return { start: formatDate(start), end: formatDate(end) };
}

// Tool definitions for Gemini function calling
const toolDefinitions = {
  functionDeclarations: [
    {
      name: "update_workout",
      description: "Update a workout's details including activity type, title, description, or structure",
      parameters: {
        type: "object",
        properties: {
          workout_id: {
            type: "string",
            description: "The UUID of the workout to update"
          },
          activity_type: {
            type: "string",
            enum: ["Run", "Strength", "Rest"],
            description: "The type of workout"
          },
          title: {
            type: "string",
            description: "New title for the workout"
          },
          description: {
            type: "string",
            description: "New description for the workout"
          }
        },
        required: ["workout_id"]
      }
    },
    {
      name: "swap_workouts",
      description: "Swap two workouts between their scheduled dates",
      parameters: {
        type: "object",
        properties: {
          workout_id_1: {
            type: "string",
            description: "UUID of the first workout"
          },
          workout_id_2: {
            type: "string",
            description: "UUID of the second workout"
          }
        },
        required: ["workout_id_1", "workout_id_2"]
      }
    },
    {
      name: "add_rest_day",
      description: "Convert an existing workout to a rest day. Use when the user needs recovery.",
      parameters: {
        type: "object",
        properties: {
          workout_id: {
            type: "string",
            description: "UUID of the workout to convert to rest"
          },
          reason: {
            type: "string",
            description: "Optional reason for the rest day (e.g., 'feeling sick', 'work deadline')"
          }
        },
        required: ["workout_id"]
      }
    },
    {
      name: "reschedule_workout",
      description: "Move a workout to a different date",
      parameters: {
        type: "object",
        properties: {
          workout_id: {
            type: "string",
            description: "UUID of the workout to reschedule"
          },
          new_date: {
            type: "string",
            description: "New date in YYYY-MM-DD format"
          }
        },
        required: ["workout_id", "new_date"]
      }
    }
  ]
};

// Tool execution functions
async function executeUpdateWorkout(
  supabase: ReturnType<typeof createClient>,
  args: { workout_id: string; activity_type?: string; title?: string; description?: string }
): Promise<ToolResult> {
  const updateData: Record<string, unknown> = {};
  if (args.activity_type) updateData.activity_type = args.activity_type;
  if (args.title) updateData.title = args.title;
  if (args.description) updateData.description = args.description;

  const { error } = await supabase
    .from("workouts")
    .update(updateData)
    .eq("id", args.workout_id);

  if (error) return { name: "update_workout", success: false, error: error.message };
  return { name: "update_workout", success: true, result: `Workout updated successfully` };
}

async function executeSwapWorkouts(
  supabase: ReturnType<typeof createClient>,
  args: { workout_id_1: string; workout_id_2: string }
): Promise<ToolResult> {
  // Fetch both workouts
  const { data: workouts, error: fetchError } = await supabase
    .from("workouts")
    .select("id, scheduled_date, day_offset")
    .in("id", [args.workout_id_1, args.workout_id_2]);

  if (fetchError || !workouts || workouts.length !== 2) {
    return { name: "swap_workouts", success: false, error: "Could not find both workouts" };
  }

  const [w1, w2] = workouts;

  // Swap dates and day_offsets
  const { error: e1 } = await supabase
    .from("workouts")
    .update({ scheduled_date: w2.scheduled_date, day_offset: w2.day_offset })
    .eq("id", w1.id);

  const { error: e2 } = await supabase
    .from("workouts")
    .update({ scheduled_date: w1.scheduled_date, day_offset: w1.day_offset })
    .eq("id", w2.id);

  if (e1 || e2) return { name: "swap_workouts", success: false, error: "Failed to swap workouts" };
  return { name: "swap_workouts", success: true, result: `Swapped workouts between ${w1.scheduled_date} and ${w2.scheduled_date}` };
}

async function executeAddRestDay(
  supabase: ReturnType<typeof createClient>,
  args: { workout_id: string; reason?: string }
): Promise<ToolResult> {
  const restStructure = {
    instructions: args.reason
      ? `Rest day: ${args.reason}`
      : "Recovery is essential. Stay hydrated and get good sleep."
  };

  const { error } = await supabase
    .from("workouts")
    .update({
      activity_type: "Rest",
      title: "Rest Day",
      description: args.reason || "Take it easy today. Light stretching or complete rest.",
      structure: restStructure
    })
    .eq("id", args.workout_id);

  if (error) return { name: "add_rest_day", success: false, error: error.message };
  return { name: "add_rest_day", success: true, result: "Converted to rest day" };
}

async function executeRescheduleWorkout(
  supabase: ReturnType<typeof createClient>,
  args: { workout_id: string; new_date: string }
): Promise<ToolResult> {
  const { error } = await supabase
    .from("workouts")
    .update({ scheduled_date: args.new_date })
    .eq("id", args.workout_id);

  if (error) return { name: "reschedule_workout", success: false, error: error.message };
  return { name: "reschedule_workout", success: true, result: `Workout moved to ${args.new_date}` };
}

// Execute a tool call
async function executeTool(
  supabase: ReturnType<typeof createClient>,
  toolCall: ToolCall
): Promise<ToolResult> {
  console.log(`Executing tool: ${toolCall.name}`, toolCall.args);

  switch (toolCall.name) {
    case "update_workout":
      return executeUpdateWorkout(supabase, toolCall.args as { workout_id: string; activity_type?: string; title?: string; description?: string });
    case "swap_workouts":
      return executeSwapWorkouts(supabase, toolCall.args as { workout_id_1: string; workout_id_2: string });
    case "add_rest_day":
      return executeAddRestDay(supabase, toolCall.args as { workout_id: string; reason?: string });
    case "reschedule_workout":
      return executeRescheduleWorkout(supabase, toolCall.args as { workout_id: string; new_date: string });
    default:
      return { name: toolCall.name, success: false, error: `Unknown tool: ${toolCall.name}` };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY")!;

    // Parse request body
    const { userId, message } = await req.json() as ChatRequest;

    if (!userId || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "userId and message are required", code: "MISSING_PARAMS" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 1. Save user message to chat logs
    await supabase.from("ai_chat_logs").insert({
      user_id: userId,
      role: "user",
      content: message
    });

    // 2. Fetch context: Profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name, goal, custom_goal_text, runs_per_week, strength_days")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return new Response(
        JSON.stringify({ success: false, error: "User profile not found", code: "USER_NOT_FOUND" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Fetch context: Active training plan
    const { data: plan } = await supabase
      .from("training_plans")
      .select("id, plan_name, goal")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (!plan) {
      return new Response(
        JSON.stringify({ success: false, error: "No active training plan found. Please complete onboarding first.", code: "NO_PLAN" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Fetch context: Recent history (last 7 days) + Upcoming (next 7 days)
    const { start: historyStart, end: _ } = getDateRange(7, 0);
    const { start: todayStr, end: upcomingEnd } = getDateRange(0, 7);

    const { data: recentWorkouts } = await supabase
      .from("workouts")
      .select("id, scheduled_date, title, activity_type, description, is_completed")
      .eq("plan_id", plan.id)
      .gte("scheduled_date", historyStart)
      .lt("scheduled_date", todayStr)
      .order("scheduled_date", { ascending: true });

    const { data: upcomingWorkouts } = await supabase
      .from("workouts")
      .select("id, scheduled_date, title, activity_type, description, is_completed")
      .eq("plan_id", plan.id)
      .gte("scheduled_date", todayStr)
      .lte("scheduled_date", upcomingEnd)
      .order("scheduled_date", { ascending: true });

    // 5. Fetch context: Recent chat history (last 10 messages)
    const { data: chatHistory } = await supabase
      .from("ai_chat_logs")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Format recent history for context
    const recentHistoryText = (recentWorkouts || []).map((w: WorkoutContext) => {
      const status = w.is_completed ? "COMPLETED" : "MISSED";
      return `- ${w.scheduled_date} | ${w.title} (${w.activity_type}) | ${status}`;
    }).join("\n") || "No recent workout history";

    // Format upcoming schedule for context
    const upcomingText = (upcomingWorkouts || []).map((w: WorkoutContext) => {
      const status = w.is_completed ? "COMPLETED" : "pending";
      return `- ${w.scheduled_date} | ${w.title} (${w.activity_type}) | ${status}`;
    }).join("\n") || "No upcoming workouts";

    // Build goal description
    let goalDescription = profile.goal || "general fitness";
    if (profile.goal === "custom" && profile.custom_goal_text) {
      goalDescription = profile.custom_goal_text;
    }

    // 6. Build system prompt
    const systemPrompt = `You are Coach Pulse, an elite running coach and fitness expert for the Pulse AI training app.

PERSONA:
- Friendly, encouraging, and knowledgeable
- Use a conversational but professional tone
- Be concise - keep responses under 100 words unless detailed explanation is needed
- Celebrate user achievements and show empathy for challenges

USER CONTEXT:
- Name: ${profile.name || "Runner"}
- Goal: ${goalDescription}
- Weekly Schedule: ${profile.runs_per_week || 3} runs, strength on ${profile.strength_days?.join(", ") || "no specific days"}

ACTIVE TRAINING PLAN:
- Plan: ${plan.plan_name}
- Plan ID: ${plan.id}

RECENT HISTORY (Last 7 Days - completed vs missed):
${recentHistoryText}

UPCOMING WORKOUTS (Next 7 Days):
${upcomingText}

CAPABILITIES:
You can modify the user's training plan using these tools:
1. update_workout - Change workout details (type, title, description)
2. swap_workouts - Swap two workouts between different days
3. add_rest_day - Convert any workout to a rest day
4. reschedule_workout - Move a workout to a different date

RULES:
- Always confirm changes after making them
- If unsure which workout the user means, ask for clarification
- Never modify completed workouts unless explicitly asked
- NEVER show workout IDs to the user - use dates and workout names instead (e.g., "Thursday's Easy Run", "tomorrow's Long Run")
- Today's date is ${formatDate(new Date())}
- Be encouraging about missed workouts - suggest adjustments rather than criticism
- Keep responses friendly and non-technical`;

    // Build conversation history for context
    const conversationHistory = (chatHistory || []).reverse().map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    // Add current message
    conversationHistory.push({
      role: "user",
      parts: [{ text: message }]
    });

    console.log("Calling Gemini API with tools...");

    // 7. Call Gemini API with function calling
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: conversationHistory,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          tools: [toolDefinitions],
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: "AI service temporarily unavailable", code: "AI_ERROR" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiResponse.json();
    const candidate = geminiData.candidates?.[0];

    if (!candidate) {
      console.error("No candidate from Gemini");
      return new Response(
        JSON.stringify({ success: false, error: "AI returned empty response", code: "AI_EMPTY" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 8. Check if Gemini wants to call tools
    const parts = candidate.content?.parts || [];
    const functionCallPart = parts.find((p: { functionCall?: unknown }) => p.functionCall);
    const textPart = parts.find((p: { text?: string }) => p.text);

    let finalResponse = "";
    const toolsExecuted: string[] = [];
    let toolResults: ToolResult[] = [];

    if (functionCallPart?.functionCall) {
      // Execute the tool
      const toolCall: ToolCall = {
        name: functionCallPart.functionCall.name,
        args: functionCallPart.functionCall.args || {}
      };

      const result = await executeTool(supabase, toolCall);
      toolResults.push(result);
      toolsExecuted.push(toolCall.name);

      console.log("Tool result:", result);

      // Call Gemini again with the tool result to get natural language response
      const toolResponseContent = [
        ...conversationHistory,
        {
          role: "model",
          parts: [{ functionCall: functionCallPart.functionCall }]
        },
        {
          role: "function",
          parts: [{
            functionResponse: {
              name: toolCall.name,
              response: { result: result.success ? result.result : result.error }
            }
          }]
        }
      ];

      const followUpResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: toolResponseContent,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              maxOutputTokens: 512,
              temperature: 0.7
            }
          })
        }
      );

      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json();
        finalResponse = followUpData.candidates?.[0]?.content?.parts?.[0]?.text ||
          (result.success ? "Done! I've updated your plan." : "Sorry, I couldn't complete that change.");
      } else {
        finalResponse = result.success ? "Done! I've updated your plan." : `Sorry, I couldn't complete that: ${result.error}`;
      }
    } else if (textPart?.text) {
      // No tool call, just text response
      finalResponse = textPart.text;
    } else {
      finalResponse = "I'm not sure how to help with that. Could you rephrase?";
    }

    // 9. Save assistant response to chat logs
    await supabase.from("ai_chat_logs").insert({
      user_id: userId,
      role: "assistant",
      content: finalResponse,
      tool_calls: toolsExecuted.length > 0 ? toolResults : null,
      tool_results: toolResults.length > 0 ? toolResults : null
    });

    console.log("Chat response saved successfully");

    // 10. Return response
    return new Response(
      JSON.stringify({
        success: true,
        message: finalResponse,
        toolsExecuted: toolsExecuted.length > 0 ? toolsExecuted : undefined
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error", code: "INTERNAL_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
