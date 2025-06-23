import { createClient } from '@/shared/lib/supabase/server'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Search, Calendar, Star, Heart, ArrowRight, Camera, Music, Utensils, VenetianMask, Palette } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// --- Mock Data (for demonstration purposes) ---
// You would fetch this from your 'categories' and 'listings' tables
const categories = [
  { name: 'Venues', icon: Calendar, href: '/services/venues' },
  { name: 'Catering', icon: Utensils, href: '/services/catering' },
  { name: 'Photography', icon: Camera, href: '/services/photography' },
  { name: 'Music & DJs', icon: Music, href: '/services/music' },
  { name: 'Decorations', icon: Palette, href: '/services/decorations' },
  { name: 'Planners', icon: VenetianMask, href: '/services/planners' },
];

const featuredListings = [
  {
    id: '1',
    title: 'Gourmet Wedding Catering',
    organizer: 'Bella Cuisine',
    price: 120,
    priceUnit: 'person',
    rating: 4.9,
    image: '/assets/yukiko-kanada-Ou4CQo6jzvU-unsplash.jpg',
  },
  {
    id: '2',
    title: 'The Grand Oak Venue',
    organizer: 'Oakwood Estates',
    price: 5000,
    priceUnit: 'day',
    rating: 5.0,
    image: '/assets/9ea0f30e-d10c-45fd-b739-f878eb456528.jpg',
  },
  {
    id: '3',
    title: 'Professional Event Planning',
    organizer: 'Dream Events Co.',
    price: 2500,
    priceUnit: 'package',
    rating: 4.8,
    image: '/assets/samantha-gades-7J4T1XzpJgU-unsplash.jpg',
  },
   {
    id: '4',
    title: 'Premium Catering Services',
    organizer: 'Culinary Masters',
    price: 85,
    priceUnit: 'person',
    rating: 4.9,
    image: '/assets/7a616ed5-6f23-4267-9d92-2b0b4bf8cb32.jpg',
  },
];

// --- Main Page Component ---
export default async function Index() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="bg-background text-foreground">

      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent z-10" />
        <Image 
          src="/assets/9ea0f30e-d10c-45fd-b739-f878eb456528.jpg" 
          alt="Elegant event setting with warm lights"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 p-4 space-y-6 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-balance animate-fade-in-down">
            Your event, perfectly planned.
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/90 text-balance animate-fade-in-up">
            Discover and book trusted professionals for any occasion.
          </p>
          <div className="w-full max-w-2xl mx-auto animate-fade-in-up delay-200">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 flex items-center shadow-2xl">
              <Search className="h-6 w-6 mx-3 text-gray-400" />
              <Input
                type="text"
                placeholder="Search services (e.g., 'wedding photographer')"
                className="flex-grow bg-transparent border-none focus:ring-0 text-gray-900 placeholder:text-gray-500 text-lg"
              />
              <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 transition-colors">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Explore by category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
            {categories.map((category) => (
              <Link href={category.href} key={category.name} className="group flex flex-col items-center text-center p-4 rounded-xl hover:bg-secondary transition-colors duration-300">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                    <category.icon className="w-10 h-10 text-primary transition-colors duration-300" />
                </div>
                <p className="font-semibold text-foreground">{category.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Listings Section */}
      <section className="bg-secondary/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-baseline mb-12 gap-4">
            <h2 className="text-3xl font-bold">Featured services</h2>
            <Button variant="ghost" asChild className="text-primary hover:text-primary">
              <Link href="#">See all <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group border rounded-2xl">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3]">
                    <Image src={listing.image} alt={listing.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    <Button size="icon" variant="secondary" className="absolute top-3 right-3 rounded-full h-9 w-9 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-600 hover:text-red-500">
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">by {listing.organizer}</p>
                    <h3 className="font-semibold text-lg truncate group-hover:text-primary">{listing.title}</h3>
                    <div className="flex justify-between items-center pt-2">
                      <p className="text-lg font-bold">
                        ${listing.price.toLocaleString()}
                        <span className="text-sm font-normal text-muted-foreground"> / {listing.priceUnit}</span>
                      </p>
                       <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium">{listing.rating.toFixed(1)}</span>
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Provider CTA Section */}
      <section className="relative py-20 md:py-32">
        <div className="absolute inset-0">
          <Image src="/assets/6e7ad215-8949-4b35-a43c-4e95ed34d2e3.jpg" alt="Event organizer planning scene" fill className="object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-teal-900/80"></div>
        </div>
         <div className="container mx-auto px-4 relative text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Are you a service provider?</h2>
            <p className="max-w-xl mx-auto mb-8 text-white/90">
              Join our community of professionals and grow your business by connecting with clients planning their next big event.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100 text-lg py-3 px-8 h-auto" asChild>
              <Link href="/signup">List Your Service Today</Link>
            </Button>
         </div>
      </section>
    </div>
  )
}
