import { createClient } from "@/shared/lib/supabase/client";

const supabase = createClient();

export async function deleteUserProfile(userId: string) {
  try {
    // First verify the user owns this profile
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser?.user || authUser.user.id !== userId) {
      throw new Error("Unauthorized: You can only delete your own profile");
    }

    // Get profile to check if user is seller (for analytics cleanup)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError) {
      throw new Error("Profile not found");
    }

    // Delete seller analytics if user is a seller
    if (profile.role === "seller") {
      const { error: analyticsError } = await supabase
        .from("seller_analytics")
        .delete()
        .eq("seller_id", userId);
      
      if (analyticsError) {
        console.warn("Failed to delete seller analytics:", analyticsError);
      }
    }

    // Delete failed login attempts for this user
    const { error: loginAttemptsError } = await supabase
      .from("failed_login_attempts")
      .delete()
      .eq("user_email", authUser.user.email);

    if (loginAttemptsError) {
      console.warn("Failed to delete login attempts:", loginAttemptsError);
    }

    // Delete the profile (this will cascade delete everything else due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (deleteError) {
      throw new Error(`Failed to delete profile: ${deleteError.message}`);
    }

    // Sign out the user
    await supabase.auth.signOut();

    return { success: true };
  } catch (error: any) {
    console.error("Profile deletion error:", error);
    throw new Error(error.message || "Failed to delete profile");
  }
}
