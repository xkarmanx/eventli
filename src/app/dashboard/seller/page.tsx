"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import {ListOrdered,CalendarDays,LayoutDashboard,Bell,MessageSquare,Megaphone,Star,ArrowRight,Pencil} from "lucide-react";

export default function SellerDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
      {/* Dashboard Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-2 sm:gap-3 text-gray-900 mb-2">
            <div className="p-1.5 sm:p-2 bg-blue-50 rounded-full">
              <LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8 text-teal-700" />
            </div>
            Overview
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">Monitor your business performance and activity</p>
        </div>
        <Link href="/dashboard/seller/listings">
          <Button className="w-full sm:w-auto cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-700 hover:text-white">
            <ArrowRight className="w-4 h-4 mr-2" />
            Create New Listing
          </Button>
        </Link>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors duration-300">
                <ListOrdered className="w-5 h-5 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
              </div>
              Total Listings
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">Active offerings</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-gray-900">--</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors duration-300">
                <CalendarDays className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
              </div>
              Upcoming Bookings
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">Next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-gray-900">--</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200  shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-full group-hover:bg-purple-100 transition-colors duration-300">
                <CalendarDays className="w-5 h-5 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
              </div>
              Upcoming Events
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">Scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-gray-900">--</span>
          </CardContent>
        </Card>
      </div>

      {/* Manage Listings (Preview Table) */}
      <Card className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">Manage Listings</CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-600">Preview of your top listings</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="block md:hidden">
            {[1,2,3].map((item, idx) => (
              <div key={idx} className="p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-900">--</div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">--</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Bookings: --</div>
                <Button size="sm" variant="outline" className="w-full hover:shadow-sm transition-all duration-200">
                  <Pencil className="w-4 h-4 mr-1" /> Edit/View
                </Button>
              </div>
            ))}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100 bg-gray-50">
                  <th className="p-4 font-semibold text-gray-700">Title</th>
                  <th className="p-4 font-semibold text-gray-700">Status</th>
                  <th className="p-4 font-semibold text-gray-700">Bookings</th>
                  <th className="p-4 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {[1,2,3].map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors duration-200">
                    <td className="p-4 text-gray-600">--</td>
                    <td className="p-4 text-gray-600">--</td>
                    <td className="p-4 text-gray-600">--</td>
                    <td className="p-4">
                      <Button size="sm" variant="outline" className="hover:shadow-sm transition-all duration-200">
                        <Pencil className="w-4 h-4 mr-1" /> Edit/View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50">
            <Link href="/dashboard/listings/new">
              <Button className="w-full sm:w-auto cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-700 hover:text-white">
                <ArrowRight className="w-4 h-4 mr-2" />
                Create New Listing
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activity / Notifications */}
      <Card className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">Recent Activity & Notifications</CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-600">Stay updated with what&apos;s happening</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6">
          <ul className="space-y-3 sm:space-y-4">
            <li className="flex items-start sm:items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="p-1.5 sm:p-2 bg-blue-50 rounded-full flex-shrink-0 mt-1 sm:mt-0">
                <Bell className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              <span className="text-sm sm:text-base text-gray-700">
                Booking request: <span className="text-gray-500">--</span>
              </span>
            </li>
            <li className="flex items-start sm:items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="p-1.5 sm:p-2 bg-green-50 rounded-full flex-shrink-0 mt-1 sm:mt-0">
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              </div>
              <span className="text-sm sm:text-base text-gray-700">
                Customer message: <span className="text-gray-500">--</span>
              </span>
            </li>
            <li className="flex items-start sm:items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="p-1.5 sm:p-2 bg-orange-50 rounded-full flex-shrink-0 mt-1 sm:mt-0">
                <Megaphone className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
              </div>
              <span className="text-sm sm:text-base text-gray-700">
                Platform update: <span className="text-gray-500">--</span>
              </span>
            </li>
            <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="p-2 bg-yellow-50 rounded-full">
                <Star className="w-4 h-4 text-yellow-600" />
              </div>
              <span className="text-gray-700">
                New review/rating: <span className="text-gray-500">--</span>
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
      
      {/* Ratings & Reviews */}
      <Card className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">Ratings & Reviews</CardTitle>
          <CardDescription className="text-gray-600">See how your services are performing</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-8 items-center pt-6">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Star className="text-yellow-500 w-7 h-7" fill="#EAB308" />
            </div>
            <div>
              <span className="text-3xl font-bold text-gray-900">--</span>
              <span className="text-gray-500 text-lg">/ 5</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-lg font-semibold mb-2 text-gray-900">Recent Review</div>
            <blockquote className="italic text-gray-600 border-l-4 border-yellow-300 pl-4 py-2 bg-yellow-50 rounded-r-lg">
              --
            </blockquote>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-sm text-gray-500 mb-1">Total Reviews</div>
            <div className="text-2xl font-bold text-gray-900">--</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}