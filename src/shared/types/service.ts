// Type definitions for service/listing data

// Service type constants
export const SERVICE_TYPES = {
  VENUE: 'venue',
  MUSIC: 'music',
  CATERING: 'catering',
  FUNERAL: 'funeral',
  BIRTHDAY: 'birthday',
  WEDDING: 'wedding',
  BABY_SHOWER: 'baby_shower',
  OTHER: 'other'
} as const;

export type ServiceType = typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES];

export interface Service {
  id: string;
  seller_id: string;
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
  tags?: string[]; // Added to display tags on listings
  organization?: string; // Added to display organization info on listing details
}
