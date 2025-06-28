'use client'

import { useEffect, useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useSession } from '@supabase/auth-helpers-react'
import { getListings, deleteListing } from '@/features/services/listing_crud'
import { toast } from 'react-toastify';

interface DeleteListingModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DeleteListingModal({ isOpen, onClose }: DeleteListingModalProps) {
  const [listings, setListings] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const session = useSession();

  useEffect(() => {
    if (isOpen && session?.user?.id || "a4fef5aa-c7cd-4c75-9a89-1273bd66cbcd") {
      setFetchError(null);
      getListings(session?.user.id || "a4fef5aa-c7cd-4c75-9a89-1273bd66cbcd")
        .then(setListings)
        .catch(err => {
          setFetchError(err.message || "Failed to fetch listings.");
          setListings([]);
        });
    }
  }, [isOpen, session?.user?.id]);

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

  const handleDelete = (listing: any) => {
    setDeleteTarget(listing);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await deleteListing(deleteTarget.id);
      toast.success("Listing deleted successfully!");
      setListings(prev => prev.filter(l => l.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      setFetchError(err.message || "Failed to delete listing.");
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
      {/* Main Modal Content */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-auto relative transform transition-all duration-300 scale-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10 bg-white shadow"
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
          <div className="space-y-4">
            {listings.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                You have no listings to delete.
              </div>
            ) : (
              listings.map(listing => (
                <div key={listing.id} className="border border-gray-200 rounded-lg p-4 flex flex-col gap-2 bg-gray-50">
                  <div className="font-semibold">{listing.title}</div>
                  <div className="text-gray-700 text-sm">{listing.description}</div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      className="border border-gray-300 hover:bg-gray-100"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(listing)}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end mt-6">
            <Button
              className="border border-gray-300 hover:bg-gray-100"
              variant="secondary"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-60 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-xs w-full flex flex-col items-center">
            <Trash2 className="w-8 h-8 text-red-500 mb-2" />
            <div className="font-semibold mb-2 text-center">
              Are you sure you want to delete <br />
              <span className="text-red-600">{deleteTarget.title}</span>?
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                className="border border-gray-300 hover:bg-gray-100"
                variant="secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                className="border border-gray-300 hover:bg-gray-100 bg-red-500 text-white"
                variant="destructive"
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
