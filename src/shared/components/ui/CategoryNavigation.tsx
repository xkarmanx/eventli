import Image from "next/image"

export default function CategoryNavigation() {
  const categories = [
    {
      name: "Wedding",
      icon: "/wedding.svg"
    },
    {
      name: "Birthday",
      icon: "/birthday.svg"
    },
    {
      name: "Ceremony",
      icon: "/ceremony.svg"
    },
    {
      name: "Funeral",
      icon: "/funeral.svg"
    },
    {
      name: "Others",
      icon: "/others.svg"
    }
  ];

  return (
    <div className="bg-white border-b border-gray-100 px-3 sm:px-6 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Desktop and tablet view */}
        <div className="hidden sm:flex items-center justify-center space-x-8 md:space-x-12 lg:space-x-20">
          {categories.map((category) => (
            <div key={category.name} className="flex flex-col items-center space-y-2 lg:space-y-3 cursor-pointer group">
              <div className="flex items-center justify-center group-hover:scale-110 transition-transform">
                <Image
                  src={category.icon}
                  alt={category.name}
                  width={48}
                  height={48}
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">{category.name}</span>
            </div>
          ))}
        </div>

        {/* Mobile view - horizontal scroll */}
        <div className="sm:hidden overflow-x-auto scrollbar-hide">
          <div className="flex space-x-6 pb-2" style={{ minWidth: 'max-content' }}>
            {categories.map((category) => (
              <div key={category.name} className="flex flex-col items-center space-y-2 cursor-pointer group flex-shrink-0">
                <div className="flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Image
                    src={category.icon}
                    alt={category.name}
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
