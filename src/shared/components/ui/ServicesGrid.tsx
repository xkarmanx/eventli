// src/shared/components/ui/ServicesGrid.tsx
'use client'

import { useRouter } from 'next/navigation'
import ServiceCard from '@/shared/components/ui/ServiceCard'
import { Service } from '@/shared/types/service'
import Link from 'next/link' // ADD

interface ServicesGridProps {
  services: Service[];
}

export default function ServicesGrid({ services }: ServicesGridProps) {
  const router = useRouter();

  const handleViewClick = (service: Service) => {
    router.push(`/listing/${service.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 py-3 sm:py-6 lg:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-3 sm:gap-6">
        {services.map((service) => (
          <Link key={service.id} href={`/listing/${service.id}`} className="block">
            {/* Keep card styling intact; navigation handled by Link */}
            <ServiceCard
              service={service}
              // onViewClick={() => handleViewClick(service)} // no longer needed
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
