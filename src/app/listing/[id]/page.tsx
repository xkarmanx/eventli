import { notFound } from 'next/navigation'
import { getPublicListingsAsServices } from '@/features/services/listing_crud'
import ListingDetailsPage from '../../../shared/components/listing/ListingDetailsPage'

interface ListingPageProps {
  params: Promise<{ id: string }>
}

export default async function ListingPage({ params }: ListingPageProps) {
  const resolvedParams = await params
  const { id } = resolvedParams

  try {
    // Get all listings and find the one with matching ID
    const listings = await getPublicListingsAsServices()
    const listing = listings.find(service => service.id === id)

    if (!listing) {
      notFound()
    }

    return <ListingDetailsPage service={listing} />
  } catch (error) {
    console.error('Error fetching listing:', error)
    notFound()
  }
}
