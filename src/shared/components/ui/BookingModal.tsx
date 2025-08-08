'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Service } from '@/shared/types/service'
import { createBooking } from "@/features/services/bookings_crud";
import { createClient } from "@/shared/lib/supabase/client";

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  service: Service | null
}

const supabase = createClient();

export default function BookingModal({ isOpen, onClose, service }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isMobile, setIsMobile] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    startTime: '12:00 AM',
    endTime: '18:00 PM'
  })

  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    timeRange: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Handle mobile navigation - only after component is mounted
  useEffect(() => {
    if (!isMounted) return // Wait for mount to complete
    
    if (isOpen && service && isMobile) {
      // On mobile, navigate to the booking page instead of showing modal
      router.push(`/listing/${service.id}/booking`)
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email) return 'Email is required'
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    return ''
  }

  const validatePhoneNumber = (phone: string): string => {
    if (!phone) return 'Phone number is required'
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '')
    // Check for valid US/International phone number (10-15 digits)
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return 'Please enter a valid phone number (10-15 digits)'
    }
    return ''
  }

  const validateName = (name: string, fieldName: string): string => {
    if (!name.trim()) return `${fieldName} is required`
    if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`
    if (name.trim().length > 50) return `${fieldName} must be less than 50 characters`
    // Check for valid name characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s'-]+$/
    if (!nameRegex.test(name.trim())) return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
    return ''
  }

  const validateAddress = (address: string): string => {
    if (!address.trim()) return 'Address is required'
    if (address.trim().length < 10) return 'Please enter a complete address'
    if (address.trim().length > 200) return 'Address must be less than 200 characters'
    return ''
  }

  const validateTimeRange = (startTime: string, endTime: string): string => {
    if (!startTime || !endTime) return 'Both start and end times are required'
    
    // Convert time strings to comparable format
    const convertTo24Hour = (timeStr: string): number => {
      const [time, period] = timeStr.split(' ')
      let [hours, minutes] = time.split(':').map(Number)
      
      if (period === 'PM' && hours !== 12) hours += 12
      if (period === 'AM' && hours === 12) hours = 0
      
      return hours * 60 + (minutes || 0)
    }

    const startMinutes = convertTo24Hour(startTime)
    const endMinutes = convertTo24Hour(endTime)
    
    if (endMinutes <= startMinutes) {
      return 'End time must be after start time'
    }
    
    // Minimum 1 hour booking
    if (endMinutes - startMinutes < 60) {
      return 'Booking must be at least 1 hour long'
    }
    
    return ''
  }

  const validateForm = (): boolean => {
    const errors = {
      firstName: validateName(formData.firstName, 'First name'),
      lastName: validateName(formData.lastName, 'Last name'),
      email: validateEmail(formData.email),
      phoneNumber: validatePhoneNumber(formData.phoneNumber),
      address: validateAddress(formData.address),
      timeRange: validateTimeRange(formData.startTime, formData.endTime)
    }

    setFormErrors(errors)
    
    // Check if any errors exist
    return Object.values(errors).every(error => error === '')
  }

const handleSubmitBooking = async () => {

  console.log("service:", service);
  if (!selectedDate) {
    console.log("No date selected");
    return;
  }
  if (!validateForm()) {
    console.log("Form validation failed", formErrors);
    return;
  }
  setIsSubmitting(true);

  try {
    //Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    const customer_id = session?.user?.id || "";

    // Compose booking input
    const eventDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate)
      .toISOString().slice(0, 10); // YYYY-MM-DD Format

    // You may need to get the seller_id from the service object
    const bookingInput = {
      listing_id: service.id,
      customer_id, // from auth
      seller_id: service.seller_id, //sellers id thats connected to the listing
      event_date: eventDate,
      event_time: `${formData.startTime} - ${formData.endTime}`,
      guest_count: service.guests,
      address: formData.address,
      event_type: service.eventType || "", // camelCase
      customer_name: `${formData.firstName} ${formData.lastName}`,
      customer_email: formData.email,
      customer_phone: formData.phoneNumber.replace(/\D/g, ''),
    };

    console.log("Booking input:", bookingInput);
    await createBooking(bookingInput);

    // Show toast notifications
    import("sonner").then(({ toast }) => {
      toast.success("Booking requested, please check your profile for more information.");
    });

    onClose();
  } catch (error) {
    import("sonner").then(({ toast }) => {
      toast.error("There was an error submitting your booking. Please try again.");
    });
    console.error("Booking error:", error);
  } finally {
    setIsSubmitting(false);
  }
};

  // Calendar logic
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"]
  
  const days = []
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonthIndex = today.getMonth()
  const currentDay = today.getDate()
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className=""></div>)
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    // Check if this day is in the past
    const isCurrentMonth = currentMonth.getFullYear() === currentYear && currentMonth.getMonth() === currentMonthIndex
    const isPastDay = isCurrentMonth && day < currentDay
    const isDisabled = isPastDay
    
    days.push(
      <button
        key={day}
        onClick={() => !isDisabled && setSelectedDate(day)}
        disabled={isDisabled}
        className={`w-8 h-8 text-sm rounded-lg transition-colors ${
          isDisabled 
            ? 'text-gray-300 cursor-not-allowed bg-gray-100' 
            : selectedDate === day 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
        }`}
      >
        {day}
      </button>
    )
  }

  const goToPreviousMonth = () => {
    const currentDate = new Date()
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    
    // Don't allow going before current month
    if (newMonth.getFullYear() < currentDate.getFullYear() || 
        (newMonth.getFullYear() === currentDate.getFullYear() && newMonth.getMonth() < currentDate.getMonth())) {
      return
    }
    
    setCurrentMonth(newMonth)
  }

  const goToNextMonth = () => {
    const currentDate = new Date()
    const maxDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth())
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    
    // Don't allow going more than 1 year in the future
    if (newMonth > maxDate) {
      return
    }
    
    setCurrentMonth(newMonth)
  }

  // Check if navigation buttons should be disabled
  const currentDate = new Date()
  const isAtMinMonth = currentMonth.getFullYear() === currentDate.getFullYear() && 
                      currentMonth.getMonth() === currentDate.getMonth()
  
  const maxDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth())
  const isAtMaxMonth = currentMonth.getFullYear() === maxDate.getFullYear() && 
                       currentMonth.getMonth() === maxDate.getMonth()

  return (
    <div
      className={`fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative transform transition-all duration-300 ${
        isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10 bg-white shadow-md"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[90vh] p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {service.title}
            </h1>
            <div className="h-px bg-gray-200"></div>
          </div>

          {/* Main Content - Calendar and Form */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Calendar */}
            <div className="lg:w-1/2">
              <div className="bg-gray-50 rounded-lg p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={goToPreviousMonth}
                      disabled={isAtMinMonth}
                      className={`p-1 rounded transition-colors ${
                        isAtMinMonth 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={goToNextMonth}
                      disabled={isAtMaxMonth}
                      className={`p-1 rounded transition-colors ${
                        isAtMaxMonth 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days}
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:w-1/2">
              <div className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`mt-1 ${formErrors.firstName ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Enter your first name"
                    />
                    {formErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`mt-1 ${formErrors.lastName ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Enter your last name"
                    />
                    {formErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`mt-1 ${formErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="your.email@example.com"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                    Phone Number *
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`mt-1 ${formErrors.phoneNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="(555) 123-4567"
                  />
                  {formErrors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                    Event Address *
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`mt-1 ${formErrors.address ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="123 Main St, City, State 12345"
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                  )}
                </div>

                {/* Time Range */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Event Time *
                  </Label>
                  <div className="flex items-center space-x-4">
                    <select
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                        formErrors.timeRange 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    >
                      <option value="12:00 AM">12:00 AM</option>
                      <option value="01:00 AM">01:00 AM</option>
                      <option value="02:00 AM">02:00 AM</option>
                      <option value="03:00 AM">03:00 AM</option>
                      <option value="04:00 AM">04:00 AM</option>
                      <option value="05:00 AM">05:00 AM</option>
                      <option value="06:00 AM">06:00 AM</option>
                      <option value="07:00 AM">07:00 AM</option>
                      <option value="08:00 AM">08:00 AM</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                      <option value="05:00 PM">05:00 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                      <option value="07:00 PM">07:00 PM</option>
                      <option value="08:00 PM">08:00 PM</option>
                      <option value="09:00 PM">09:00 PM</option>
                      <option value="10:00 PM">10:00 PM</option>
                      <option value="11:00 PM">11:00 PM</option>
                    </select>
                    <span className="text-gray-500 font-medium">to</span>
                    <select
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                        formErrors.timeRange 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    >
                      <option value="01:00 AM">01:00 AM</option>
                      <option value="02:00 AM">02:00 AM</option>
                      <option value="03:00 AM">03:00 AM</option>
                      <option value="04:00 AM">04:00 AM</option>
                      <option value="05:00 AM">05:00 AM</option>
                      <option value="06:00 AM">06:00 AM</option>
                      <option value="07:00 AM">07:00 AM</option>
                      <option value="08:00 AM">08:00 AM</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                      <option value="05:00 PM">05:00 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                      <option value="07:00 PM">07:00 PM</option>
                      <option value="08:00 PM">08:00 PM</option>
                      <option value="09:00 PM">09:00 PM</option>
                      <option value="10:00 PM">10:00 PM</option>
                      <option value="11:00 PM">11:00 PM</option>
                      <option value="11:59 PM">11:59 PM</option>
                    </select>
                  </div>
                  {formErrors.timeRange && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.timeRange}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  {!selectedDate && (
                    <p className="mb-3 text-sm text-red-600 text-center">
                      Please select a date from the calendar above
                    </p>
                  )}
                  <Button
                    onClick={handleSubmitBooking}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
                    disabled={!selectedDate || isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Request Booking'
                    )}
                  </Button>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    * Required fields. Your booking request will be sent to the service provider for confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}