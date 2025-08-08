// Type definitions for service/listing data
export interface Service {
  id: string;
  title: string;
  price: string;
  location: string;
  provider: string;
  guests: string;
  staff: string;
  status: string;
  eventType: string; // JC: Added to display event category instead of status
  image: string;
  description: string; // JC: Added so it renders the right description in ListingModal
  serving_style: string; // JC: Added to handle serving style in ListingModal
  seller_id: string; // CT: Added to link bookings to the seller
}
