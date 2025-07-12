'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: FilterValues) => void
}

export interface FilterValues {
  priceRange: string
  guestNumber: string
}

export default function FilterModal({ isOpen, onClose, onApplyFilters }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterValues>({
    priceRange: '',
    guestNumber: ''
  })

  useEffect(() => {
    if (!isOpen) return

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
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

  const handleApplyFilters = () => {
    onApplyFilters(filters)
    onClose()
  }

  const handleClearFilters = () => {
    setFilters({
      priceRange: '',
      guestNumber: ''
    })
  }

  const priceRanges = [
    { value: 'under-5000', label: 'Under $5K' },
    { value: '5000-10000', label: '$5K - $10K' },
    { value: '10000-20000', label: '$10K - $20K' },
    { value: '20000-30000', label: '$20K - $30K' },
    { value: 'over-30000', label: 'Over $30K' }
  ]

  const guestNumbers = [
    { value: 'under-20', label: 'Under 20' },
    { value: '20-40', label: '20 - 40' },
    { value: '40-60', label: '40 - 60' },
    { value: '60-100', label: '60 - 100' },
    { value: 'over-100', label: '100+' }
  ]

  return (
    <div
      className={`fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={`bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[85vh] sm:max-h-none overflow-y-auto relative transform transition-all duration-300 ${
        isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Modal Content */}
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              Filters
            </h2>
            <div className="h-px bg-gray-200"></div>
          </div>

          {/* Filter Sections */}
          <div className="space-y-6 sm:space-y-8">
            {/* Price Range Filter */}
            <div>
              <Label className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 block">
                Price Range
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {priceRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      priceRange: prev.priceRange === range.value ? '' : range.value 
                    }))}
                    className={`p-2 sm:p-3 border rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      filters.priceRange === range.value
                        ? 'border-teal-600 bg-teal-50 text-teal-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest Number Filter */}
            <div>
              <Label className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 block">
                Number of Guests
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {guestNumbers.map((guest) => (
                  <button
                    key={guest.value}
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      guestNumber: prev.guestNumber === guest.value ? '' : guest.value 
                    }))}
                    className={`p-2 sm:p-3 border rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      filters.guestNumber === guest.value
                        ? 'border-teal-600 bg-teal-50 text-teal-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {guest.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 sm:pt-8 border-t border-gray-200 mt-6 sm:mt-8 space-y-3 sm:space-y-0">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 text-gray-600 border-gray-300 hover:bg-gray-50 text-sm"
            >
              Clear All
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 py-2 text-sm"
            >
              Show Results
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}