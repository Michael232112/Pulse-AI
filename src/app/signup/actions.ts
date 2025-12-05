"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const age = formData.get("age") as string;
  const height = formData.get("height") as string;
  const weight = formData.get("weight") as string;

  // Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (authData.user) {
    // Update profile with additional info using RPC (bypasses RLS during signup)
    const { error: profileError } = await supabase.rpc(
      "update_profile_on_signup",
      {
        user_id: authData.user.id,
        user_name: name,
        user_age: age ? parseInt(age) : null,
        user_height: height ? parseFloat(height) : null,
        user_weight: weight ? parseFloat(weight) : null,
      }
    );

    if (profileError) {
      return { error: profileError.message };
    }
  }

  redirect("/onboarding");
}
