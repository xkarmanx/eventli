import { Heart, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Eventli Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Connect with the best event service providers and make your special moments unforgettable.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-gray-600 hover:text-teal-600 transition-colors">
                Browse Services
              </Link>
              <Link href="#" className="block text-sm text-gray-600 hover:text-teal-600 transition-colors">
                How It Works
              </Link>
              <Link href="#" className="block text-sm text-gray-600 hover:text-teal-600 transition-colors">
                About Us
              </Link>
            </div>
          </div>

          {/* For Vendors */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">For Vendors</h4>
            <div className="space-y-2">
              <Link href="/signup" className="block text-sm text-gray-600 hover:text-teal-600 transition-colors">
                Join as Vendor
              </Link>
              <Link href="#" className="block text-sm text-gray-600 hover:text-teal-600 transition-colors">
                Dashboard
              </Link>
              <Link href="#" className="block text-sm text-gray-600 hover:text-teal-600 transition-colors">
                Support
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Get in Touch</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-teal-700 rounded-full flex items-center justify-center">
                  <Mail className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-gray-600">hello@eventli.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-teal-700 rounded-full flex items-center justify-center">
                  <Phone className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-gray-600">(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-teal-700 rounded-full flex items-center justify-center">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-gray-600">Calgary, AB, Canada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <span>© {new Date().getFullYear()} Eventli, Inc. Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>in Calgary</span>
            </div>
            
            <div className="flex space-x-6 text-sm">
              <Link href="#" className="text-gray-600 hover:text-teal-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-600 hover:text-teal-600 transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-gray-600 hover:text-teal-600 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}