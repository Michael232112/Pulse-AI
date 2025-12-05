"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return { error: error.message };
  }

  await supabase.auth.signOut();
  redirect("/signin");
}
