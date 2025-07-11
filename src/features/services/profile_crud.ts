import { createClient } from "@/shared/lib/supabase/client";
import type { ProfileUpdate } from "@/shared/components/ui/ProfileEditModal";

const supabase = createClient();

//CT: Allows users to update their profile information
export async function updateProfile(userId: string, updates: any) {
  // If email is being updated, handle email change
  if (updates.email) {
    const newEmail = updates.email;

    // 1. Update email using Supabase Auth
    const { error: emailError } = await supabase.auth.updateUser({ email: newEmail });
    if (emailError) throw emailError;

    // 2. Save pending email info to profiles table
    const { error: pendingEmailError } = await supabase
      .from("profiles")
      .update({
        pending_email: newEmail,
        pending_email_requested_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (pendingEmailError) throw pendingEmailError;

    // 3. Remove email from the updates object so it doesn't overwrite in `profiles`
    delete updates.email;
  }

  // 4. Update the remaining profile fields
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// CT: Fetches the full user profile including 'new_email' field, which is the main usage
export async function fetchFullUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

// CT: profile.is_setup_complete will return true if conditions are met
export async function updateProfileComplete(userId: string, updatedData: ProfileUpdate) {
  const isProfileComplete =
    !!updatedData.full_name &&
    !!updatedData.bio &&
    !!updatedData.phone &&
    !!updatedData.location &&
    !!updatedData.website &&
    (!!updatedData.email || !!updatedData.pending_email);

  // Update the profiles table
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updatedData,
      is_setup_complete: isProfileComplete,
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating profile:", error);
    return null;
  }

  return data;
}
