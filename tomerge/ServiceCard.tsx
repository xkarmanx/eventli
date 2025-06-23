import Image from "next/image"
import { MapPin, Users, Clock, Building2 } from "lucide-react"
import { Service } from "@/lib/mockData"

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex space-x-4 h-24">
        {/* Service Image */}
        <div className="flex-shrink-0">
          <Image
            src={service.image || "/placeholder.svg"}
            alt={service.title}
            width={96}
            height={96}
            className="w-24 h-24 object-cover rounded-lg"
          />
        </div>

        {/* Service Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 leading-tight mb-1">
                {service.title}
              </h3>
              <p className="text-base font-semibold text-gray-900 mb-2">
                {service.price}
              </p>
            </div>            <button className="border border-black text-black px-4 py-1.5 rounded-full text-sm font-medium ml-4 flex-shrink-0 hover:bg-gray-50 transition-colors">
              View
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-600">
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
              <span>{service.provider}</span>
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
