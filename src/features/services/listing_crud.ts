// kvs: Converted from client-side functions to Server Actions for proper Next.js 15 + Supabase SSR architecture
'use server'

// kvs: Changed from client import to server import for proper SSR support
import { createClient } from "../../shared/lib/supabase/server";
import { Database } from "../../shared/types/database";
// kvs: Added revalidatePath for cache invalidation after mutations
import { revalidatePath } from "next/cache";
// kvs: Added redirect for potential navigation after operations
import { redirect } from "next/navigation";

// Types
type Listing = Database["public"]["Tables"]["listings"]["Row"];
type InsertListing = Database["public"]["Tables"]["listings"]["Insert"];
type UpdateListing = Database["public"]["Tables"]["listings"]["Update"];

// kvs: Converted to Server Action with proper authentication and error handling
// CREATE
export async function createListing(listing: InsertListing) {
  const supabase = await createClient();
  
  // kvs: Added server-side authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Authentication required");
  }

  // kvs: Ensure the listing belongs to the authenticated user for security
  const listingWithUser = {
    ...listing,
    seller_id: user.id, // Override seller_id with authenticated user's ID
  };

  const { data, error } = await supabase
    .from("listings")
    .insert([listingWithUser])
    .select()
    .single();
  
  if (error) throw error;
  
  // kvs: Revalidate relevant paths after creating a listing
  revalidatePath("/dashboard/seller/listings");
  revalidatePath("/");
  
  return data as Listing;
}

// kvs: Converted to Server Action with proper authentication
// FETCH (fetch single)
export async function getListingById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) throw error;
  return data as Listing;
}

// kvs: Converted to Server Action with optional authentication for public/private access
// FETCH ALL, optionally by seller
export async function getListings(sellerId?: string) {
  const supabase = await createClient();
  
  // kvs: If sellerId is provided, verify user authentication and authorization
  if (sellerId) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Authentication required to fetch user-specific listings");
    }
    
    // kvs: Additional security check - users can only fetch their own listings
    if (user.id !== sellerId) {
      throw new Error("Unauthorized: You can only access your own listings");
    }
  }
  
  let query = supabase.from("listings").select("*");
  if (sellerId) query = query.eq("seller_id", sellerId);
  
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data as Listing[];
}

// kvs: Converted to Server Action with proper authentication and authorization
// UPDATE
export async function updateListing(id: string, updates: UpdateListing) {
  const supabase = await createClient();
  
  // kvs: Added server-side authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Authentication required");
  }

  // kvs: Verify the listing belongs to the authenticated user before updating
  const { data: existingListing, error: fetchError } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("id", id)
    .single();
  
  if (fetchError) throw new Error("Listing not found");
  
  if (existingListing.seller_id !== user.id) {
    throw new Error("Unauthorized: You can only update your own listings");
  }

  const { data, error } = await supabase
    .from("listings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  
  // kvs: Revalidate relevant paths after updating a listing
  revalidatePath("/dashboard/seller/listings");
  revalidatePath("/");
  revalidatePath(`/listings/${id}`);
  
  return data as Listing;
}

// kvs: Converted to Server Action with proper authentication and authorization
// DELETE
export async function deleteListing(id: string) {
  const supabase = await createClient();
  
  // kvs: Added server-side authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Authentication required");
  }

  // kvs: Verify the listing belongs to the authenticated user before deleting
  const { data: existingListing, error: fetchError } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("id", id)
    .single();
  
  if (fetchError) throw new Error("Listing not found");
  
  if (existingListing.seller_id !== user.id) {
    throw new Error("Unauthorized: You can only delete your own listings");
  }

  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw error;
  
  // kvs: Revalidate relevant paths after deleting a listing
  revalidatePath("/dashboard/seller/listings");
  revalidatePath("/");
  
  return true;
}

// kvs: Converted to Server Action with proper authentication and file handling
// IMAGE UPLOAD
export async function uploadListingImage(file: File, listingId: string) {
  const supabase = await createClient();
  
  // kvs: Added server-side authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Authentication required");
  }

  // kvs: Verify the listing belongs to the authenticated user before uploading image
  const { data: existingListing, error: fetchError } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("id", listingId)
    .single();
  
  if (fetchError) throw new Error("Listing not found");
  
  if (existingListing.seller_id !== user.id) {
    throw new Error("Unauthorized: You can only upload images for your own listings");
  }

  // kvs: Enhanced file validation for security - updated to match next.config.js limit
  const maxFileSize = 10 * 1024 * 1024; // 10MB (matching next.config.js)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (file.size > maxFileSize) {
    throw new Error("File size must be less than 10MB");
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, and GIF files are allowed");
  }

  // Sanitize file name
  const ext = file.name.split('.').pop();
  const base = file.name
    .replace(/\.[^/.]+$/, "")         // Remove extension
    .replace(/[^a-zA-Z0-9_-]/g, "_"); // Replace non-alphanumeric with _
    
  const safeFileName = `${base}_${Date.now()}.${ext}`;
  
  // kvs: Updated file path to match RLS policy - userId must be first folder
  const filePath = `${user.id}/${listingId}/${safeFileName}`;

  const { data, error } = await supabase.storage
    .from("listing-images")
    .upload(filePath, file, { upsert: true });
  
  if (error) throw error;

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("listing-images")
    .getPublicUrl(filePath);

  // kvs: Revalidate paths after image upload
  revalidatePath("/dashboard/seller/listings");
  revalidatePath(`/listings/${listingId}`);

  return publicUrlData?.publicUrl;
}

// kvs: Added new Server Action for getting public listings (no authentication required)
// FETCH PUBLIC LISTINGS - for homepage/browse page
export async function getPublicListings(limit?: number) {
  const supabase = await createClient();
  
  let query = supabase
    .from("listings")
    .select("*")
    .order("boost_priority", { ascending: false })
    .order("created_at", { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data as Listing[];
}