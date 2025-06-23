import Image from "next/image"
import { MapPin, Users, Clock, Building2 } from "lucide-react"
import { Service } from "@/shared/lib/mockData"

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex space-x-4">
        {/* Service Image */}
        <div className="flex-shrink-0">
          <Image
            src={service.image}
            alt={service.title}
            width={120}
            height={120}
            className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-lg"
          />
        </div>

        {/* Service Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h3 className="text-base font-semibold text-gray-900 leading-tight mb-2">
                {service.title}
              </h3>
              <p className="text-base font-semibold text-gray-900 mb-3">
                {service.price}
              </p>
            </div>
            <button className="border border-black text-black px-4 py-1.5 rounded-full text-sm font-medium flex-shrink-0 hover:bg-gray-50 transition-colors">
              View
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-600">
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
              <span className="truncate">{service.location}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
              <span>{service.guests}</span>
            </div>

            <div className="flex items-center">
              <Building2 className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
              <span className="truncate">{service.provider}</span>
            </div>

            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
              <span>{service.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
