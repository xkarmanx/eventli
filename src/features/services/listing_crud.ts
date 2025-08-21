// kvs: Converted from client-side functions to Server Actions for proper Next.js 15 + Supabase SSR architecture
'use server'

// kvs: Changed from client import to server import for proper SSR support
import { createClient } from "../../shared/lib/supabase/server";
import { Database } from "../../shared/types/database";
// kvs: Added revalidatePath for cache invalidation after mutations
import { revalidatePath } from "next/cache";
// kvs: Added redirect for potential navigation after operations
import { redirect } from "next/navigation";
// kvs: Added transformer function to convert database listings to Service interface format
import { Service } from "@/shared/types/service";
import { transformListingToService } from "@/shared/lib/listingUtils";
// Import moderation functions for content safety
import {
  ensureTextIsSafe,
  ensureTextsAreSafe,
  ensureImageUrlIsSafe,
  ensureListingFieldsSafe,
  ModerationError,
  RateLimitError,
} from "@/shared/lib/moderation";
// Import centralized media validation
import { 
  MEDIA_LIMITS,
  MediaValidationError 
} from "@/shared/lib/mediaValidation";
import { validateMediaForUpload } from "@/shared/lib/mediaValidationServer";

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

  // Moderate listing content before creating (batch multiple fields for efficiency)
  const fieldsToModerate: Record<string, string> = {};
  if (listing.title) fieldsToModerate.title = listing.title;
  if (listing.description) fieldsToModerate.description = listing.description;
  if (listing.location) fieldsToModerate.location = listing.location;
  if (listing.serving_style && typeof listing.serving_style === "string") {
    fieldsToModerate.serving_style = listing.serving_style;
  }

  try {
    await ensureListingFieldsSafe(fieldsToModerate, "create_listing");
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.warn("Rate limit hit during listing creation, proceeding with creation...");
    } else {
      throw error;
    }
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
    .select(`
      *,
      profiles!listings_seller_id_fkey (
        full_name
      ),
      listing_tags (
        tag,
        kind,
        service_type,
        is_custom
      )
    `)
    .eq("id", id)
    .single();
  
  if (error) throw error;
  return data as Listing & { 
    profiles: { full_name: string | null },
    listing_tags: { tag: string, kind: string, service_type: string | null, is_custom: boolean | null }[]
  };
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
  
  let query = supabase.from("listings").select(`
    *,
    listing_tags (
      tag,
      kind,
      service_type,
      is_custom
    )
  `);
  if (sellerId) query = query.eq("seller_id", sellerId);
  
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data as (Listing & { listing_tags: { tag: string, kind: string, service_type: string | null, is_custom: boolean | null }[] })[];
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

  // Moderate any text fields being updated (batch for efficiency)
  const fieldsToModerate: Record<string, string> = {};
  if (typeof updates.title === "string") {
    fieldsToModerate.title = updates.title;
  }
  if (typeof updates.description === "string") {
    fieldsToModerate.description = updates.description;
  }
  if (typeof updates.location === "string") {
    fieldsToModerate.location = updates.location;
  }
  if (typeof updates.serving_style === "string") {
    fieldsToModerate.serving_style = updates.serving_style;
  }

  if (Object.keys(fieldsToModerate).length > 0) {
    try {
      await ensureListingFieldsSafe(fieldsToModerate, "update_listing");
    } catch (error) {
      if (error instanceof RateLimitError) {
        console.warn("Rate limit hit during listing update, proceeding with update...");
      } else {
        throw error;
      }
    }
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
  revalidatePath(`/listing/${id}`);
  
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

  // Create signed URL for moderation (more secure than public URL)
  const { data: signed } = await supabase
    .storage.from("listing-images")
    .createSignedUrl(filePath, 60 * 5); // 5 minutes
  const reviewUrl = signed?.signedUrl ?? publicUrlData?.publicUrl;

  // Moderate the image before returning
  try {
    await ensureImageUrlIsSafe(reviewUrl, "listing_image");
  } catch (err) {
    if (err instanceof RateLimitError) {
      console.warn("Rate limit hit during image moderation, proceeding with upload...");
    } else {
      // Delete the uploaded file to avoid leaving flagged content in storage
      await supabase.storage.from("listing-images").remove([filePath]);
      throw err; // Bubble up for UI to show a friendly message
    }
  }

  // kvs: Revalidate paths after image upload
  revalidatePath("/dashboard/seller/listings");
  revalidatePath(`/listing/${listingId}`);

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
  const validationResult = await validateMediaForUpload(files, listingId);
  if (!validationResult.isValid) {
    throw new MediaValidationError(validationResult.error!, "VALIDATION_ERROR");
  }

  // Get existing media for position calculation
  const { data: existingMedia, error: existingErr } = await supabase
    .from("listing_media")
    .select("media_type")
    .eq("listing_id", listingId);
  if (existingErr) throw existingErr;

  const allowedImageTypes = MEDIA_LIMITS.ALLOWED_IMAGE_TYPES;
  const allowedVideoTypes = MEDIA_LIMITS.ALLOWED_VIDEO_TYPES;
  const maxImageSize = MEDIA_LIMITS.MAX_IMAGE_SIZE_BYTES;
  const maxVideoSize = MEDIA_LIMITS.MAX_VIDEO_SIZE_BYTES;

  const uploaded: MediaRecord[] = [];
  let position = existingMedia?.length ?? 0;
  for (const file of files) {
    let mediaType: 'image' | 'video';
    if ((allowedImageTypes as readonly string[]).includes(file.type)) {
      if (file.size > maxImageSize) {
        throw new Error("Each image must be less than 10MB");
      }
      mediaType = 'image';
    } else if ((allowedVideoTypes as readonly string[]).includes(file.type)) {
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

    // Get public URL for moderation
    const { data: publicUrlData } = supabase.storage
      .from('listing-images')
      .getPublicUrl(filePath);

    // Create signed URL for moderation (more secure than public URL)
    const { data: signed } = await supabase
      .storage.from('listing-images')
      .createSignedUrl(filePath, 60 * 5); // 5 minutes
    const reviewUrl = signed?.signedUrl ?? publicUrlData?.publicUrl;

    // Moderate images only (videos are not supported by OpenAI moderation API yet)
    if (mediaType === 'image') {
      try {
        await ensureImageUrlIsSafe(reviewUrl, "listing_media");
      } catch (err) {
        if (err instanceof RateLimitError) {
          console.warn("Rate limit hit during media moderation, proceeding with upload...");
        } else {
          // Delete the uploaded file to avoid leaving flagged content in storage
          await supabase.storage.from('listing-images').remove([filePath]);
          throw err; // Bubble up for UI to show a friendly message
        }
      }
    }
    // Note: Videos are not moderated by OpenAI API yet. For videos, you could:
    // 1. Block video uploads for now, or
    // 2. Sample frames and moderate those as images

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
  
  // Filter out emails just in case (no email moderation needed)
  const emailLike = /\b\S+@\S+\.\S+\b/;
  const toModerate = normalized.filter(t => !emailLike.test(t));

  // Run moderation on the batch of tags
  if (toModerate.length > 0) {
    try {
      await ensureTextsAreSafe(toModerate, "listing.tags");
    } catch (error) {
      if (error instanceof RateLimitError) {
        console.warn("Rate limit hit during tag moderation, proceeding with tag creation...");
      } else {
        throw error;
      }
    }
  }

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
  
  // Query published listings with seller profile information and tags
  let query = supabase
    .from("listings")
    .select(`
      *,
      profiles!listings_seller_id_fkey (
        full_name
      ),
      listing_tags (
        tag,
        kind,
        service_type,
        is_custom
      )
    `)                                   // << keep the JOIN and add tags
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
  
  return data as (Listing & { 
    profiles: { full_name: string | null },
    listing_tags: { tag: string, kind: string, service_type: string | null, is_custom: boolean | null }[]
  })[];
}

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
      const listings = await getPublicListings();
      return listings.map(transformListingToService);
    }
    
    // Start with base query for published listings
    let query = supabase
      .from("listings")
      .select(`
        *,
        profiles!listings_seller_id_fkey (
          full_name
        ),
        listing_tags (
          tag,
          kind,
          service_type,
          is_custom
        )
      `)
      .eq("is_published", true);

    // Apply search query if provided (search in title, description, location, and listing_tags)
    if (hasSearchQuery) {
      const searchTerm = searchQuery.trim();
      
      // First get listing IDs that have matching tags
      const { data: listingsWithMatchingTags } = await supabase
        .from('listing_tags')
        .select('listing_id')
        .or(`tag.ilike.%${searchTerm}%,service_type.ilike.%${searchTerm}%`);
      
      const tagMatchingIds = listingsWithMatchingTags?.map(lt => lt.listing_id) || [];
      
      if (tagMatchingIds.length > 0) {
        // Search in listing fields OR tag matches
        query = query.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,id.in.(${tagMatchingIds.join(',')})`
        );
      } else {
        // Fallback to just listing fields
        query = query.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`
        );
      }
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

    // Apply event type filter - check listing_tags with kind='type'
    if (filters?.eventType && filters.eventType.trim()) {
      const eventTypeFilter = filters.eventType.trim();
      
      // Create a more complex query that checks listing_tags with kind='type'
      // 1. listing_tags with kind='type' and service_type matching
      // 2. listing_tags with kind='type' and is_custom=true and tag matching (for custom types)
      
      // Use a subquery approach to check listing_tags
      const { data: listingsWithServiceType } = await supabase
        .from('listing_tags')
        .select('listing_id')
        .eq('kind', 'type')
        .or(`service_type.eq.${eventTypeFilter},and(is_custom.eq.true,tag.ilike.%${eventTypeFilter}%)`);
      
      const listingIdsWithServiceType = listingsWithServiceType?.map(lt => lt.listing_id) || [];
      
      if (listingIdsWithServiceType.length > 0) {
        // Filter by listings that have matching service type tags
        query = query.in('id', listingIdsWithServiceType);
      } else {
        // No matches found, return empty results
        query = query.eq('id', '00000000-0000-0000-0000-000000000000'); // Impossible UUID
      }
    }

    // Order by relevance (recently created first)
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    
    if (error) {
      console.error('Error searching listings:', error);
      return [];
    }

    // Transform to Service format
    const listings = data as (Listing & { 
      profiles: { full_name: string | null },
      listing_tags: { tag: string, kind: string, service_type: string | null, is_custom: boolean | null }[]
    })[];
    const result = listings.map(transformListingToService);
    console.log('🔍 searchAndFilterListings returning', result.length, 'results')
    return result;
  } catch (error) {
    console.error('Error in searchAndFilterListings:', error);
    return [];
  }
}

