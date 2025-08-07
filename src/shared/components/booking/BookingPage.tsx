'use client'

import { ArrowLeft, Calendar, Clock, Mail, MapPin, Phone, User, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Service } from '@/shared/types/service'

type Props = {
  service: Service
}

export default function BookingPage({ service }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventTime: '',
    guestCount: '',
    eventType: '',
    additionalNotes: ''
  })

  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventTime: '',
    guestCount: '',
    eventType: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email) return 'Email is required'
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    return ''
  }

  const validatePhone = (phone: string): string => {
    if (!phone) return 'Phone number is required'
    const digitsOnly = phone.replace(/\D/g, '')
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return 'Please enter a valid phone number (10-15 digits)'
    }
    return ''
  }

  const validateName = (name: string): string => {
    if (!name.trim()) return 'Full name is required'
    if (name.trim().length < 2) return 'Name must be at least 2 characters'
    if (name.trim().length > 100) return 'Name must be less than 100 characters'
    const nameRegex = /^[a-zA-Z\s'-]+$/
    if (!nameRegex.test(name.trim())) return 'Name can only contain letters, spaces, hyphens, and apostrophes'
    return ''
  }

  const validateEventDate = (date: string): string => {
    if (!date) return 'Event date is required'
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) return 'Event date cannot be in the past'

    // Check if date is more than 2 years in the future
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 2)
    if (selectedDate > maxDate) return 'Event date cannot be more than 2 years in the future'

    return ''
  }

  const validateEventTime = (time: string): string => {
    if (!time) return 'Event time is required'
    return ''
  }

  const validateGuestCount = (count: string): string => {
    if (!count) return 'Number of guests is required'
    const num = parseInt(count)
    if (isNaN(num) || num < 1) return 'Guest count must be at least 1'
    if (num > 10000) return 'Guest count seems too high. Please contact us directly for large events'
    return ''
  }

  const validateEventType = (type: string): string => {
    if (!type) return 'Event type is required'
    return ''
  }

  const validateForm = (): boolean => {
    const errors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      eventDate: validateEventDate(formData.eventDate),
      eventTime: validateEventTime(formData.eventTime),
      guestCount: validateGuestCount(formData.guestCount),
      eventType: validateEventType(formData.eventType)
    }

    setFormErrors(errors)
    return Object.values(errors).every(error => error === '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Implement actual booking submission logic
      console.log('Booking request:', {
        service: service.id,
        ...formData,
        // Clean up phone number
        phone: formData.phone.replace(/\D/g, '')
      })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Show success message or redirect
      alert('Booking request submitted successfully!')

    } catch (error) {
      console.error('Error submitting booking:', error)
      alert('Error submitting booking request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header with Back Button */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <Link href={`/listing/${service.id}`} className="mr-3">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">
          Book Service
        </h1>
      </div>

      {/* Service Summary */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
            <Image
              src={service.image}
              alt={service.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">{service.title}</h2>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{service.location}</span>
            </div>
            <p className="text-teal-600 font-semibold mt-1">{service.price}</p>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6 pb-24">
        {/* Personal Information */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  formErrors.name
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-teal-500'
                }`}
                placeholder="Enter your full name"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  formErrors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-teal-500'
                }`}
                placeholder="your.email@example.com"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  formErrors.phone
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-teal-500'
                }`}
                placeholder="(555) 123-4567"
              />
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Event Date *
              </label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  formErrors.eventDate
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-teal-500'
                }`}
              />
              {formErrors.eventDate && (
                <p className="mt-1 text-sm text-red-600">{formErrors.eventDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Event Time *
              </label>
              <input
                type="time"
                name="eventTime"
                value={formData.eventTime}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  formErrors.eventTime
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-teal-500'
                }`}
              />
              {formErrors.eventTime && (
                <p className="mt-1 text-sm text-red-600">{formErrors.eventTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Number of Guests *
              </label>
              <input
                type="number"
                name="guestCount"
                value={formData.guestCount}
                onChange={handleInputChange}
                min="1"
                max="10000"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  formErrors.guestCount
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-teal-500'
                }`}
                placeholder="Enter number of guests"
              />
              {formErrors.guestCount && (
                <p className="mt-1 text-sm text-red-600">{formErrors.guestCount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  formErrors.eventType
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-teal-500'
                }`}
              >
                <option value="">Select event type</option>
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday Party</option>
                <option value="ceremony">Ceremony</option>
                <option value="funeral">Funeral</option>
                <option value="corporate">Corporate Event</option>
                <option value="other">Other</option>
              </select>
              {formErrors.eventType && (
                <p className="mt-1 text-sm text-red-600">{formErrors.eventType}</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests or Notes
            </label>
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Tell us about any special requirements, dietary restrictions, or other details..."
            />
          </div>
        </div>
      </form>

      {/* Fixed Bottom Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <Button
          type="submit"
          disabled={isSubmitting}
          onClick={handleSubmit}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Submitting...
            </div>
          ) : (
            'Submit Booking Request'
          )}
        </Button>
        <p className="mt-2 text-xs text-gray-500 text-center">
          * Required fields. Your booking request will be sent to the service provider for confirmation.
        </p>
      </div>
    </div>
  )
}
