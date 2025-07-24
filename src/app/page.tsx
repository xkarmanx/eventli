import HomepageContent from "@/shared/components/homepage/HomepageContent";
import { getPublicListingsAsServices, searchAndFilterListings } from "@/features/services/listing_crud";
import { Service } from "@/shared/types/service";

interface HomePageProps {
  searchParams: {
    q?: string;
    price?: string;
    guests?: string;
    eventType?: string;
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  let services: Service[] = [];
  console.log('🏠 HomePage: searchParams received:', searchParams);
  
  try {
    // Check if there are search parameters directly
    const hasSearchParams =
      searchParams.q ||
      searchParams.price ||
      searchParams.guests ||
      searchParams.eventType;
    
    console.log('🏠 HomePage: hasSearchParams:', hasSearchParams);
    
    if (hasSearchParams) {
      console.log('🏠 HomePage: Using search functionality');
      // Use search functionality when parameters are present
      services = await searchAndFilterListings(
        searchParams.q,
        {
          priceRange: searchParams.price
            ? searchParams.price.split(',').filter(Boolean)
            : undefined,
          guestNumber: searchParams.guests
            ? searchParams.guests.split(',').filter(Boolean)
            : undefined,
          eventType: searchParams.eventType,
        }
      );
    } else {
      console.log('🏠 HomePage: Fetching all public listings');
      // Fetch all public listings when no search parameters
      services = await getPublicListingsAsServices();
    }
    
    console.log('🏠 HomePage: Found', services.length, 'services');
  } catch (error) {
    console.error('🏠 HomePage: Error fetching services:', error);
    // If there's an error, we'll show an empty state
  }

  return (
    <HomepageContent 
      initialServices={services} 
      searchParams={searchParams}
    />
  );
}
