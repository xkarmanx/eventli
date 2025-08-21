'use server';

import { createClient } from "@/shared/lib/supabase/server";

// Allows users to update their profile information
// This function has been updated to ensure the email confirmation link
// points to the correct production domain rather than always using
// window.location.origin (which can be localhost during development).
export async function updateProfile(userId: string, updates: any) {
  const supabase = await createClient();
  
  // If email is being updated, handle email change
  if (updates.email) {
    const newEmail = updates.email;

    // Use server-side environment variable for reliable production URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

    const { error: emailError } = await supabase.auth.updateUser(
      { email: newEmail },
      { emailRedirectTo: `${siteUrl}/api/auth/callback` }
    );

    if (emailError) throw emailError;

    const { data: authUserData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    const isNewEmailDifferent = authUserData?.user?.email !== newEmail;

    const { error: pendingEmailError } = await supabase
      .from("profiles")
      .update({
        pending_email: isNewEmailDifferent ? newEmail : null,
        pending_email_requested_at: isNewEmailDifferent ? new Date().toISOString() : null,
      })
      .eq("id", userId);

    if (pendingEmailError) throw pendingEmailError;

    delete updates.email;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}


// CT: profile.is_setup_complete will return true if conditions are met
export async function updateProfileComplete(userId: string) {
  const supabase = await createClient();
  const { data: authUser, error: userError } = await supabase.auth.getUser();
  if (userError || !authUser?.user?.email) {
    console.error("Failed to fetch current authenticated user.");
    return null;
  }

  const verifiedEmail = authUser.user.email;

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, phone, location, bio, website, avatar_url, pending_email, pending_email_requested_at, role")
    .eq("id", userId)
    .single();

  if (profileError || !profileData) {
    console.error("Failed to fetch profile data:", profileError);
    return null;
  }

  // Email verification logic
  const isPending = profileData.pending_email && profileData.pending_email !== verifiedEmail;
  const isWithin30Days =
    isPending &&
    new Date().getTime() - new Date(profileData.pending_email_requested_at).getTime() <
      30 * 24 * 60 * 60 * 1000;
  const emailIsVerified = !isPending || !isWithin30Days;

  // RELAXED WEBSITE REQUIREMENT: only enforce website for sellers
  const isSeller = profileData.role === "seller";

  const isProfileComplete =
    !!profileData.full_name &&
    !!profileData.phone &&
    !!profileData.location &&
    !!profileData.bio &&
    !!profileData.avatar_url &&
    emailIsVerified &&
    (isSeller ? !!profileData.website : true); // <-- website only required for sellers

  const { data, error } = await supabase
    .from("profiles")
    .update({ is_setup_complete: isProfileComplete })
    .eq("id", userId);

  if (error) {
    console.error("Error updating is_setup_complete:", error);
    return null;
  }

  return data;
}
