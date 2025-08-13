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

// Define MediaRecord interface for media handling functions
interface MediaRecord {
  url: string;
  media_type: 'image' | 'video';
  position: number;
}

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
  const filePath = await buildMediaPath(user.id, listingId, safeFileName);

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

// Helper: build a consistent storage path for user media
// Keeps ${user.id}/${listingId}/${file} pattern centralized
export async function buildMediaPath(userId: string, listingId: string, filename: string): Promise<string> {
  return `${userId}/${listingId}/${filename}`;
}

// NEW: Upload multiple media files (images/videos) with comprehensive validation
export async function uploadListingMedia(files: File[], listingId: string): Promise<MediaRecord[]> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Authentication required");
  }

  // Ensure listing belongs to the authenticated user.
  const { data: existingListing, error: fetchError } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("id", listingId)
    .single();
  if (fetchError) {
    throw new Error("Listing not found");
  }
  if (existingListing.seller_id !== user.id) {
    throw new Error("Unauthorized: You can only upload media for your own listings");
  }

  // Count existing media for limit enforcement
  const { data: existingMedia, error: existingErr } = await supabase
    .from("listing_media")
    .select("media_type")
    .eq("listing_id", listingId);
  if (existingErr) throw existingErr;
  const existingImagesCount = (existingMedia ?? []).filter((m: any) => m.media_type === 'image').length;
  const existingVideosCount = (existingMedia ?? []).filter((m: any) => m.media_type === 'video').length;

  // Classify incoming files and ensure we don't exceed the limits (15 images and 5 videos per listing)
  let newImagesCount = 0;
  let newVideosCount = 0;
  files.forEach(f => {
    if (f.type.startsWith('image/')) newImagesCount++;
    else if (f.type.startsWith('video/')) newVideosCount++;
  });
  if (existingImagesCount + newImagesCount > 15) {
    throw new Error('Maximum of 15 images per listing allowed');
  }
  if (existingVideosCount + newVideosCount > 5) {
    throw new Error('Maximum of 5 videos per listing allowed');
  }

  const allowedImageTypes = ['image/jpeg','image/png','image/webp','image/gif'];
  const allowedVideoTypes = ['video/mp4','video/quicktime','video/webm'];
  const maxImageSize = 10 * 1024 * 1024; // 10MB per image
  const maxVideoSize = 50 * 1024 * 1024; // 50MB per video

  const uploaded: MediaRecord[] = [];
  let position = existingMedia?.length ?? 0;
  for (const file of files) {
    let mediaType: 'image' | 'video';
    if (allowedImageTypes.includes(file.type)) {
      if (file.size > maxImageSize) {
        throw new Error("Each image must be less than 10MB");
      }
      mediaType = 'image';
    } else if (allowedVideoTypes.includes(file.type)) {
      if (file.size > maxVideoSize) {
        throw new Error("Video must be less than 50MB");
      }
      mediaType = 'video';
    } else {
      throw new Error("Unsupported file type");
    }

    // sanitize filename to avoid injection and invalid characters
    const ext = file.name.split('.').pop();
    const base = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeFileName = `${base}_${Date.now()}.${ext}`;
    const filePath = await buildMediaPath(user.id, listingId, safeFileName);

    const { error: uploadErr } = await supabase.storage
      .from('listing-images')
      .upload(filePath, file, { upsert: true });
    if (uploadErr) {
      throw uploadErr;
    }
    const { data: publicUrlData } = supabase.storage
      .from('listing-images')
      .getPublicUrl(filePath);
    uploaded.push({ url: publicUrlData?.publicUrl, media_type: mediaType, position: position++ });
  }
  return uploaded;
}

// NEW: Insert media records into the database after successful upload
export async function insertListingMedia(listingId: string, mediaRecords: MediaRecord[]) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Authentication required");
  }

  if (!mediaRecords || mediaRecords.length === 0) {
    return [];
  }

  const inserts = mediaRecords.map(media => ({
    listing_id: listingId,
    url: media.url,
    media_type: media.media_type,
    position: media.position
  }));

  const { data, error } = await supabase
    .from('listing_media')
    .insert(inserts)
    .select();
  
  if (error) throw error;

  // Revalidate relevant paths after media insertion
  revalidatePath(`/listing/${listingId}`);
  revalidatePath('/dashboard/seller/listings');
  
  return data;
}

// NEW: Add tags to a listing with validation and deduplication
export async function addListingTags(listingId: string, tags: string[]) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Authentication required");
  }

  // Ensure listing belongs to the authenticated user.
  const { data: existingListing, error: fetchError } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("id", listingId)
    .single();
  if (fetchError) {
    throw new Error("Listing not found");
  }
  if (existingListing.seller_id !== user.id) {
    throw new Error("Unauthorized: You can only modify tags for your own listings");
  }

  if (!tags || tags.length === 0) {
    return [];
  }

  // Normalize: trim, lowercase, deduplicate
  const normalized = Array.from(new Set(tags.map(t => t.trim().toLowerCase())));
  const inserts = normalized.map(tag => ({ listing_id: listingId, tag }));
  try {
    const { data } = await supabase.from('listing_tags').insert(inserts).select();
    // revalidate listing page and dashboard to reflect new tags
    revalidatePath(`/listing/${listingId}`);
    revalidatePath('/dashboard/seller/listings');
    return data;
  } catch (error: any) {
    // ignore duplicate constraint errors (23505)
    if (error?.code === '23505') {
      return [];
    }
    throw error;
  }
}

