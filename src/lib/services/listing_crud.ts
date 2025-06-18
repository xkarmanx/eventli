import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const supabase = createSupabaseBrowserClient();

//Create new listing
export const createListing = async (formData: FormData, user_id: string) => {
  const {
    title,
    city,
    address,
    priceRange,
    eventType,
    servingStyle,
    numOfStaff,
    numOfGuests,
    description,
    image_url,
  } = Object.fromEntries(formData)

  const { data, error } = await supabase.from("listing").insert([{
    user_id, 
    title,
    city,
    address,
    price_range: priceRange,
    event_type: eventType,
    serving_style: servingStyle,
    num_of_staff: Number(numOfStaff),
    num_of_guests: Number(numOfGuests),
    description,
    image_url: image_url || null,
  }])

  return { data, error }
}

//Fetch all users listings
export const getUserListings = async (user_id: string) => {
  const { data, error } = await supabase
    .from("listing")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })

  return { data, error }
}

//Update listing
export const updateListing = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from("listing")
    .update(updates)
    .eq("id", id)

  return { data, error }
}

//Delete listing
export const deleteListing = async (id: string) => {
  const { data, error } = await supabase
    .from("listing")
    .delete()
    .eq("id", id)

  return { data, error }
}

//Upload users image to Supabase storage
export async function uploadImage(file: File, user_id: string) {
  if (!file) {
    console.error("[uploadImage] No file provided");
    return { url: null, error: new Error("No file provided") };
  }
  if (!user_id) {
    console.error("[uploadImage] No userId provided");
    return { url: null, error: new Error("No userId provided") };
  }

  try {
    const fileExt = file.name.split('.').pop() || 'png';
    // Make filePath very unique to avoid duplicates and upsert issues
    const filePath = `${user_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    console.log(`[uploadImage] Uploading file to path: ${filePath}`);

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error("[uploadImage] Upload error:", JSON.stringify(error));
      return { url: null, error };
    }

    // Get public URL for uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    console.log("[uploadImage] Uploaded file public URL:", publicUrlData.publicUrl);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err) {
    console.error("[uploadImage] Unexpected error:", err);
    return { url: null, error: err };
  }
}
