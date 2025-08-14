// Centralized media validation utility for consistent validation across create and edit flows

import { createClient } from "./supabase/server";

// Media limits constants (shared between server and client)
export const MEDIA_LIMITS = {
  MAX_IMAGES_PER_LISTING: 15,
  MAX_VIDEOS_PER_LISTING: 5,
  MAX_IMAGE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  MAX_VIDEO_SIZE_BYTES: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/webm'],
} as const;

// Media validation error types
export class MediaValidationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'MediaValidationError';
  }
}

// Type definitions
interface MediaCounts {
  images: number;
  videos: number;
}

interface FileValidationResult {
  isValid: boolean;
  error?: string;
  mediaType?: 'image' | 'video';
}

interface MediaValidationResult {
  isValid: boolean;
  error?: string;
  newCounts: MediaCounts;
}

/**
 * Validate a single file for type and size
 */
export function validateFile(file: File): FileValidationResult {
  const { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, MAX_IMAGE_SIZE_BYTES, MAX_VIDEO_SIZE_BYTES } = MEDIA_LIMITS;

  // Check file type and determine media type (cast to readonly string[] for includes check)
  if ((ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return {
        isValid: false,
        error: `Image "${file.name}" must be less than 10MB`,
      };
    }
    return {
      isValid: true,
      mediaType: 'image',
    };
  } else if ((ALLOWED_VIDEO_TYPES as readonly string[]).includes(file.type)) {
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      return {
        isValid: false,
        error: `Video "${file.name}" must be less than 50MB`,
      };
    }
    return {
      isValid: true,
      mediaType: 'video',
    };
  } else {
    return {
      isValid: false,
      error: `Unsupported file type: ${file.type}`,
    };
  }
}

/**
 * Validate multiple files against existing media counts
 */
export function validateMediaLimits(
  files: File[],
  existingCounts: MediaCounts
): MediaValidationResult {
  const { MAX_IMAGES_PER_LISTING, MAX_VIDEOS_PER_LISTING } = MEDIA_LIMITS;

  // Count new files by type
  let newImageCount = 0;
  let newVideoCount = 0;
  
  for (const file of files) {
    const fileResult = validateFile(file);
    if (!fileResult.isValid) {
      return {
        isValid: false,
        error: fileResult.error,
        newCounts: { images: 0, videos: 0 },
      };
    }
    
    if (fileResult.mediaType === 'image') {
      newImageCount++;
    } else if (fileResult.mediaType === 'video') {
      newVideoCount++;
    }
  }

  // Check total limits
  const totalImages = existingCounts.images + newImageCount;
  const totalVideos = existingCounts.videos + newVideoCount;

  if (totalImages > MAX_IMAGES_PER_LISTING) {
    return {
      isValid: false,
      error: `Maximum of ${MAX_IMAGES_PER_LISTING} images per listing allowed (current: ${existingCounts.images}, trying to add: ${newImageCount})`,
      newCounts: { images: newImageCount, videos: newVideoCount },
    };
  }

  if (totalVideos > MAX_VIDEOS_PER_LISTING) {
    return {
      isValid: false,
      error: `Maximum of ${MAX_VIDEOS_PER_LISTING} videos per listing allowed (current: ${existingCounts.videos}, trying to add: ${newVideoCount})`,
      newCounts: { images: newImageCount, videos: newVideoCount },
    };
  }

  return {
    isValid: true,
    newCounts: { images: newImageCount, videos: newVideoCount },
  };
}

/**
 * Client-side validation helper (for immediate feedback)
 * Note: This doesn't check existing media counts since it's client-side
 */
export function validateFilesClientSide(files: File[]): FileValidationResult[] {
  return files.map(file => validateFile(file));
}

/**
 * Get human-readable media limits text
 */
export function getMediaLimitsText(): string {
  const { MAX_IMAGES_PER_LISTING, MAX_VIDEOS_PER_LISTING, MAX_IMAGE_SIZE_BYTES, MAX_VIDEO_SIZE_BYTES } = MEDIA_LIMITS;
  const imageSizeMB = Math.floor(MAX_IMAGE_SIZE_BYTES / (1024 * 1024));
  const videoSizeMB = Math.floor(MAX_VIDEO_SIZE_BYTES / (1024 * 1024));
  
  return `Max ${MAX_IMAGES_PER_LISTING} images & ${MAX_VIDEOS_PER_LISTING} videos (${imageSizeMB}MB per image, ${videoSizeMB}MB per video)`;
}
