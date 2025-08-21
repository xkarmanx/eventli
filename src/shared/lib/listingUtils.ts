// Utility functions for transforming data between database and UI formats
import { Service } from "@/shared/types/service";
import { Database } from "@/shared/types/database";

type Listing = Database["public"]["Tables"]["listings"]["Row"];

// Transform database listing to Service interface format
export function transformListingToService(listing: Listing & { 
  profiles: { full_name: string | null },
  listing_tags?: { tag: string, kind?: string, service_type?: string | null, is_custom?: boolean | null }[]
}): Service {
  // Format price with proper currency
  let formattedPrice = "Price on request";
  if (listing.price && listing.price > 0) {
    formattedPrice = `$${listing.price.toLocaleString('en-US')}`;
  }
  
  // Extract service type from listing_tags with kind="type"
  const getServiceType = (): string => {
    if (listing.listing_tags) {
      const typeTag = listing.listing_tags.find(tag => tag.kind === 'type');
      if (typeTag) {
        if (typeTag.is_custom && typeTag.tag) {
          return typeTag.tag; // Custom type label
        }
        if (typeTag.service_type) {
          // Map enum values to display names
          switch (typeTag.service_type.toLowerCase()) {
            case 'wedding': return 'Wedding';
            case 'birthday': return 'Birthday';
            case 'corporate': return 'Corporate';
            case 'funeral': return 'Funeral';
            case 'other': return typeTag.tag || 'Other';
            default: return typeTag.service_type;
          }
        }
      }
    }
    // Default fallback if no type tag found
    return "General";
  };
  
  // Extract keyword tags (excluding type tags)
  const keywordTags = listing.listing_tags
    ?.filter(tag => tag.kind !== 'type')
    ?.map(tagObj => tagObj.tag) || [];
  
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
    eventType: getServiceType(), // Use the proper service type extraction
    image: listing.image_url || "/assets/samantha-gades-7J4T1XzpJgU-unsplash.jpg",
    serving_style: listing.serving_style || "Not specified",
    description: listing.description || "No description available",
    tags: keywordTags.length > 0 ? keywordTags : undefined, // Only keyword tags
    organization: listing.profiles?.full_name || "Service Provider",
  };
}
