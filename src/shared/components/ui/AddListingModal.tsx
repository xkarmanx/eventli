'use client'

import { useState, useEffect, useRef } from 'react'
// kvs: Removed react-toastify imports and replaced with sonner for consistent toast implementation
import { toast } from 'sonner'
import { X, Upload, Trash2, Tag } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { createListing, uploadListingMedia, insertListingMedia, addListingTags, setListingType, addKeywordTags } from "@/features/services/listing_crud";
// kvs: Removed deprecated useSession import from @supabase/auth-helpers-react
// kvs: Added createClient import for proper Supabase client usage
import { createClient } from '@/shared/lib/supabase/client'
import { ModerationError, RateLimitError } from '@/shared/lib/moderation-errors';
import Image from "next/image";
import { validateFilesClientSide, getMediaLimitsText, MEDIA_LIMITS } from '@/shared/lib/mediaValidation';

// JC: Define what props this modal needs to work
interface AddListingModalProps {
  isOpen: boolean
  onClose: () => void
}

// Service types for the type selection
const serviceTypes = [
  { value: 'venue', label: 'Venue' },
  { value: 'music', label: 'Music' },
  { value: 'catering', label: 'Catering' },
  { value: 'funeral', label: 'Funeral' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'baby_shower', label: 'Baby Shower' },
  { value: 'other', label: 'Other' }
] as const;

type ServiceType = typeof serviceTypes[number]['value'];

// JC: Available event types for dropdowns
const eventTypes = [
  "Birthday",
  "Wedding",
  "Corporate",
  "Funeral",
  "Other"
]

// JC: Available serving styles for dropdowns
const servingStyles = [
  "Buffet",
  "Plated",
  "Cocktail",
  "Family Style"
]

