import HomepageContent from "@/shared/components/homepage/HomepageContent";
import { getPublicListingsAsServices, searchAndFilterListings } from "@/features/services/listing_crud";
import { Service } from "@/shared/types/service";

type SearchParams = {
  q?: string;
  price?: string;
  guests?: string;
  eventType?: string;
};

interface HomePageProps {
  searchParams: Promise<SearchParams>; // ✅ Next 15 expects a Promise
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = await searchParams; // ✅ await it
  let services: Service[] = [];

  console.log("🏠 HomePage: searchParams received:", sp);

  try {
    const hasSearchParams = sp.q || sp.price || sp.guests || sp.eventType;

    if (hasSearchParams) {
      services = await searchAndFilterListings(sp.q, {
        priceRange: sp.price ? sp.price.split(",").filter(Boolean) : undefined,
        guestNumber: sp.guests ? sp.guests.split(",").filter(Boolean) : undefined,
        eventType: sp.eventType,
      });
    } else {
      services = await getPublicListingsAsServices();
    }

    console.log("🏠 HomePage: Found", services.length, "services");
  } catch (error) {
    console.error("🏠 HomePage: Error fetching services:", error);
  }

  return <HomepageContent initialServices={services} searchParams={sp} />;
}
