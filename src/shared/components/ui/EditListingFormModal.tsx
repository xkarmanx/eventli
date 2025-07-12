"use client"

import { useState, useEffect, useRef } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { updateListing, uploadListingImage } from "@/features/services/listing_crud";
// kvs: Removed deprecated useSession import from @supabase/auth-helpers-react
// kvs: Replaced react-toastify with sonner for consistent toast implementation across the app
import { toast } from 'sonner';
// kvs: Added createClient import for proper Supabase client usage
import { createClient } from '@/shared/lib/supabase/client'

// JC: Define what props this edit modal needs
interface EditListingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: any;
  onUpdated: (updatedListing: any) => void;
}

// JC: Available event types for editing
const eventTypes = [
  "Birthday",
  "Wedding",
  "Corporate",
  "Concert",
  "Other",
];

// JC: Available serving styles for editing
const servingStyles = [
  "Buffet",
  "Plated",
  "Cocktail",
  "Family Style",
];

// JC: Sanitize user input for security
function sanitizeText(text: string) {
  return text.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function EditListingFormModal({ isOpen, onClose, listing, onUpdated }: EditListingFormModalProps) {
  // JC: Pre-populate form fields with existing listing data
  const [title, setTitle] = useState(listing.title || "");
  const [city, setCity] = useState(listing.location?.split(", ")[0] || "");
  const [address, setAddress] = useState(listing.location?.split(", ")[1] || "");
  const [priceRange, setPriceRange] = useState(listing.price?.toString() || "");
  const [eventType, setEventType] = useState(listing.event_type || "");
  const [customEventType, setCustomEventType] = useState(eventTypes.includes(listing.event_type) ? "" : listing.event_type || "");
  const [servingStyle, setServingStyle] = useState(listing.serving_style || "");
  const [numStaff, setNumStaff] = useState(listing.num_staff?.toString() || "");
  const [numGuests, setNumGuests] = useState(listing.num_guests?.toString() || "");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(listing.image_url || null);
  const [description, setDescription] = useState(listing.description || "");

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [cancelConfirmation, setCancelConfirmation] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
    if (!isOpen) return;
    setTitle(listing.title || "");
    setCity(listing.location?.split(", ")[0] || "");
    setAddress(listing.location?.split(", ")[1] || "");
    setPriceRange(listing.price?.toString() || "");
    setEventType(listing.event_type || "");
    setCustomEventType(eventTypes.includes(listing.event_type) ? "" : listing.event_type || "");
    setServingStyle(listing.serving_style || "");
    setNumStaff(listing.num_staff?.toString() || "");
    setNumGuests(listing.num_guests?.toString() || "");
    setImage(null);
    setImagePreview(listing.image_url || null);
    setDescription(listing.description || "");
    setErrors({});
  }, [isOpen, listing]);

  if (!isOpen) return null;

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } 
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!address.trim()) newErrors.address = "Address is required";
    if (!priceRange || isNaN(Number(priceRange)) || Number(priceRange) < 1) newErrors.priceRange = "Valid price range is required";
    if (!eventType) newErrors.eventType = "Event type is required";
    if (eventType === "Other" && !customEventType.trim()) newErrors.customEventType = "Please specify the event type";
    if (!servingStyle) newErrors.servingStyle = "Serving style is required";
    if (!numStaff || isNaN(Number(numStaff)) || Number(numStaff) < 1) newErrors.numStaff = "Valid number of staff is required";
    if (!numGuests || isNaN(Number(numGuests)) || Number(numGuests) < 1) newErrors.numGuests = "Valid number of guests is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (description.length > 500) newErrors.description = "Description must be 500 characters or less";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmClose = () => {
    const hasChanged =
        title !== (listing.title || "") ||
        city !== (listing.location?.split(", ")[0] || "") ||
        address !== (listing.location?.split(", ")[1] || "") ||
        priceRange !== (listing.price?.toString() || "") ||
        eventType !== (listing.event_type || "") ||
        (eventType === "Other"
        ? customEventType !== (eventTypes.includes(listing.event_type) ? "" : listing.event_type || "")
        : false) ||
        servingStyle !== (listing.serving_style || "") ||
        numStaff !== (listing.num_staff?.toString() || "") ||
        numGuests !== (listing.num_guests?.toString() || "") ||
        description !== (listing.description || "") ||
        image !== null;

    if (hasChanged) {
      setCancelConfirmation(true);
    }
    else {
      onClose();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // kvs: Added user authentication check for form submission
    if (!user?.id) {
      // kvs: Replaced alert with sonner toast for consistent error messaging
      toast.error("User not logged in");
      return;
    }

    setSubmitError(null);

    if (!validate()) return;
    setLoading(true);

    try {
      const updates: any = {
        title,
        description,
        price: Number(priceRange),
        location: `${city}, ${address}`,
        event_type: eventType === "Other" ? customEventType : eventType,
        serving_style: servingStyle,
        num_staff: Number(numStaff),
        num_guests: Number(numGuests),
      };
      if (image) {
        const imageUrl = await uploadListingImage(image, listing.id);
        updates.image_url = imageUrl;
      }
      const updated = await updateListing(listing.id, updates);
      // kvs: Replaced react-toastify with sonner toast for consistent success messaging
      toast.success("Listing updated successfully!");
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to update listing.");
      // kvs: Added sonner toast for error messaging consistency
      toast.error(err.message || "Failed to update listing");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto relative transform transition-all duration-300 scale-100">
        {/* Close Button */}
        <button
          onClick={handleConfirmClose}
          className="cursor-pointer absolute top-4 right-4 p-2 text-teal-600 hover:text-white hover:bg-teal-700 rounded-full transition-colors z-10 bg-white border border-gray-200 shadow"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
        {/* Modal Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6">Edit Listing</h2>
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
                Image
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
                className="cursor-pointer bg-teal-50 text-teal-700 border-teal-700 hover:bg-teal-700 hover:border-teal-700 hover:text-white transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
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
                  className="cursor-pointer border border-gray-300 hover:bg-teal-700 hover:text-white" 
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
  );
}