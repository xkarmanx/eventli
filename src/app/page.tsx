import HomepageContent from "@/shared/components/homepage/HomepageContent"
import { getPublicListingsAsServices, searchAndFilterListings } from "@/features/services/listing_crud"
import { Service } from "@/shared/types/service"

interface HomePageProps {
  searchParams: {
    q?: string
    price?: string
    guests?: string
    eventType?: string
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  let services: Service[] = [];
  
  // In Next.js 15, searchParams is a Promise and needs to be awaited
  const resolvedSearchParams = await searchParams;
  
  console.log('🏠 HomePage: searchParams received:', resolvedSearchParams)
  
  try {
    // Check if there are search parameters
    const hasSearchParams = resolvedSearchParams.q || resolvedSearchParams.price || resolvedSearchParams.guests || resolvedSearchParams.eventType
    
    console.log('🏠 HomePage: hasSearchParams:', hasSearchParams)
    
    if (hasSearchParams) {
      console.log('🏠 HomePage: Using search functionality')
      // Use search functionality when parameters are present
      services = await searchAndFilterListings(
        resolvedSearchParams.q,
        {
          priceRange: resolvedSearchParams.price,
          guestNumber: resolvedSearchParams.guests,
          eventType: resolvedSearchParams.eventType,
        }
      );
    } else {
      console.log('🏠 HomePage: Fetching all public listings')
      // Fetch all public listings when no search parameters
      services = await getPublicListingsAsServices();
    }
    
    console.log('🏠 HomePage: Found', services.length, 'services')
  } catch (error) {
    console.error('🏠 HomePage: Error fetching services:', error);
    // If there's an error, we'll show an empty state
  }

  return (
    <HomepageContent 
      initialServices={services} 
      searchParams={resolvedSearchParams}
    />
  )
}