'use client'

import { useEffect } from 'react'
import { X, Edit } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface EditListingModalProps {
  isOpen: boolean
  onClose: () => void
}

// Dummy listings for UI purposes, it should render the actual Listings the user has created -Joshua
const dummyListings = [
  { id: 1, title: "Birthday Party DJ", description: "Professional DJ services for your birthday event." },
  { id: 2, title: "Wedding Catering", description: "Full-service wedding catering for up to 200 guests." },
]

export default function EditListingModal({ isOpen, onClose }: EditListingModalProps) {
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
          <div className="space-y-4">
            {dummyListings.map(listing => (
              <div key={listing.id} className="border border-gray-200 rounded-lg p-4 flex flex-col gap-2 bg-gray-50">
                <div className="font-semibold">{listing.title}</div>
                <div className="text-gray-700 text-sm">{listing.description}</div>
                <div className="flex gap-2 mt-2">
                  <Button variant="default" size="sm">
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}