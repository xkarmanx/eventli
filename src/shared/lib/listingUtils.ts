// Utility functions for transforming data between database and UI formats
import { Service } from "@/shared/types/service";
import { Database } from "@/shared/types/database";

type Listing = Database["public"]["Tables"]["listings"]["Row"];

// Transform database listing to Service interface format
export function transformListingToService(listing: Listing & { profiles: { full_name: string | null } }): Service {
  // Format price with proper currency
  let formattedPrice = "Price on request";
  if (listing.price && listing.price > 0) {
    formattedPrice = `$${listing.price.toLocaleString('en-US')}`;
  }
  
  return {
    id: listing.id,
    title: listing.title,
    price: formattedPrice,
    location: listing.location || "Location not specified",
    provider: listing.profiles?.full_name || "Service Provider",
    guests: listing.num_guests ? `Up to ${listing.num_guests} guests` : "Guest count not specified",
    staff: listing.num_staff ? `${listing.num_staff} staff` : "Staff count not specified",
    status: listing.is_published ? "Accepting" : "Not Available",
    image: listing.image_url || "/assets/samantha-gades-7J4T1XzpJgU-unsplash.jpg",
  };
}