// kvs: Added new Server Action for getting public listings (no authentication required)
// FETCH PUBLIC LISTINGS - for homepage/browse page - accessible to everyone
export async function getPublicListings(limit?: number) {
  const supabase = await createClient();
  
  // Query published listings with seller profile information
  let query = supabase
    .from("listings")
    .select(`
      *,
      profiles!listings_seller_id_fkey (
        full_name
      )
    `)                                   // << keep the JOIN
    .eq("is_published", true)            // << keep the filter
    .order("boost_priority", { ascending: false })  // << from HEAD
    .order("created_at",      { ascending: false }); // << from incoming
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching public listings:', error);
    return [];
  }
  
  return data as (Listing & { profiles: { full_name: string | null } })[];
}

// kvs: Added transformer function to convert database listings to Service interface format
import { Service } from "@/shared/types/service";
import { transformListingToService } from "@/shared/lib/listingUtils";

// kvs: Enhanced getPublicListings to return Service interface format
export async function getPublicListingsAsServices(limit?: number): Promise<Service[]> {
  try {
    console.log('📋 getPublicListingsAsServices called with limit:', limit)
    const listings = await getPublicListings(limit);
    const result = listings.map(transformListingToService);
    console.log('📋 getPublicListingsAsServices returning', result.length, 'services')
    return result;
  } catch (error) {
    console.error('📋 Error in getPublicListingsAsServices:', error);
    return [];
  }
}

// NEW: Server Action for searching and filtering listings
export async function searchAndFilterListings(
  searchQuery?: string,
  filters?: {
    priceRange?: string[];
    guestNumber?: string[];
    eventType?: string;
  }
): Promise<Service[]> {
  try {
    console.log('🔍 searchAndFilterListings called with:', { searchQuery, filters })
    
    const supabase = await createClient();
    
    // Check if we have any search criteria at all
    const hasSearchQuery = searchQuery && searchQuery.trim();
    const hasFilters = filters && (
      (filters.priceRange && filters.priceRange.length > 0) || 
      (filters.guestNumber && filters.guestNumber.length > 0) ||
      (filters.eventType && filters.eventType.trim())
    );
    
    console.log('🔍 Search criteria:', { hasSearchQuery, hasFilters })
    
    // If no search criteria, return all public listings
    if (!hasSearchQuery && !hasFilters) {
      console.log('🔍 No search criteria, returning all public listings')
      return await getPublicListingsAsServices();
    }
    
    // Start with base query for published listings
    let query = supabase
      .from("listings")
      .select(`
        *,
        profiles!listings_seller_id_fkey (
          full_name
        )
      `)
      .eq("is_published", true);

    // Apply search query if provided (search in title, description, location, event_type)
    if (hasSearchQuery) {
      const searchTerm = searchQuery.trim();
      query = query.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,event_type.ilike.%${searchTerm}%`
      );
    }

    // Apply price range filter
    if (filters?.priceRange && filters.priceRange.length > 0) {
      const priceConditions: string[] = []
      
      filters.priceRange.forEach(range => {
        switch (range) {
          case 'under-5000':
            priceConditions.push('price.lt.5000')
            break;
          case '5000-10000':
            priceConditions.push('and(price.gte.5000,price.lte.10000)')
            break;
          case '10000-20000':
            priceConditions.push('and(price.gte.10000,price.lte.20000)')
            break;
          case '20000-30000':
            priceConditions.push('and(price.gte.20000,price.lte.30000)')
            break;
          case 'over-30000':
            priceConditions.push('price.gt.30000')
            break;
        }
      })
      
      if (priceConditions.length > 0) {
        query = query.or(priceConditions.join(','))
      }
    }

    // Apply guest number filter
    if (filters?.guestNumber && filters.guestNumber.length > 0) {
      const guestConditions: string[] = []
      
      filters.guestNumber.forEach(range => {
        switch (range) {
          case 'under-20':
            guestConditions.push('num_guests.lt.20')
            break;
          case '20-40':
            guestConditions.push('and(num_guests.gte.20,num_guests.lte.40)')
            break;
          case '40-60':
            guestConditions.push('and(num_guests.gte.40,num_guests.lte.60)')
            break;
          case '60-100':
            guestConditions.push('and(num_guests.gte.60,num_guests.lte.100)')
            break;
          case 'over-100':
            guestConditions.push('num_guests.gt.100')
            break;
        }
      })
      
      if (guestConditions.length > 0) {
        query = query.or(guestConditions.join(','))
      }
    }

    // Apply event type filter
    if (filters?.eventType && filters.eventType.trim()) {
      query = query.eq('event_type', filters.eventType);
    }

    // Order by relevance (recently created first)
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    
    if (error) {
      console.error('Error searching listings:', error);
      return [];
    }

    // Transform to Service format
    const listings = data as (Listing & { profiles: { full_name: string | null } })[];
    const result = listings.map(transformListingToService);
    console.log('🔍 searchAndFilterListings returning', result.length, 'results')
    return result;
  } catch (error) {
    console.error('Error in searchAndFilterListings:', error);
    return [];
  }
}