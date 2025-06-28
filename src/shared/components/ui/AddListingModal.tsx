'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Upload } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { createListing, uploadListingImage, updateListing } from "@/features/services/listing_crud";
import { useSession } from "@supabase/auth-helpers-react"

interface AddListingModalProps {
  isOpen: boolean
  onClose: () => void
}

const eventTypes = [
  "Birthday",
  "Wedding",
  "Corporate",
  "Concert",
  "Other"
]

const servingStyles = [
  "Buffet",
  "Plated",
  "Cocktail",
  "Family Style"
]

function sanitizeText(text: string) {
  return text.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export default function AddListingModal({ isOpen, onClose }: AddListingModalProps) {
  const [title, setTitle] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [eventType, setEventType] = useState('')
  const [customEventType, setCustomEventType] = useState('')
  const [servingStyle, setServingStyle] = useState('')
  const [numStaff, setNumStaff] = useState('')
  const [numGuests, setNumGuests] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [description, setDescription] = useState('')

  const [loading, setLoading] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const session = useSession();

  useEffect(() => {
    if (!isOpen) return
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  useEffect(() => {
    // Reset form when modal closes
    if (!isOpen) {
      setTitle('')
      setCity('')
      setAddress('')
      setPriceRange('')
      setEventType('')
      setCustomEventType('')
      setServingStyle('')
      setNumStaff('')
      setNumGuests('')
      setImage(null)
      setImagePreview(null)
      setDescription('')
      setErrors({})
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.type.startsWith("image/"))) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    } else {
      setImage(null)
      setImagePreview(null)
    }
  }

  const validate = () => {
    const newErrors: {[key: string]: string} = {}
    if (!title.trim()) newErrors.title = "Title is required"
    if (!city.trim()) newErrors.city = "City is required"
    if (!address.trim()) newErrors.address = "Address is required"
    if (!priceRange || isNaN(Number(priceRange)) || Number(priceRange) < 1) newErrors.priceRange = "Valid price range is required"
    if (!eventType) newErrors.eventType = "Event type is required"
    if (eventType === "Other" && !customEventType.trim()) newErrors.customEventType = "Please specify the event type"
    if (!servingStyle) newErrors.servingStyle = "Serving style is required"
    if (!numStaff || isNaN(Number(numStaff)) || Number(numStaff) < 1) newErrors.numStaff = "Valid number of staff is required"
    if (!numGuests || isNaN(Number(numGuests)) || Number(numGuests) < 1) newErrors.numGuests = "Valid number of guests is required"
    if (!image) newErrors.image = "Image is required"
    if (!description.trim()) newErrors.description = "Description is required"
    if (description.length > 500) newErrors.description = "Description must be 500 characters or less"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  //Checking if user is logged in
  if (!session?.user?.id) {
    alert("User not logged in.");
    return;
  }

  setSubmitError(null);

  if (!validate()) return;
  setLoading(true);

  try {
    // 1. Create the listing without image_url to get the id
    const listingData = {
      seller_id: session?.user.id,
      title,
      description,
      price: Number(priceRange),
      location: `${city}, ${address}`,
      event_type: eventType === "Other" ? customEventType : eventType,
      serving_style: servingStyle,
      num_staff: Number(numStaff),
      num_guests: Number(numGuests),
    };
    console.log("listingData", listingData);
    const createdListing = await createListing(listingData);

    // 2. Upload image and update listing with image_url
    if (image && createdListing.id) {
      const imageUrl = await uploadListingImage(image, createdListing.id);
      await updateListing(createdListing.id, { image_url: imageUrl });
    }

    onClose();
  } 
  catch (err: any) {
    setSubmitError(err.message || "Failed to create listing.");
  } 
  finally {
    setLoading(false);
  }
}

  return (
    <div
      className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto relative transform transition-all duration-300 scale-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10 bg-white shadow"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
        {/* Modal Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6">Add a Listing</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-medium mb-1" htmlFor="listing-title">
                Title<span className="text-red-500">*</span>
              </label>
              <input
                id="listing-title"
                type="text"
                maxLength={60}
                value={title}
                onChange={e => setTitle(sanitizeText(e.target.value))}
                required
                className={`w-full border ${errors.title ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:border-teal-500`}
              />
              {errors.title && <div className="text-sm text-red-600 mt-1">{errors.title}</div>}
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block font-medium mb-1" htmlFor="listing-city">
                  City<span className="text-red-500">*</span>
                </label>
                <input
                  id="listing-city"
                  type="text"
                  value={city}
                  onChange={e => setCity(sanitizeText(e.target.value))}
                  required
                  className={`w-full border ${errors.city ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:border-teal-500`}
                />
                {errors.city && <div className="text-sm text-red-600 mt-1">{errors.city}</div>}
              </div>
              <div className="w-1/2">
                <label className="block font-medium mb-1" htmlFor="listing-address">
                  Address<span className="text-red-500">*</span>
                </label>
                <input
                  id="listing-address"
                  type="text"
                  value={address}
                  onChange={e => setAddress(sanitizeText(e.target.value))}
                  required
                  className={`w-full border ${errors.address ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:border-teal-500`}
                />
                {errors.address && <div className="text-sm text-red-600 mt-1">{errors.address}</div>}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block font-medium mb-1" htmlFor="listing-price">
                  Price Range (₱)<span className="text-red-500">*</span>
                </label>
                <input
                  id="listing-price"
                  type="number"
                  min={1}
                  step="any"
                  value={priceRange}
                  onChange={e => setPriceRange(e.target.value.replace(/[^0-9.]/g, ''))}
                  required
                  inputMode="decimal"
                  pattern="[0-9]*"
                  placeholder="e.g. 5000"
                  className={`w-full border ${errors.priceRange ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:border-teal-500`}
                />
                {errors.priceRange && <div className="text-sm text-red-600 mt-1">{errors.priceRange}</div>}
              </div>
              <div className="w-1/2">
                <label className="block font-medium mb-1" htmlFor="listing-event-type">
                  Event Type<span className="text-red-500">*</span>
                </label>
                <select
                  id="listing-event-type"
                  value={eventType}
                  onChange={e => setEventType(e.target.value)}
                  required
                  className={`w-full border ${errors.eventType ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 bg-white focus:outline-none focus:border-teal-500`}
                >
                  <option value="">Select</option>
                  {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {eventType === "Other" && (
                  <input
                    type="text"
                    placeholder="Please specify"
                    value={customEventType}
                    onChange={e => setCustomEventType(sanitizeText(e.target.value))}
                    className={`mt-2 w-full border ${errors.customEventType ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:border-teal-500`}
                  />
                )}
                {(errors.eventType || errors.customEventType) && (
                  <div className="text-sm text-red-600 mt-1">
                    {errors.eventType || errors.customEventType}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block font-medium mb-1" htmlFor="listing-serving-style">
                  Serving Style<span className="text-red-500">*</span>
                </label>
                <select
                  id="listing-serving-style"
                  value={servingStyle}
                  onChange={e => setServingStyle(e.target.value)}
                  required
                  className={`w-full border ${errors.servingStyle ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 bg-white focus:outline-none focus:border-teal-500`}
                >
                  <option value="">Select</option>
                  {servingStyles.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.servingStyle && <div className="text-sm text-red-600 mt-1">{errors.servingStyle}</div>}
              </div>
              <div className="w-1/2 flex gap-4">
                <div className="w-1/2">
                  <label className="block font-medium mb-1" htmlFor="listing-staff">
                    Staff<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="listing-staff"
                    type="number"
                    min={1}
                    value={numStaff}
                    onChange={e => setNumStaff(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                    className={`w-full border ${errors.numStaff ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:border-teal-500`}
                  />
                  {errors.numStaff && <div className="text-sm text-red-600 mt-1">{errors.numStaff}</div>}
                </div>
                <div className="w-1/2">
                  <label className="block font-medium mb-1" htmlFor="listing-guests">
                    Guests<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="listing-guests"
                    type="number"
                    min={1}
                    value={numGuests}
                    onChange={e => setNumGuests(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                    className={`w-full border ${errors.numGuests ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:border-teal-500`}
                  />
                  {errors.numGuests && <div className="text-sm text-red-600 mt-1">{errors.numGuests}</div>}
                </div>
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1" htmlFor="listing-image">
                Image<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4 items-center">
                <input
                  id="listing-image"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {image ? "Change Image" : "Upload Image"}
                </Button>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                )}
              </div>
              {errors.image && <div className="text-sm text-red-600 mt-1">{errors.image}</div>}
            </div>
            <div>
              <label className="block font-medium mb-1" htmlFor="listing-description">
                Description<span className="text-red-500">*</span>
              </label>
              <textarea
                id="listing-description"
                value={description}
                onChange={e => setDescription(sanitizeText(e.target.value))}
                rows={4}
                maxLength={500}
                required
                className={`w-full border ${errors.description ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:border-teal-500`}
              />
              <div className="text-xs text-gray-400 text-right">{description.length}/500</div>
              {errors.description && <div className="text-sm text-red-600 mt-1">{errors.description}</div>}
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={onClose}
                className="border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="default"
                className="border border-gray-300 hover:bg-gray-100"
              >
                Add Listing
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}