'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Service } from "@/shared/types/service"

interface SearchInputProps {
  placeholder: string
  label: string
  type: 'location' | 'event'
  listings: Service[]
  onFilteredResults: (filteredListings: Service[]) => void
  className?: string
  variant?: 'desktop' | 'mobile'
  initialValue?: string
  inputClassName?: string // Add custom input styling prop
}

export default function SearchInput({
  placeholder,
  label,
  type,
  listings,
  onFilteredResults,
  className = '',
  variant = 'desktop',
  initialValue = '',
  inputClassName
}: SearchInputProps) {
  const [query, setQuery] = useState(initialValue)
  // JC: Use ref to prevent unnecessary re-renders and callback changes
  const listingsRef = useRef(listings)
  const onFilteredResultsRef = useRef(onFilteredResults)

  // JC: Update refs when props change
  useEffect(() => {
    listingsRef.current = listings
    onFilteredResultsRef.current = onFilteredResults
  }, [listings, onFilteredResults])

  // JC: Main filtering function - now stable with refs
  const filterListings = useCallback((searchQuery: string) => {
    const currentListings = listingsRef.current
    const currentCallback = onFilteredResultsRef.current

    // JC: If search is empty, return all listings (no filtering)
    if (!searchQuery.trim()) {
      currentCallback(currentListings)
      return
    }

    // JC: Convert search query to lowercase for case-insensitive matching
    const normalizedQuery = searchQuery.toLowerCase().trim()
    
    // JC: Filter based on the specific search type - each input filters independently
    const filtered = currentListings.filter(listing => {
      // JC: Location search - only check location field
      if (type === 'location') {
        return listing.location.toLowerCase().includes(normalizedQuery)
      }
      
      // JC: Event search - check event-related fields AND location for comprehensive search
      if (type === 'event') {
        const titleMatch = listing.title.toLowerCase().includes(normalizedQuery)
        const descriptionMatch = listing.description?.toLowerCase().includes(normalizedQuery) || false
        const providerMatch = listing.provider?.toLowerCase().includes(normalizedQuery) || false
        const servingStyleMatch = listing.serving_style?.toLowerCase().includes(normalizedQuery) || false
        const priceMatch = listing.price.toLowerCase().includes(normalizedQuery)
        // JC: Added location search to event type for mobile comprehensive search
        const locationMatch = listing.location.toLowerCase().includes(normalizedQuery)
        
        return titleMatch || descriptionMatch || providerMatch || servingStyleMatch || priceMatch || locationMatch
      }
      
      // JC: Default case - should not happen but return false for safety
      return false
    })

    // JC: Send the filtered results back to the parent component
    currentCallback(filtered)
  }, [type]) // JC: Only depend on type, which doesn't change

  // JC: Debounced search function - now stable
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      filterListings(searchQuery)
    }, 300),
    [filterListings]
  )

  // JC: Only run effect when query changes, not when props change
  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      filterListings(query)
    }
    if (e.key === 'Escape') {
      setQuery('')
      filterListings('') // JC: Directly call with empty string
    }
  }

  if (variant === 'mobile') {
    return (
      <div className={`relative ${className}`}>
        {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className={inputClassName || "w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"}
        />
      </div>
    )
  }

  return (
    <div className={`relative flex-1 ${className}`}>
      <div className="px-4 lg:px-6 py-1">
        <div className="text-xs font-medium text-gray-500 mb-0">{label}</div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className="w-full text-sm text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none"
        />
      </div>
    </div>
  )
}

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined
  return (...args: Parameters<T>): void => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}
