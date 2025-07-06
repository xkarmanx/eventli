'use client'

import { useState } from 'react'
import { Edit, Trash2, MapPin, Users, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import EditListingModal from './EditListingModal'
import DeleteListingModal from './DeleteListingModal'

// JC: Define what data each listing card expects
interface ListingCardSellerProps {
  listing: {
    id: string
    title: string
    description: string
    price: number
    location: string
    event_type: string
    serving_style: string
    num_staff: number
    num_guests: number
    image_url: string
    created_at?: string
  }
  onUpdate?: (updatedListing: any) => void
  onDelete?: (listingId: string) => void
  onEdit?: (listing: any) => void // JC: Callback when edit button is clicked
  onDeleteRequest?: (listing: any) => void // JC: Callback when delete button is clicked
}

export default function ListingCardSeller({ listing, onUpdate, onDelete, onEdit, onDeleteRequest }: ListingCardSellerProps) {
  // JC: Remove local modal state since modals are now handled by parent component

  // JC: Functions to handle edit and delete button clicks - now call parent callbacks
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(listing)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDeleteRequest?.(listing)
  }

  // JC: Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <>
      {/* JC: Main listing card with hover effects */}
      <div className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-teal-700 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1">
        {/* JC: Listing image section */}
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img 
            src={listing.image_url} 
            alt={listing.title} 
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" 
          />
          
          {/* Action Buttons Overlay */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              onClick={handleEdit}
              className="cursor-pointer bg-blue-50 text-blue-600 border-blue-300 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              className="cursor-pointer bg-red-50 text-red-600 border-red-300 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-3">
          {/* Title and Price */}
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg text-gray-800 group-hover:text-teal-700 transition-colors duration-200 line-clamp-2 flex-1 pr-2">
              {listing.title}
            </h3>
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-2 h-2 bg-teal-700 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-1 text-teal-700 font-semibold">
            <DollarSign className="w-4 h-4" />
            <span className="text-lg">{listing.price}</span>
          </div>

          {/* Description */}
          {listing.description && (
            <p className="text-gray-600 text-sm line-clamp-2">
              {listing.description}
            </p>
          )}

          {/* Location */}
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{listing.event_type}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>{listing.num_guests} guests</span>
            </div>
          </div>

          {/* Serving Style and Staff */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-gray-500">
              <span className="font-medium">Style:</span> {listing.serving_style}
            </div>
            <div className="text-gray-500">
              <span className="font-medium">Staff:</span> {listing.num_staff}
            </div>
          </div>

          {/* Creation Date */}
          {listing.created_at && (
            <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
              Created: {formatDate(listing.created_at)}
            </div>
          )}
        </div>

        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </>
  )
}
