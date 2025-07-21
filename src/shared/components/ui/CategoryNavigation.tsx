import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"

export default function CategoryNavigation() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const categories = [
    {
      name: "Wedding",
      icon: "/wedding.svg",
      eventType: "Wedding"
    },
    {
      name: "Birthday",
      icon: "/birthday.svg", 
      eventType: "Birthday"
    },
    {
      name: "Corporate",
      icon: "/ceremony.svg", // Using ceremony icon for corporate events
      eventType: "Corporate"
    },
    {
      name: "Funeral",
      icon: "/funeral.svg",
      eventType: "Funeral"
    },
    {
      name: "Others",
      icon: "/others.svg",
      eventType: "Other"
    }
  ]

  const handleCategoryClick = (eventType: string) => {
    // Create new URLSearchParams with the event type filter
    const params = new URLSearchParams(searchParams.toString())
    params.set('eventType', eventType)
    
    // Navigate to the home page with the filter applied
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="bg-white border-b border-gray-100 px-3 sm:px-6 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Desktop and tablet view */}
        <div className="hidden sm:flex items-center justify-center space-x-8 md:space-x-12 lg:space-x-20">
          {categories.map((category) => (
            <div 
              key={category.name} 
              className="flex flex-col items-center space-y-2 lg:space-y-3 cursor-pointer group"
              onClick={() => handleCategoryClick(category.eventType)}
            >
              <div className="flex items-center justify-center group-hover:scale-110 transition-transform">
                <Image
                  src={category.icon}
                  alt={category.name}
                  width={48}
                  height={48}
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-teal-600 transition-colors">{category.name}</span>
            </div>
          ))}
        </div>

        {/* Mobile view - horizontal scroll */}
        <div className="sm:hidden overflow-x-auto scrollbar-hide">
          <div className="flex space-x-6 pb-2" style={{ minWidth: 'max-content' }}>
            {categories.map((category) => (
              <div 
                key={category.name} 
                className="flex flex-col items-center space-y-2 cursor-pointer group flex-shrink-0"
                onClick={() => handleCategoryClick(category.eventType)}
              >
                <div className="flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Image
                    src={category.icon}
                    alt={category.name}
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap group-hover:text-teal-600 transition-colors">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
