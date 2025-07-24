import Image from "next/image"
import { MapPin, Users, Clock, Building2, Zap } from "lucide-react"
import { Service } from "@/shared/types/service"


interface ServiceCardProps {
  service: Service & { boost_priority?: number | null }; // ✅ CHANGE: Allow boost_priority prop
  onViewClick?: (service: Service) => void;
}

export default function ServiceCard({ service, onViewClick }: ServiceCardProps) {
  const handleViewClick = () => {
    onViewClick?.(service);
  };

  const handleCardClick = () => {
    onViewClick?.(service);
  };

  return (
    <div 
      className="bg-white border border-gray-200 p-2 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex space-x-2 sm:space-x-4">
        {/* Service Image */}
        <div className="flex-shrink-0 relative"> {/*✅ Change: Added relative positioning*/}
          <Image
            src={service.image}
            alt={service.title}
            width={120}
            height={120}
            className="w-32 h-32 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-lg"
          />
        </div>

        {/* ✅ ADD: Boosted Badge */}
          {service.boost_priority && service.boost_priority > 0 && (
             <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Featured
            </div>
          )}

        {/* Service Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-1 sm:pr-4">
              <h3 className="text-xs sm:text-base font-semibold text-gray-900 leading-tight mb-0.5 sm:mb-2">
                {service.title}
              </h3>
              <p className="text-xs sm:text-base font-semibold text-gray-900 mb-1 sm:mb-3">
                {service.price}
              </p>
            </div>
            <button 
              className="border border-black text-black px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 hover:bg-gray-50 transition-colors"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click when button is clicked
                handleViewClick();
              }}
            >
              View
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-0.5 sm:gap-y-2 text-xs text-gray-600">
            <div className="flex items-center max-w-full">
              <MapPin className="w-3 h-3 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
              <span className="truncate text-xs sm:text-sm max-w-[120px] sm:max-w-none">{service.location}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{service.guests}</span>
            </div>

            <div className="flex items-center">
              <Building2 className="w-3 h-3 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
              <span className="truncate text-xs sm:text-sm">{service.provider}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{service.eventType}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
