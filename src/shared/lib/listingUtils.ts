// Utility functions for transforming data between database and UI formats
import { Service } from "@/shared/types/service";
import { Database } from "@/shared/types/database";

type Listing = Database["public"]["Tables"]["listings"]["Row"];

// Transform database listing to Service interface format
export function transformListingToService(listing: Listing & { 
  profiles: { full_name: string | null },
  listing_tags?: { tag: string }[]
}): Service {
  // Format price with proper currency
  let formattedPrice = "Price on request";
  if (listing.price && listing.price > 0) {
    formattedPrice = `$${listing.price.toLocaleString('en-US')}`;
  }
  
  // Format event type for display
  const formatEventType = (eventType: string | null): string => {
    if (!eventType) return "General";
    // Capitalize first letter and handle common cases
    return eventType.charAt(0).toUpperCase() + eventType.slice(1).toLowerCase();
  };
  
  // Extract tags from listing_tags array
  const tags = listing.listing_tags?.map(tagObj => tagObj.tag) || [];
  
  return {
    id: listing.id,
    seller_id: listing.seller_id,
    title: listing.title,
    price: formattedPrice,
    location: listing.location || "Location not specified",
    provider: listing.profiles?.full_name || "Service Provider",
    guests: listing.num_guests ? `Up to ${listing.num_guests} guests` : "Guest count not specified",
    staff: listing.num_staff ? `${listing.num_staff} staff` : "Staff count not specified",
    status: listing.is_published ? "Accepting" : "Not Available",
    eventType: formatEventType(listing.event_type), // JC: Added event type for category display
    image: listing.image_url || "/assets/samantha-gades-7J4T1XzpJgU-unsplash.jpg",
    // JC: Fixed missing fields - Added serving_style and description mapping
    serving_style: listing.serving_style || "Not specified",
    description: listing.description || "No description available",
    tags: tags.length > 0 ? tags : undefined, // Only include tags if they exist
    organization: listing.profiles?.full_name || "Service Provider", // Add organization name
  };
}
