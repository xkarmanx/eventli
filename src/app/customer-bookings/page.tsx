"use client";

import { Calendar, Clock, MapPin, Users, Star, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import CustomerNavbar from "@/shared/components/ui/CustomerNavbar";

// Mock data for demonstration - will be replaced with real data later
const mockBookings = [
  {
    id: 1,
    listingTitle: "Elegant Wedding Photography",
    listingImage: "/assets/samantha-gades-7J4T1XzpJgU-unsplash.jpg",
    vendorName: "Sarah Photography Studio",
    vendorEmail: "sarah@photographystudio.com",
    vendorPhone: "+1 (555) 123-4567",
    bookingDate: "2025-08-15",
    eventDate: "2025-09-20",
    eventTime: "14:00",
    location: "Central Park, New York",
    guests: 150,
    status: "confirmed",
    price: 2500,
    rating: 4.8,
    eventType: "Wedding"
  },
  {
    id: 2,
    listingTitle: "Corporate Event Catering",
    listingImage: "/assets/yukiko-kanada-Ou4CQo6jzvU-unsplash.jpg",
    vendorName: "Gourmet Catering Co.",
    vendorEmail: "info@gourmetcatering.com",
    vendorPhone: "+1 (555) 987-6543",
    bookingDate: "2025-07-20",
    eventDate: "2025-08-10",
    eventTime: "12:00",
    location: "Downtown Convention Center",
    guests: 75,
    status: "completed",
    price: 1800,
    rating: 4.9,
    eventType: "Corporate"
  },
  {
    id: 3,
    listingTitle: "Birthday Party Entertainment",
    listingImage: "/assets/pexels-yankrukov-8867241 1.png",
    vendorName: "Fun Times Entertainment",
    vendorEmail: "contact@funtimesent.com",
    vendorPhone: "+1 (555) 456-7890",
    bookingDate: "2025-08-01",
    eventDate: "2025-12-05",
    eventTime: "15:30",
    location: "Community Center Hall",
    guests: 45,
    status: "pending",
    price: 650,
    rating: 4.6,
    eventType: "Birthday"
  }
];

export default function CustomerBookingsPage() {
  const [filterStatus, setFilterStatus] = useState("all");

  // Function to check if event is upcoming or past
  const isUpcoming = (eventDate: string) => {
    return new Date(eventDate) > new Date();
  };

  // Filter bookings based on status
  const filteredBookings = mockBookings.filter(booking => {
    if (filterStatus === "all") return true;
    if (filterStatus === "upcoming") return isUpcoming(booking.eventDate);
    if (filterStatus === "completed") return booking.status === "completed";
    return booking.status === filterStatus;
  });

  // Function to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* Customer Navbar */}
      <CustomerNavbar />
      
      {/* Enhanced Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-3">
              Your Bookings
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              View and manage all your event bookings. Keep track of upcoming events and review your booking history.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-12 h-1 bg-teal-600 rounded-full"></div>
              <div className="w-3 h-1 bg-teal-300 rounded-full"></div>
              <div className="w-3 h-1 bg-teal-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Booking Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-semibold text-black mb-4">Booking Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-teal-50 rounded-lg">
                <p className="text-2xl font-bold text-teal-600">{mockBookings.length}</p>
                <p className="text-sm text-gray-600">Total Bookings</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {mockBookings.filter(b => isUpcoming(b.eventDate)).length}
                </p>
                <p className="text-sm text-gray-600">Upcoming Events</p>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-semibold text-black mb-4">Filter Bookings</h2>
            <div className="flex flex-wrap gap-2">
              {["all", "upcoming", "completed"].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className={`capitalize ${
                    filterStatus === status 
                      ? "bg-teal-600 hover:bg-teal-700" 
                      : "hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
                  }`}
                >
                  {status === "all" ? "All Bookings" : status}
                </Button>
              ))}
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-6">
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">No bookings found</h3>
                <p className="text-gray-600">
                  {filterStatus === "all" 
                    ? "You haven't made any bookings yet." 
                    : filterStatus === "upcoming"
                    ? "No upcoming events scheduled."
                    : "No completed bookings found."}
                </p>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Booking Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={booking.listingImage}
                          alt={booking.listingTitle}
                          className="w-full lg:w-48 h-48 object-cover rounded-lg"
                        />
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold text-black mb-2">
                              {booking.listingTitle}
                            </h3>
                            <p className="text-gray-600 font-medium">{booking.vendorName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">{booking.rating}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-600 capitalize">{booking.eventType}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-start sm:items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                            <span className={`text-sm font-medium ${isUpcoming(booking.eventDate) ? 'text-teal-600' : 'text-gray-500'}`}>
                              {isUpcoming(booking.eventDate) ? 'Upcoming' : 'Past Event'}
                            </span>
                          </div>
                        </div>

                        {/* Event Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(booking.eventDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{booking.eventTime}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{booking.location}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{booking.guests} guests</span>
                          </div>
                        </div>

                        {/* Vendor Contact & Price */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <a href={`mailto:${booking.vendorEmail}`} className="text-sm text-teal-600 hover:text-teal-700">
                                {booking.vendorEmail}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <a href={`tel:${booking.vendorPhone}`} className="text-sm text-teal-600 hover:text-teal-700">
                                {booking.vendorPhone}
                              </a>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-lg font-semibold text-black">${booking.price.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Booking Date */}
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Booked on {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
