'use client'

import { useState } from 'react'
import ServiceCard from "@/shared/components/ui/ServiceCard"
import ListingModal from "@/shared/components/ui/ListingModal"
import { Service } from "@/shared/lib/mockData"

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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
