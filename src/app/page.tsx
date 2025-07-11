import HomepageContent from "@/shared/components/homepage/HomepageContent"
import { getPublicListingsAsServices } from "@/features/services/listing_crud"
import { Service } from "@/shared/types/service"

export default async function HomePage() {
  let services: Service[] = [];
  
  try {
    // Fetch real data from database - this is public data, no authentication needed
    services = await getPublicListingsAsServices();
  } catch (error) {
    console.error('Error fetching services for homepage:', error);
    // If there's an error, we'll show an empty state
  }

  return <HomepageContent initialServices={services} />
}