// Define service type enum values
type ServiceType = 'venue' | 'music' | 'catering' | 'funeral' | 'birthday' | 'wedding' | 'baby_shower' | 'other';

// Server Action to set listing type
export async function setListingType(
  listingId: string, 
  typeData: { service_type: ServiceType; custom_label?: string }
) {
  const supabase = await createClient();
  
  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Authentication required");
  }

  // Verify listing ownership
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("id", listingId)
    .single();
  
  if (listingError) throw new Error("Listing not found");
  if (listing.seller_id !== user.id) {
    throw new Error("Unauthorized: You can only modify your own listings");
  }

  // Validate service_type
  const validServiceTypes: ServiceType[] = ['venue', 'music', 'catering', 'funeral', 'birthday', 'wedding', 'baby_shower', 'other'];
  if (!validServiceTypes.includes(typeData.service_type)) {
    throw new Error("Invalid service type");
  }

  // Validate custom_label for 'other' type
  let tagValue: string;
  let isCustom: boolean;
  
  if (typeData.service_type === 'other') {
    if (!typeData.custom_label || typeData.custom_label.trim().length < 2 || typeData.custom_label.trim().length > 40) {
      throw new Error("Custom label must be between 2-40 characters");
    }
    tagValue = typeData.custom_label.trim().toLowerCase();
    isCustom = true;
  } else {
    // Convert enum to hyphenated format for tag value
    tagValue = typeData.service_type.replace('_', '-');
    isCustom = false;
  }

  try {
    // Delete existing type tags for this listing
    await supabase
      .from("listing_tags")
      .delete()
      .eq("listing_id", listingId)
      .eq("kind", "type");

    // Insert new type tag
    const { error: insertError } = await supabase
      .from("listing_tags")
      .insert({
        listing_id: listingId,
        kind: "type",
        service_type: typeData.service_type,
        is_custom: isCustom,
        tag: tagValue
      });

    if (insertError) throw insertError;

    // Revalidate relevant paths
    revalidatePath("/dashboard/seller/listings");
    revalidatePath(`/listing/${listingId}`);

    return { success: true };
  } catch (error) {
    console.error('Error setting listing type:', error);
    throw new Error("Failed to set listing type");
  }
}

