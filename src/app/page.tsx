'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import HomepageContent from "@/shared/components/homepage/HomepageContent";
import { getPublicListingsAsServices, searchAndFilterListings } from "@/features/services/listing_crud";
import { Service } from "@/shared/types/service";

export default function HomePage() {
  // Use the standard hook to get search params on the client
  const searchParams = useSearchParams();
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch data on the client based on the search params
  React.useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const q = searchParams.get('q');
        const price = searchParams.get('price');
        const guests = searchParams.get('guests');
        const eventType = searchParams.get('eventType');

        const hasSearchParams = q || price || guests || eventType;

        let serviceData: Service[];
        if (hasSearchParams) {
          serviceData = await searchAndFilterListings(
            q ?? undefined,
            {
              priceRange: price ? price.split(',').filter(Boolean) : undefined,
              guestNumber: guests ? guests.split(',').filter(Boolean) : undefined,
              eventType: eventType ?? undefined,
            }
          );
        } else {
          serviceData = await getPublicListingsAsServices();
        }
        setServices(serviceData);
      } catch (error) {
        console.error('🏠 HomePage: Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [searchParams]);

  const currentSearchParams = {
    q: searchParams.get('q') ?? undefined,
    price: searchParams.get('price') ?? undefined,
    guests: searchParams.get('guests') ?? undefined,
    eventType: searchParams.get('eventType') ?? undefined,
  };
  
  // Optional: Show a loading state while fetching
  if (loading) {
    return <div className="text-center p-10">Loading services...</div>;
  }

  return (
    <HomepageContent 
      initialServices={services} 
      searchParams={currentSearchParams}
    />
  );
}
