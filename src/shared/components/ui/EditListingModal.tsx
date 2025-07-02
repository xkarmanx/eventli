'use client'

import { useEffect, useState } from 'react'
import { X, Edit } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { getListings } from '@/features/services/listing_crud'
import EditListingFormModal from "@/shared/components/ui/EditListingFormModal";
import { createClient } from '@/shared/lib/supabase/client'

interface EditListingModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function EditListingModal({ isOpen, onClose }: EditListingModalProps) {
  const [listings, setListings] = useState<any[]>([]);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

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
    <div
      className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-auto relative transform transition-all duration-300 scale-100">
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
          <h2 className="text-2xl font-bold mb-6">Edit a Listing</h2>
          {fetchError && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-800 text-center font-medium">
              {fetchError}
            </div>
          )}
          <div className="space-y-4">
            {listings.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                You have no listings yet.
              </div>
            ) : (
              listings.map(listing => (
                <div key={listing.id} className="border border-gray-200 rounded-lg p-4 flex flex-col gap-2 bg-gray-50">
                  <div className="font-semibold">{listing.title}</div>
                  <div className="text-gray-700 text-sm">{listing.description}</div>
                  <div className="flex gap-2 mt-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setEditTarget(listing)}
                    className="border border-gray-300 hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        <div className="flex justify-end mt-6">
          <Button className="border border-gray-300 hover:bg-gray-100" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
    {/* Modal with pre-filled values, similar to AddListingModal */}
    {editTarget && (
      <EditListingFormModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        listing={editTarget}
        onUpdated={updatedListing => {
          setListings(listings =>
            listings.map(l => l.id === updatedListing.id ? updatedListing : l)
          );
          setEditTarget(null);
        }}
      />
     )}
  </div>
  )
}