// Server Action to add keyword tags
export async function addKeywordTags(listingId: string, tags: string[]) {
  const supabase = await createClient();
  
  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Authentication required");
  }

  // Verify listing ownership
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("id", listingId)
    .single();
  
  if (listingError) throw new Error("Listing not found");
  if (listing.seller_id !== user.id) {
    throw new Error("Unauthorized: You can only modify your own listings");
  }

  // Normalize tags: trim, lowercase, dedupe
  const normalizedTags = [...new Set(
    tags
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
  )];

  if (normalizedTags.length === 0) {
    return { success: true, inserted: 0 };
  }

  try {
    // Prepare insert data
    const insertsData = normalizedTags.map(tag => ({
      listing_id: listingId,
      kind: "keyword" as const,
      service_type: null,
      is_custom: false,
      tag: tag
    }));

    // Insert keyword tags - use upsert to handle duplicates gracefully
    const { data, error: insertError } = await supabase
      .from("listing_tags")
      .upsert(insertsData, { 
        onConflict: 'listing_id,tag,kind',
        ignoreDuplicates: true 
      })
      .select();

    if (insertError) {
      // If upsert fails, try individual inserts and ignore constraint violations
      let insertedCount = 0;
      for (const insertData of insertsData) {
        const { error } = await supabase
          .from("listing_tags")
          .insert(insertData);
        
        if (!error) {
          insertedCount++;
        }
        // Silently ignore duplicate key violations
      }
      
      // Revalidate paths
      revalidatePath("/dashboard/seller/listings");
      revalidatePath(`/listing/${listingId}`);
      
      return { success: true, inserted: insertedCount };
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard/seller/listings");
    revalidatePath(`/listing/${listingId}`);

    return { success: true, inserted: data?.length || 0 };
  } catch (error) {
    console.error('Error adding keyword tags:', error);
    throw new Error("Failed to add keyword tags");
  }
}

// Server Action to get listing metadata (type, keywords, media)
export async function getListingMeta(listingId: string) {
  const supabase = await createClient();
  
  try {
    // Get listing tags
    const { data: tags, error: tagsError } = await supabase
      .from("listing_tags")
      .select("tag, kind, service_type, is_custom")
      .eq("listing_id", listingId);

    if (tagsError) throw tagsError;

    // Get listing media
    const { data: media, error: mediaError } = await supabase
      .from("listing_media")
      .select("url, media_type, position")
      .eq("listing_id", listingId)
      .order("position", { ascending: true });

    if (mediaError) throw mediaError;

    // Separate type and keyword tags
    const typeTag = tags?.find(tag => tag.kind === 'type') || null;
    const keywordTags = tags?.filter(tag => tag.kind === 'keyword') || [];

    return {
      typeTag,
      keywordTags,
      media: media || []
    };
  } catch (error) {
    console.error('Error getting listing meta:', error);
    throw new Error("Failed to get listing metadata");
  }
}