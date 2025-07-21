'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Users, Clock, Building2, CheckCircle, Utensils, HandPlatter } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'
import { Service } from '@/shared/types/service'
import BookingModal from '@/shared/components/ui/BookingModal'

interface ListingDetailsPageProps {
  service: Service
}

export default function ListingDetailsPage({ service }: ListingDetailsPageProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleRequestBooking = () => {
    if (isMobile) {
      // On mobile, navigate to booking page
      router.push(`/listing/${service.id}/booking`)
    } else {
      // On desktop, show modal
      setIsBookingModalOpen(true)
    }
  }

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false)
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header with Back Button */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
          <Link href="/" className="mr-3">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {service.title}
          </h1>
        </div>

        {/* Main Content */}
        <div className="pb-20"> {/* Add bottom padding for fixed booking button */}
          {/* Hero Image */}
          <div className="relative w-full h-64">
            <Image
              src={service.image}
              alt={service.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="px-4 py-6 space-y-6">
            {/* Title and Location */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {service.title}
              </h2>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{service.location}</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-2xl font-bold text-teal-600">
                {service.price}
              </p>
            </div>

            {/* Service Details */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Guests</p>
                    <p className="text-sm text-gray-600">{service.guests}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <HandPlatter className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Staff</p>
                    <p className="text-sm text-gray-600">{service.staff || 'Staff info not available'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Provider</p>
                    <p className="text-sm text-gray-600">{service.provider}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Utensils className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Serving Style</p>
                    <p className="text-sm text-gray-600">{service.serving_style}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Support</p>
                    <p className="text-sm text-gray-600">24 Hours Support</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Status</p>
                    <p className="text-sm text-gray-600">{service.status}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {service.description || 'No description available'}
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Booking Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
          <Button
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium"
            onClick={handleRequestBooking}
          >
            Request Booking
          </Button>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        service={service}
      />
    </>
  )
}
