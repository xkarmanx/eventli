'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, MapPin, Users, Clock, Building2, CheckCircle, Utensils, HandPlatter } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/shared/components/ui/button'
import { Service } from '@/shared/types/service'
import BookingModal from './BookingModal'
import { createClient } from "@/shared/lib/supabase/client"
import { toast } from "sonner"

interface ListingModalProps {
  isOpen: boolean
  onClose: () => void
  service: Service | null
}

export default function ListingModal({ isOpen, onClose, service }: ListingModalProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  // Auth state
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  // Initialize mobile detection on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    checkMobile()
    setIsMounted(true)
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch user and profile
  useEffect(() => {
    const supabase = createClient()
    const getUserAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      if (session?.user?.id) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
        setProfile(profileData)
      }
    }
    getUserAndProfile()
  }, [])

  // Handle mobile navigation - only after component is mounted
  useEffect(() => {
    if (!isMounted) return // Wait for mount to complete
    if (isOpen && service && isMobile) {
      // On mobile, navigate to the listing page instead of showing modal
      router.push(`/listing/${service.id}`)
      onClose() // Close the modal state
      return
    }
  }, [isOpen, service, isMobile, router, onClose, isMounted])

  useEffect(() => {
    if (!isMounted || !isOpen || isMobile) return // Don't set up modal behavior on mobile
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, isMobile, isMounted])

  // Don't render modal on mobile (navigation handled above) or before mount
  if (!isMounted || !isOpen || !service || isMobile) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleRequestBooking = () => {
    if (!user) {
      // Not logged in, redirect to signup
      router.push("/signup?role=customer")
      return
    }
    if (profile?.role === "seller") {
      toast.error("You cannot request bookings as a seller.")
      return
    }
    setIsBookingModalOpen(true)
  }

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false)
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
      >
        <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative transform transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="cursor-pointer absolute top-4 right-4 p-2 text-teal-600 hover:text-white hover:bg-teal-700 rounded-full transition-colors z-10 bg-white border border-gray-300 shadow-md"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Modal Content - Scrollable */}
          <div className="overflow-y-auto max-h-[90vh] p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {service.title}
              </h1>
              <div className="h-px bg-gray-200"></div>
            </div>

            {/* Upper Section - Image and Details Grid */}
            <div className="flex flex-col lg:flex-row gap-8 mb-8">
              {/* Left Column - Image */}
              <div className="lg:w-1/3">
                <div className="relative">
                  <Image
                    src={service.image}
                    alt={service.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              </div>

              {/* Right Column - Details Grid Only */}
              <div className="lg:w-2/3">
                {/* Service Details Grid */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">{service.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <HandPlatter className="w-6 h-6 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">{service.staff || 'Staff info not available'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">{service.guests}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">{service.provider}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Utensils className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Serving Style: {service.serving_style}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">24 Hours Support</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">{service.status}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Yes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lower Section - Description, Price and Booking (Full Width) */}
            <div className="w-full border-t border-gray-200 pt-8">
              {/* Description Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                <div className="text-sm text-gray-600">
                  <p>{service.description || 'No description available'}</p>
                </div>
              </div>

              {/* Price and Booking Section */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    Price: {service.price}
                  </p>
                </div>
                <Button
                  className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-medium"
                  onClick={handleRequestBooking}
                >
                  Request Booking
                </Button>
              </div>
            </div>
          </div>
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