'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
}

export interface FilterValues {
  priceRange?: string[]
  guestNumber?: string[]
}

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
  const router = useRouter()
  const [selectedFilters, setSelectedFilters] = useState<FilterValues>({})
  const [lastAppliedFilters, setLastAppliedFilters] = useState<FilterValues>({}) // JC: Track what was actually applied

  // JC: When modal opens, reset to last applied filters
  useEffect(() => {
    if (isOpen) {
      setSelectedFilters(lastAppliedFilters)
    }
  }, [isOpen, lastAppliedFilters])

  // JC: Handle "Show Results" - apply the selected filters
  const handleShowResults = () => {
    setLastAppliedFilters(selectedFilters) // JC: Remember what we applied
    
    // Navigate to URL with filter parameters for server-side filtering
    const searchParams = new URLSearchParams()
    
    if (selectedFilters.priceRange && selectedFilters.priceRange.length > 0) {
      searchParams.set('price', selectedFilters.priceRange.join(','))
    }
    
    if (selectedFilters.guestNumber && selectedFilters.guestNumber.length > 0) {
      searchParams.set('guests', selectedFilters.guestNumber.join(','))
    }

    // Navigate to homepage with filters
    const queryString = searchParams.toString()
    router.push(queryString ? `/?${queryString}` : '/')
    onClose()
  }

  // JC: Handle "Clear All" - clear and apply empty filters
  const handleClearAll = () => {
    const emptyFilters: FilterValues = {} // JC: Type the empty object
    setSelectedFilters(emptyFilters)
    setLastAppliedFilters(emptyFilters)
    
    // Navigate to homepage without any filter parameters
    router.push('/')
    onClose()
  }

  // JC: Handle modal close (X button or outside click) - revert to last applied filters
  const handleModalClose = () => {
    setSelectedFilters(lastAppliedFilters) // JC: Revert to what was actually applied
    onClose()
  }

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleModalClose() // JC: Use custom close handler instead of onClose()
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
          onClick={handleModalClose} // JC: Use our custom close handler
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
                    onClick={() => setSelectedFilters(prev => {
                      const currentPriceRanges = prev.priceRange || []
                      const isSelected = currentPriceRanges.includes(range.value)
                      
                      return {
                        ...prev,
                        priceRange: isSelected
                          ? currentPriceRanges.filter(val => val !== range.value)
                          : [...currentPriceRanges, range.value]
                      }
                    })}
                    className={`p-2 sm:p-3 border rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      selectedFilters.priceRange?.includes(range.value)
                        ? 'border-teal-600 bg-teal-600 text-white shadow-md transform scale-105'
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
                    onClick={() => setSelectedFilters(prev => {
                      const currentGuestNumbers = prev.guestNumber || []
                      const isSelected = currentGuestNumbers.includes(guest.value)
                      
                      return {
                        ...prev,
                        guestNumber: isSelected
                          ? currentGuestNumbers.filter(val => val !== guest.value)
                          : [...currentGuestNumbers, guest.value]
                      }
                    })}
                    className={`p-2 sm:p-3 border rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      selectedFilters.guestNumber?.includes(guest.value)
                        ? 'border-teal-600 bg-teal-600 text-white shadow-md transform scale-105'
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
              onClick={handleClearAll}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 text-gray-600 border-gray-300 hover:bg-gray-50 text-sm"
            >
              Clear All
            </Button>
            <Button
              onClick={handleShowResults}
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