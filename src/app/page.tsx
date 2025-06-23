import Navbar from "@/shared/components/ui/Navbar"
import CategoryNavigation from "@/shared/components/ui/CategoryNavigation"
import ServicesGrid from "@/shared/components/ui/ServicesGrid"
import { mockServices } from "@/shared/lib/mockData"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <CategoryNavigation />
      <ServicesGrid services={mockServices} />
    </div>
  )
}