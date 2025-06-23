import Image from "next/image"

export default function CategoryNavigation() {
  const categories = [
    {
      name: "Wedding",
      icon: "/wedding.svg"
    },
    {
      name: "Birthday",
      icon: "/Birthday.svg"
    },
    {
      name: "Ceremony",
      icon: "/Cermony.svg"
    },
    {
      name: "Funeral",
      icon: "/Funeral.svg"
    },
    {
      name: "Others",
      icon: "/More.svg"
    }
  ];

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center space-x-20">          {categories.map((category) => (
            <div key={category.name} className="flex flex-col items-center space-y-3 cursor-pointer group">
              <div className="flex items-center justify-center group-hover:scale-110 transition-transform">
                <Image
                  src={category.icon}
                  alt={category.name}
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
              </div>
              <span className="text-sm font-medium text-gray-700">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
