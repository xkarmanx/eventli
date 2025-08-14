'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Users, Clock, Building2, CheckCircle, Utensils, HandPlatter, Calendar } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'
import { Service } from '@/shared/types/service'
import BookingModal from '@/shared/components/ui/BookingModal'
import Navbar from '@/shared/components/ui/Navbar'
import { createClient } from '@/shared/lib/supabase/client'

interface ListingDetailsPageProps {
  service: Service
}

export default function ListingDetailsPage({ service }: ListingDetailsPageProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [images, setImages] = useState<string[]>(service.image ? [service.image] : [])
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

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      const { data, error } = await supabase
        .from('listing_media')
        .select('url, media_type, position')
        .eq('listing_id', service.id)
        .order('position', { ascending: true })
      if (!error && data) {
        const urls = data
          .filter(m => m.media_type === 'image' && m.url)
          .map(m => m.url as string)
        // Start with service.image if present, then DB images (no duplicates)
        const unique = Array.from(new Set([...(service.image ? [service.image] : []), ...urls]))
        setImages(unique)
      }
    })()
  }, [service.id, service.image])

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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <>
      {/* Include Navbar */}
      <Navbar />
      
      <div className="min-h-screen bg-gray-50">
        {/* Desktop Header - Hidden on mobile */}
        <div className="hidden md:block bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/" className="hover:text-teal-600 transition-colors">Services</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{service.title}</span>
            </nav>
          </div>
        </div>

        {/* Mobile Header with Back Button */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center sticky top-0 z-40">
          <Link href="/" className="mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 truncate flex-1">
            {service.title}
          </h1>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Image Gallery */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Main Image */}
                <div className="relative h-64 md:h-80 lg:h-96">
                  {images.length > 0 && (
                    <Image
                      src={images[currentImageIndex]}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  
                  {/* Image Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all backdrop-blur-sm"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all backdrop-blur-sm"
                      >
                        <ArrowLeft className="w-5 h-5 rotate-180" />
                      </button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>
                
                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                  <div className="p-4 border-t">
                    <div className="flex space-x-2 overflow-x-auto">
                      {images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex 
                              ? 'border-teal-500' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${service.title} ${index + 1}`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Service Title and Basic Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {service.title}
                    </h1>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-5 h-5 mr-2 text-teal-600" />
                      <span className="text-lg">{service.location}</span>
                    </div>
                    
                    {/* Service Type and Keywords */}
                    <div className="space-y-3">
                      {/* Service Type */}
                      <div className="flex items-center">
                        <span className="px-3 py-1 bg-teal-100 text-teal-800 text-sm font-medium rounded-full">
                          {service.eventType}
                        </span>
                      </div>
                      
                      {/* Keywords */}
                      {service.tags && service.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {service.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Description */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">About this service</h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description || 'Experience premium event services tailored to your needs. Our professional team ensures every detail is perfectly executed for your special occasion.'}
                </p>
                
                {/* Tags Section */}
                {service.tags && service.tags.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Service Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {service.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-50 text-teal-700 border border-teal-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Service Details */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Service Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="p-3 bg-teal-100 rounded-full mr-4">
                      <Users className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Guest Capacity</p>
                      <p className="text-gray-600">{service.guests}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="p-3 bg-blue-100 rounded-full mr-4">
                      <HandPlatter className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Staff Included</p>
                      <p className="text-gray-600">{service.staff || 'Professional staff'}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="p-3 bg-purple-100 rounded-full mr-4">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Provider</p>
                      <p className="text-gray-600">{service.provider}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="p-3 bg-orange-100 rounded-full mr-4">
                      <Utensils className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Serving Style</p>
                      <p className="text-gray-600">{service.serving_style}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="p-3 bg-green-100 rounded-full mr-4">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Support</p>
                      <p className="text-gray-600">24/7 Customer Support</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="p-3 bg-green-100 rounded-full mr-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Status</p>
                      <p className="text-green-600 font-medium">{service.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card (Desktop) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {service.price}
                    </div>
                    <p className="text-gray-500">Starting price</p>
                  </div>

                  {/* Organization Info */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-teal-100 rounded-full mr-3">
                        <Building2 className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Service Provider</p>
                        <p className="text-gray-600">{service.organization || service.provider}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Professional event services with verified credentials
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Service Fee</span>
                      <span className="font-medium">Included</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Setup & Cleanup</span>
                      <span className="font-medium">Included</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">24/7 Support</span>
                      <span className="font-medium">Included</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-all"
                    onClick={handleRequestBooking}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Request Booking
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Free consultation • No booking fees • Instant confirmation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fixed Bottom Booking Button */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xl font-bold text-gray-900">{service.price}</div>
              <div className="text-sm text-gray-500">Starting price</div>
            </div>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md"
              onClick={handleRequestBooking}
            >
              Book Now
            </Button>
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
