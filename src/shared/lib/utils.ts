import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A helper function that helps with organizing CSS classes (including from Tailwind CSS)
 *
 * @param inputs CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility Functions
