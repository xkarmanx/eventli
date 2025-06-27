import { createClient } from "../../shared/lib/supabase/client";
import { Database } from "../../shared/types/database";

// Types
type Listing = Database["public"]["Tables"]["listings"]["Row"];
type InsertListing = Database["public"]["Tables"]["listings"]["Insert"];
type UpdateListing = Database["public"]["Tables"]["listings"]["Update"];

// CREATE
export async function createListing(listing: InsertListing) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .insert([listing])
    .select()
    .single();
  if (error) throw error;
  return data as Listing;
}

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

// FETCH ALL, optionally by seller
export async function getListings(sellerId?: string) {
  const supabase = await createClient();
  let query = supabase.from("listings").select("*");
  if (sellerId) query = query.eq("seller_id", sellerId);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data as Listing[];
}

// UPDATE
export async function updateListing(id: string, updates: UpdateListing) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Listing;
}

// DELETE
export async function deleteListing(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// IMAGE UPLOAD
export async function uploadListingImage(file: File, listingId: string) {
  const supabase = await createClient();

  // Sanitize file name
  const ext = file.name.split('.').pop();
  const base = file.name
    .replace(/\.[^/.]+$/, "")         // Remove extension
    .replace(/[^a-zA-Z0-9_-]/g, "_"); // Replace non-alphanumeric with _
    
  const safeFileName = `${base}_${Date.now()}.${ext}`;
  const filePath = `listings/${listingId}/${safeFileName}`;

  const { data, error } = await supabase.storage
    .from("listing-images")
    .upload(filePath, file, { upsert: true });
  if (error) throw error;

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("listing-images")
    .getPublicUrl(filePath);

  return publicUrlData?.publicUrl;
}