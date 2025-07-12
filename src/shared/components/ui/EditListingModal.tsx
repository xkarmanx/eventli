'use client'

import { useEffect, useState } from 'react'
import { X, Edit } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { getListings } from '@/features/services/listing_crud'
import EditListingFormModal from "@/shared/components/ui/EditListingFormModal";
import { createClient } from '@/shared/lib/supabase/client' // JC: Get user data from database

// JC: Define what props this modal needs
interface EditListingModalProps {
  isOpen: boolean
  onClose: () => void
  listing?: any // JC: Optional listing to edit directly (when called from card)
  onUpdate?: (updatedListing: any) => void // JC: Callback to update parent state
}

export default function EditListingModal({ isOpen, onClose, listing, onUpdate }: EditListingModalProps) {
  // JC: State to store user listings and selected listing for editing
  const [listings, setListings] = useState<any[]>([]);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // JC: If listing is provided directly, skip the selection interface
  const directEditMode = !!listing;

  // JC: Handle direct edit mode - when listing is provided, go straight to edit form
  useEffect(() => {
    if (directEditMode && listing && isOpen) {
      setEditTarget(listing);
    }
  }, [directEditMode, listing, isOpen]);

  // JC: Get user login info when modal opens
  useEffect(() => {
    const supabase = createClient();
    
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

  // JC: Get user listings when modal opens and user is logged in
  useEffect(() => {
    if (isOpen && user?.id && !authLoading) {
      setFetchError(null);
      getListings(user.id)
        .then(setListings)
        .catch(err => {
          setFetchError(err.message || "Failed to fetch listings.");
          setListings([]);
        });
    }
  }, [isOpen, user?.id, authLoading]);

  // JC: Handle escape key and prevent body scroll when modal is open
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

  if (!isOpen) return null

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
    {!directEditMode && (
    <div
      className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto relative transform transition-all duration-300 scale-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 p-2 text-teal-600 hover:text-white hover:bg-teal-700 rounded-full transition-colors z-10 bg-white border border-gray-300 shadow"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
        {/* Modal Content */}
        <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">Edit a Listing</h2>
              {fetchError && (
                <div className="mb-4 p-3 rounded bg-red-100 text-red-800 text-center font-medium">
                  {fetchError}
                </div>
              )}
              <div className="space-y-6">
                {listings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-6">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <Edit className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No listings yet</h3>
                    <p className="text-gray-500 text-center max-w-sm">
                      You haven't created any listings yet. Create your first listing to get started!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {listings.map(listing => (
                      <div 
                        key={listing.id} 
                        onClick={() => setEditTarget(listing)}
                        className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-teal-700 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer"
                      >
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="relative overflow-hidden">
                            <img 
                              src={listing.image_url} 
                              alt={listing.title} 
                              className="w-full sm:w-32 sm:h-32 h-48 object-cover transition-transform duration-300 group-hover:scale-105" 
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-bold text-lg text-gray-800 truncate pr-2 group-hover:text-teal-700 transition-colors duration-200">
                                {listing.title}
                              </h3>
                              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="w-2 h-2 bg-teal-700 rounded-full animate-pulse"></div>
                              </div>
                            </div>
                            
                            {listing.description && (
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {listing.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              {listing.price && (
                                <div className="text-lg font-semibold text-teal-700">
                                  ${listing.price}
                                </div>
                              )}
                              
                              <Button
                                variant="default"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditTarget(listing);
                                }}
                                className="cursor-pointer bg-teal-50 text-teal-700 border-teal-700 hover:bg-teal-700 hover:border-teal-700 hover:text-white transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                              >
                                <Edit className="w-4 h-4 mr-2" /> 
                                Edit Listing
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Decorative corner element */}
                        <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-6">
                <Button className="cursor-pointer border border-gray-300 hover:bg-teal-700 hover:text-white" variant="secondary" onClick={onClose}>
                  Close
                </Button>
              </div>
        </div>
      </div>
    </div>
    )}
    {/* Modal with pre-filled values, similar to AddListingModal */}
    {(editTarget || (directEditMode && listing)) && (
      <EditListingFormModal
        isOpen={!!(editTarget || (directEditMode && listing))}
        onClose={() => {
          setEditTarget(null);
          if (directEditMode) onClose();
        }}
        listing={editTarget || listing}
        onUpdated={updatedListing => {
          if (directEditMode) {
            onUpdate?.(updatedListing);
            onClose();
          } else {
            setListings(listings =>
              listings.map(l => l.id === updatedListing.id ? updatedListing : l)
            );
            setEditTarget(null);
          }
        }}
      />
     )}
  </>
  )
}