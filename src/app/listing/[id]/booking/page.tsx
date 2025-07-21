import { notFound } from 'next/navigation'
import { getPublicListingsAsServices } from '@/features/services/listing_crud'
import BookingPage from '@/shared/components/booking/BookingPage'

interface BookingPageProps {
  params: Promise<{ id: string }>
}

export default async function BookingPageRoute({ params }: BookingPageProps) {
  const resolvedParams = await params
  const { id } = resolvedParams

  try {
    // Get all listings and find the one with matching ID
    const listings = await getPublicListingsAsServices()
    const listing = listings.find(service => service.id === id)

    if (!listing) {
      notFound()
    }

    return <BookingPage service={listing} />
  } catch (error) {
    console.error('Error fetching listing for booking:', error)
    notFound()
  }
}
