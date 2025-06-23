import Navbar from "@/components/ui/Navbar"
import CategoryNavigation from "@/components/ui/CategoryNavigation"
import ServicesGrid from "@/components/ui/ServicesGrid"
import { mockServices } from "@/lib/mockData"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <CategoryNavigation />
      <ServicesGrid services={mockServices} />
    </div>
  )
}