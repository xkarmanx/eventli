import { notFound } from 'next/navigation'
import { getListingById } from '@/features/services/listing_crud'
import { transformListingToService } from '@/shared/lib/listingUtils'
import ListingDetailsPage from '../../../shared/components/listing/ListingDetailsPage'

interface ListingPageProps {
  params: Promise<{ id: string }>
}

export default async function ListingPage({ params }: ListingPageProps) {
  const resolvedParams = await params
  const { id } = resolvedParams

  try {
    // Get the specific listing with tags and profile data
    const listing = await getListingById(id)
    
    if (!listing || !listing.is_published) {
      notFound()
    }

    // Transform to Service format
    const service = transformListingToService(listing)

    return <ListingDetailsPage service={service} />
  } catch (error) {
    console.error('Error fetching listing:', error)
    notFound()
  }
}
