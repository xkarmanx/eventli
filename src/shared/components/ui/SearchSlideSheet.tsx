'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'

interface SearchSlideSheetProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (query: string, filters: FilterValues) => void
}

export interface FilterValues {
  priceRange?: string
  guestNumber?: string
}

export default function SearchSlideSheet({ isOpen, onClose, onSearch }: SearchSlideSheetProps) {
  const searchParams = useSearchParams()
  const [selectedFilters, setSelectedFilters] = useState<FilterValues>({})
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component is mounted to prevent hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Populate with current search parameters when modal opens
  useEffect(() => {
    if (isOpen && isMounted) {
      const currentPrice = searchParams.get('price') || ''
      const currentGuests = searchParams.get('guests') || ''
      
      setSelectedFilters({
        priceRange: currentPrice,
        guestNumber: currentGuests
      })
    }
  }, [isOpen, isMounted, searchParams])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFilters({})
    }
  }, [isOpen])

  const handleSearch = () => {
    onSearch('', selectedFilters) // Always pass empty string for search since we removed search input
    onClose()
  }

  const handleClearAll = () => {
    setSelectedFilters({})
    // Trigger search with empty parameters to reset results
    onSearch('', {})
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
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

  if (!isOpen || !isMounted) return null

  return (
    <div
      className={`fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-50 flex items-end transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={`bg-white rounded-t-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filter Events</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Price Range Filter */}
          <div>
            <Label className="text-base font-semibold text-gray-900 mb-3 block">
              Price Range
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {priceRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setSelectedFilters(prev => ({ 
                    ...prev, 
                    priceRange: prev.priceRange === range.value ? '' : range.value 
                  }))}
                  className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                    selectedFilters.priceRange === range.value
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
            <Label className="text-base font-semibold text-gray-900 mb-3 block">
              Number of Guests
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {guestNumbers.map((guest) => (
                <button
                  key={guest.value}
                  onClick={() => setSelectedFilters(prev => ({ 
                    ...prev, 
                    guestNumber: prev.guestNumber === guest.value ? '' : guest.value 
                  }))}
                  className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                    selectedFilters.guestNumber === guest.value
                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {guest.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear All Button */}
          {(selectedFilters.priceRange || selectedFilters.guestNumber) && (
            <div className="flex justify-center">
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Apply Filter Button */}
          <div className="pt-4">
            <Button
              onClick={handleSearch}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-base font-medium"
            >
              {!selectedFilters.priceRange && !selectedFilters.guestNumber
                ? 'Show All Events'
                : 'Apply Filters'
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
