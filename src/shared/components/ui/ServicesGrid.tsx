'use client'

import { useState } from 'react'
import ServiceCard from "@/shared/components/ui/ServiceCard"
import ListingModal from "@/shared/components/ui/ListingModal"
import { Service } from "@/shared/types/service"

interface ServicesGridProps {
  services: Service[];
}

export default function ServicesGrid({ services }: ServicesGridProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleViewClick = (service: Service) => {
    setSelectedService(service)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedService(null)
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-3 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-3 sm:gap-6">
          {services.map((service) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              onViewClick={handleViewClick}
            />
          ))}
        </div>
      </div>

      <ListingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        service={selectedService}
      />
    </>
  )
}
