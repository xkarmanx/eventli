// Server-side media validation utilities
'use server'

import { createClient } from "./supabase/server";
import { MEDIA_LIMITS, MediaValidationError, validateMediaLimits } from "./mediaValidation";

// Type definitions for server functions
interface MediaCounts {
  images: number;
  videos: number;
}

interface MediaValidationResult {
  isValid: boolean;
  error?: string;
  newCounts: MediaCounts;
}

/**
 * Get current media counts for a listing (server-side)
 */
export async function getListingMediaCounts(listingId: string): Promise<MediaCounts> {
  const supabase = await createClient();
  
  const { data: existingMedia, error } = await supabase
    .from("listing_media")
    .select("media_type")
    .eq("listing_id", listingId);
    
  if (error) {
    throw new MediaValidationError("Failed to fetch existing media", "FETCH_ERROR");
  }

  const media = existingMedia ?? [];
  return {
    images: media.filter((m: any) => m.media_type === 'image').length,
    videos: media.filter((m: any) => m.media_type === 'video').length,
  };
}

/**
 * Complete media validation for upload - combines all checks (server-side)
 */
export async function validateMediaForUpload(
  files: File[],
  listingId: string
): Promise<MediaValidationResult> {
  if (!files || files.length === 0) {
    return {
      isValid: true,
      newCounts: { images: 0, videos: 0 },
    };
  }

  // Get existing media counts
  const existingCounts = await getListingMediaCounts(listingId);

  // Validate against limits using the shared logic
  return validateMediaLimits(files, existingCounts);
}
