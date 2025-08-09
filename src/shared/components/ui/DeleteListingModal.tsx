'use client'

import { useEffect, useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { getListings, deleteListing } from '@/features/services/listing_crud'
// kvs: Replaced react-toastify with sonner for consistent toast implementation across the app
import { toast } from 'sonner';
import { createClient } from '@/shared/lib/supabase/client' // JC: Get user data from database

// JC: Define what props this modal needs
interface DeleteListingModalProps {
  isOpen: boolean
  onClose: () => void
  listing?: any // JC: Optional listing to delete directly (when called from card)
  onDelete?: (listingId: string) => void // JC: Callback to update parent state
}

export default function DeleteListingModal({ isOpen, onClose, listing, onDelete }: DeleteListingModalProps) {
  // JC: State to store user listings and selected listing for deletion
  const [listings, setListings] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // JC: If listing is provided directly, skip the selection interface
  const directDeleteMode = !!listing;

  // JC: Handle direct delete mode - when listing is provided, go straight to delete confirmation
  useEffect(() => {
    if (directDeleteMode && listing && isOpen) {
      setDeleteTarget(listing);
    }
  }, [directDeleteMode, listing, isOpen]);

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

  useEffect(() => {
    if (!isOpen) return;
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Prevent scrolling only when confirmation dialog is open
  useEffect(() => {
    if (deleteTarget) {
      document.body.style.overflow = 'hidden';
    } else if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [deleteTarget, isOpen]);

  if (!isOpen) return null;

  // kvs: Added authentication check to prevent unauthorized access
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

  const handleDelete = (listing: any) => {
    setDeleteTarget(listing);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await deleteListing(deleteTarget.id);
      // kvs: Replaced react-toastify with sonner toast for consistent success messaging
      toast.success("Listing deleted successfully!");
      
      if (directDeleteMode) {
        // JC: In direct mode, call parent callback and close modal
        onDelete?.(deleteTarget.id);
        onClose();
      } else {
        // JC: In selection mode, update local listings state
        setListings(prev => prev.filter(l => l.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err: any) {
      setFetchError(err.message || "Failed to delete listing.");
      // kvs: Added sonner toast for error messaging consistency
      toast.error(err.message || "Failed to delete listing");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      {/* Main Modal Content - only show when not in direct delete mode */}
      {!directDeleteMode && (
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto relative transform transition-all duration-300 scale-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 p-2 text-teal-600 hover:text-white hover:bg-teal-700 rounded-full transition-colors z-10 bg-white border border-gray-300 shadow"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">Delete a Listing</h2>
              {fetchError && (
                <div className="mb-4 p-3 rounded bg-red-100 text-red-800 text-center font-medium">
                  {fetchError}
                </div>
              )}
              <div className="space-y-6">
            {listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Trash2 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No listings yet</h3>
                <p className="text-gray-500 text-center max-w-sm">
                  You haven&apos;t created any listings yet. Create your first listing to get started!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {listings.map(listing => (
                  <div 
                    key={listing.id} 
                    onClick={() => handleDelete(listing)}
                    className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-teal-700 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative overflow-hidden rounded-lg flex-shrink-0">
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
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(listing);
                            }}
                            disabled={loading}
                            className="cursor-pointer bg-teal-50 text-teal-700 border-teal-700 hover:bg-teal-700 hover:border-teal-700 hover:text-white transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> 
                            Delete Listing
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
            <Button
              className="cursor-pointer border border-gray-300 hover:bg-teal-700 hover:text-white"
              variant="secondary"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
      )}

      {/* Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Listing</h3>
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete
              </p>
              <p className="font-semibold text-red-600 mb-6">
                &quot;{deleteTarget.title}&quot;?
              </p>
              <p className="text-sm text-gray-500 mb-8">
                This action cannot be undone. This will permanently delete your listing.
              </p>
              <div className="flex gap-3 w-full">
                <Button
                  className="cursor-pointer flex-1 border border-gray-300 hover:bg-teal-700 hover:text-white"
                  variant="secondary"
                  onClick={() => {
                    setDeleteTarget(null);
                    // JC: In direct delete mode, also close the main modal when canceling
                    if (directDeleteMode) {
                      onClose();
                    }
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  className="cursor-pointer flex-1 text-black border border-gray-300 hover:bg-red-700 hover:text-white hover:border-red-600"
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
