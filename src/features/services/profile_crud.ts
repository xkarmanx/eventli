import { createClient } from "@/shared/lib/supabase/client";

//CT: Allows users to update their profile information
export async function updateProfile(userId: string, updates: any) {
  const supabase = createClient();

  // If email is being updated, use Supabase Auth API
  if (updates.email) {
    const { error: emailError } = await supabase.auth.updateUser({ email: updates.email });
    if (emailError) throw emailError;
    // Remove email from updates so it's not sent to the profiles table
    delete updates.email;
  }

  // Update the profiles table
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// CT: Fetches the full user profile including user.email_change which is the main usage
export async function fetchFullUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}