// JC: Clean up user input to prevent XSS attacks
function sanitizeText(text: string) {
  return text.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export default function AddListingModal({ isOpen, onClose }: AddListingModalProps) {
  // Service type state (first step)
  const [serviceType, setServiceType] = useState<ServiceType | ''>('')
  const [customTypeLabel, setCustomTypeLabel] = useState('')
  
  // JC: Form state variables to store user input
  const [title, setTitle] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [servingStyle, setServingStyle] = useState('')
  const [numStaff, setNumStaff] = useState('')
  const [numGuests, setNumGuests] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [description, setDescription] = useState('')

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [cancelConfirmation, setCancelConfirmation] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // kvs: Replaced useSession() with proper Supabase auth state management
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // kvs: Added proper Supabase auth state management
  useEffect(() => {
    const supabase = createClient();
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
        } else {
          setUser(session?.user || null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setAuthLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
      setServiceType('')
      setCustomTypeLabel('')
      setTitle('')
      setCity('')
      setAddress('')
      setPriceRange('')
      setServingStyle('')
      setNumStaff('')
      setNumGuests('')
      setFiles([])
      setPreviews([])
      setTagInput('')
      setTags([])
      setDescription('')
      setErrors({})
    }
  }, [isOpen])

  if (!isOpen) return null

  // kvs: Added authentication checks to prevent unauthorized access
  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center text-red-600">Please log in to access this feature.</div>
          <div className="flex justify-center mt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    );
  }

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    if (selectedFiles.length === 0) return
    
    // Use centralized validation for immediate feedback
    const validationResults = validateFilesClientSide(selectedFiles);
    
    // Check for validation errors
    for (const result of validationResults) {
      if (!result.isValid) {
        toast.error(result.error);
        return;
      }
    }
    
    // Count current files by type
    let currentImageCount = files.filter(f => f.type.startsWith('image/')).length;
    let currentVideoCount = files.filter(f => f.type.startsWith('video/')).length;
    
    // Count new files by type
    let newImageCount = selectedFiles.filter(f => f.type.startsWith('image/')).length;
    let newVideoCount = selectedFiles.filter(f => f.type.startsWith('video/')).length;
    
    // Check total limits
    if (currentImageCount + newImageCount > MEDIA_LIMITS.MAX_IMAGES_PER_LISTING) {
      toast.error(`Maximum ${MEDIA_LIMITS.MAX_IMAGES_PER_LISTING} images allowed per listing`);
      return;
    }
    
    if (currentVideoCount + newVideoCount > MEDIA_LIMITS.MAX_VIDEOS_PER_LISTING) {
      toast.error(`Maximum ${MEDIA_LIMITS.MAX_VIDEOS_PER_LISTING} videos allowed per listing`);
      return;
    }
    
    // Add files and create previews
    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);
    
    // Create previews for new files
    const newPreviews = [...previews];
    selectedFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        newPreviews.push(URL.createObjectURL(file));
      } else {
        newPreviews.push(''); // No preview for videos, we'll show a video icon
      }
    });
    setPreviews(newPreviews);
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // Clean up preview URL to prevent memory leaks
    if (previews[index]) {
      URL.revokeObjectURL(previews[index]);
    }
    
    setFiles(newFiles);
    setPreviews(newPreviews);
  }

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    } else if (tags.length >= 10) {
      toast.error("Maximum 10 tags allowed");
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  }

  const validate = () => {
    const newErrors: {[key: string]: string} = {}
    if (!serviceType) newErrors.serviceType = "Service type is required"
    if (serviceType === 'other' && (!customTypeLabel.trim() || customTypeLabel.trim().length < 2 || customTypeLabel.trim().length > 40)) {
      newErrors.customTypeLabel = "Custom label must be between 2-40 characters"
    }
    if (!title.trim()) newErrors.title = "Title is required"
    if (!city.trim()) newErrors.city = "City is required"
    if (!address.trim()) newErrors.address = "Address is required"
    if (!priceRange || isNaN(Number(priceRange)) || Number(priceRange) < 1) newErrors.priceRange = "Valid price range is required"
    if (!servingStyle) newErrors.servingStyle = "Serving style is required"
    if (!numStaff || isNaN(Number(numStaff)) || Number(numStaff) < 1) newErrors.numStaff = "Valid number of staff is required"
    if (!numGuests || isNaN(Number(numGuests)) || Number(numGuests) < 1) newErrors.numGuests = "Valid number of guests is required"
    if (files.length === 0) newErrors.files = "At least one image or video is required"
    if (!description.trim()) newErrors.description = "Description is required"
    if (description.length > 500) newErrors.description = "Description must be 500 characters or less"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleConfirmClose = () => {
    if (
      serviceType ||
      customTypeLabel ||
      title ||
      city ||
      address ||
      priceRange ||
      servingStyle ||
      numStaff ||
      numGuests ||
      files.length > 0 ||
      tags.length > 0 ||
      description
    ) 
    {
      setCancelConfirmation(true);
    }
    else {
      onClose();
    }
  }

  // JC: Handle clicking outside the modal to close it I removed it by accident
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleConfirmClose();
    }
  }

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleConfirmClose()
  }

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  // kvs: Updated to use user state instead of session?.user?.id
  if (!user?.id) {
    // kvs: Replaced alert with sonner toast for consistent error messaging
    toast.error("User not logged in");
    return;
  }

  setSubmitError(null);

  if (!validate()) return;
  setLoading(true);
  setSubmitting(true);

  try {
    // 1. Create the listing first
    const listingData = {
      // kvs: Updated to use user.id instead of session.user.id
      seller_id: user.id,
      title,
      description,
      price: Number(priceRange),
      location: `${city}, ${address}`,
      serving_style: servingStyle,
      num_staff: Number(numStaff),
      num_guests: Number(numGuests),
    };
    console.log("listingData", listingData);
    const createdListing = await createListing(listingData);

    // 2. Set the listing type (required step)
    if (createdListing.id) {
      await setListingType(createdListing.id, {
        service_type: serviceType as ServiceType,
        custom_label: serviceType === 'other' ? customTypeLabel : undefined
      });
    }

    // 3. Upload media files if any
    if (files.length > 0 && createdListing.id) {
      const mediaRecords = await uploadListingMedia(files, createdListing.id);
      await insertListingMedia(createdListing.id, mediaRecords);
    }

    // 4. Add keyword tags if any (normalized in component)
    if (tags.length > 0 && createdListing.id) {
      await addKeywordTags(createdListing.id, tags);
    }

    onClose();
    // kvs: Replaced react-toastify with sonner toast for consistent success messaging
    toast.success("Listing created successfully!");
  } 
  catch (err: any) {
    // Enhanced error handling for moderation and other issues
    if (err instanceof ModerationError) {
      const fieldContext = err.context?.split('.').pop() || 'content';
      const fieldName = fieldContext.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      if (err.categories && err.categories.length > 0) {
        const categories = err.categories.join(', ');
        const isFallbackFilter = err.message?.includes('fallback filter');
        
        if (isFallbackFilter) {
          setSubmitError(`${fieldName} contains inappropriate language. Please use professional language only.`);
          toast.error(`🛡️ ${fieldName} blocked by content filter`, {
            description: `Inappropriate language detected. Please use professional language and try again.`,
            duration: 6000,
          });
        } else {
          setSubmitError(`${fieldName} contains inappropriate content (${categories}). Please review and modify your content.`);
          toast.error(`❌ ${fieldName} flagged for inappropriate content`, {
            description: `Categories: ${categories}. Please revise your content and try again.`,
            duration: 6000,
          });
        }
      } else {
        setSubmitError(`${fieldName} contains inappropriate content. Please review and modify your content.`);
        toast.error(`❌ ${fieldName} contains inappropriate content`, {
          description: 'Please review and modify your content before submitting.',
          duration: 5000,
        });
      }
    } else if (err instanceof RateLimitError) {
      setSubmitError("Content moderation is temporarily busy. Please try again in a moment.");
      toast.error("⏳ Moderation service busy", {
        description: "Please wait a moment and try again.",
        duration: 4000,
      });
    } else if (err.message?.includes('Content moderation')) {
      setSubmitError("Content moderation failed. Please review your content and try again.");
      toast.error("🛡️ Content review failed", {
        description: "Please review your content and try again.",
        duration: 5000,
      });
    } else {
      setSubmitError(err.message || "Failed to create listing.");
      toast.error(err.message || "Failed to create listing");
    }
  } 
  finally {
    setLoading(false);
    setSubmitting(false);
  }
}

  return (
    <div
      className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      <div className="bg-white shadow-2xl w-full max-w-lg max-h-[90vh] relative transform transition-all duration-300 scale-100 flex flex-col rounded-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleCancelClick}
          className="cursor-pointer absolute top-4 right-4 p-2 text-teal-600 hover:text-white hover:bg-teal-700 rounded-full transition-colors z-10 bg-white border border-gray-300 shadow"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Scrollable Content */}
        <div className="overflow-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
        {/* Modal Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6">Add a Listing</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Service Type Selection - First Step */}
            <div>
              <label className="block font-medium mb-2">
                Service Type<span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {serviceTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setServiceType(type.value)}
                    className={`p-3 text-sm rounded-lg border-2 transition-all duration-200 ${
                      serviceType === type.value
                        ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                    disabled={submitting}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              
              {serviceType === 'other' && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Enter custom service type (2-40 characters)"
                    value={customTypeLabel}
                    onChange={(e) => setCustomTypeLabel(e.target.value)}
                    maxLength={40}
                    className={`w-full border ${errors.customTypeLabel ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:border-teal-500`}
                    disabled={submitting}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {customTypeLabel.length}/40 characters
                  </div>
                </div>
              )}
              
              {(errors.serviceType || errors.customTypeLabel) && (
                <div className="text-sm text-red-600 mt-1">
                  {errors.serviceType || errors.customTypeLabel}
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1" htmlFor="listing-title">
                Title<span className="text-red-500">*</span>
              </label>
              <input
                id="listing-title"
                type="text"
                maxLength={60}
                value={title}
                onChange={e => setTitle(e.target.value)}
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
                  onChange={e => setAddress(e.target.value)}
                  required
                  className={`w-full border ${errors.address ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 focus:outline-none focus:border-teal-500`}
                />
                {errors.address && <div className="text-sm text-red-600 mt-1">{errors.address}</div>}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block font-medium mb-1" htmlFor="listing-price">
                  Price Range ($)<span className="text-red-500">*</span>
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
              <label className="block font-medium mb-1" htmlFor="listing-files">
                Media Files<span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <div className="flex gap-4 items-center">
                  <input
                    id="listing-files"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFilesChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                    disabled={submitting}
                  >
                    <Upload className="w-4 h-4" />
                    {files.length > 0 ? "Add More Files" : "Upload Files"}
                  </Button>
                  <span className="text-sm text-gray-500">
                    {getMediaLimitsText()}
                  </span>
                </div>
                
                {/* File previews */}
                {files.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {files.map((file, index) => (
                      <div key={index} className="relative group">
                        {file.type.startsWith('image/') ? (
                          <Image 
                            src={previews[index]} 
                            alt={`Preview ${index + 1}`} 
                            width={80}
                            height={80}
                            className="w-full h-20 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center">
                            <span className="text-xs text-gray-600 text-center">
                              📹 {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={submitting}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.files && <div className="text-sm text-red-600 mt-1">{errors.files}</div>}
            </div>

            {/* Tags Section */}
            <div>
              <label className="block font-medium mb-1" htmlFor="listing-tags">
                Tags (Optional)
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    id="listing-tags"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagInputKeyPress}
                    placeholder="Add tags (press Enter or comma to add)"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-teal-500"
                    disabled={submitting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    className="flex items-center gap-2"
                    disabled={submitting || !tagInput.trim() || tags.length >= 10}
                  >
                    <Tag className="w-4 h-4" />
                    Add
                  </Button>
                </div>
                
                {/* Tag chips */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-teal-500 hover:text-teal-700"
                          disabled={submitting}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {tags.length}/10 tags
                </div>
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1" htmlFor="listing-description">
                Description<span className="text-red-500">*</span>
              </label>
              <textarea
                id="listing-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
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
                onClick={handleConfirmClose}
                className="cursor-pointer border border-gray-300 hover:bg-teal-700 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="default"
                className="cursor-pointer bg-teal-50 text-teal-700 border border-gray-300 hover:bg-teal-700 hover:border-teal-700 hover:text-white transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                disabled={loading || submitting}
              >
                {submitting ? "Creating..." : "Add Listing"}
              </Button>
            </div>
            {submitError && <div className="text-sm text-red-600 mt-2">{submitError}</div>}
          </form>
        </div>
        {/* Cancel Confirmation Pop-up */}
        {cancelConfirmation && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-xs w-full flex flex-col items-center">
              <div className="font-semibold mb-2 text-center">
                You have unsaved changes.<br />Are you sure you want to close?
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  className="cursor-pointer border border-gray-200 hover:bg-teal-700 hover:text-white" 
                  variant="secondary" 
                  onClick={() => setCancelConfirmation(false)}
                  >
                  No
                </Button>
                <Button 
                  className="cursor-pointer bg-red-50 text-red-600 border-red-300 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md" 
                  variant="destructive" 
                  onClick={() => { setCancelConfirmation(false); 
                  onClose(); }}
                  >
                  Yes
                </Button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}