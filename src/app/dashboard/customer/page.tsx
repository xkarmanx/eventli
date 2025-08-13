"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { CalendarDays, Heart, MapPin, Search, Star, User } from "lucide-react";
import { createClient } from '@/shared/lib/supabase/client';
import Link from "next/link";

interface CustomerMetrics {
  totalBookings: number;
  upcomingEvents: number;
  savedListings: number;
  completedEvents: number;
}

export default function CustomerDashboardPage() {
  const [metrics, setMetrics] = useState<CustomerMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session?.user) {
          console.error('Auth error:', error);
          setLoading(false);
          return;
        }

        setUser(session.user);

        // For now, we'll use placeholder metrics since customer-specific CRUD functions 
        // would need to be implemented for customer bookings
        setMetrics({
          totalBookings: 0,
          upcomingEvents: 0,
          savedListings: 0,
          completedEvents: 0
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
      {/* Dashboard Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-2 sm:gap-3 text-black mb-2">
            <div className="p-1.5 sm:p-2 bg-blue-50 rounded-full">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-700" />
            </div>
            Welcome Back
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">Manage your bookings and discover new events</p>
        </div>
        <Link href="/">
          <Button className="w-full sm:w-auto cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
            <Search className="w-4 h-4 mr-2" />
            Browse Events
          </Button>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors duration-300">
                <CalendarDays className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
              </div>
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-black">
              {loading ? '...' : metrics?.totalBookings || 0}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors duration-300">
                <CalendarDays className="w-5 h-5 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
              </div>
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-black">
              {loading ? '...' : metrics?.upcomingEvents || 0}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-full group-hover:bg-red-100 transition-colors duration-300">
                <Heart className="w-5 h-5 text-red-600 group-hover:text-red-700 transition-colors duration-300" />
              </div>
              Saved Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-black">
              {loading ? '...' : metrics?.savedListings || 0}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-full group-hover:bg-purple-100 transition-colors duration-300">
                <Star className="w-5 h-5 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
              </div>
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-black">
              {loading ? '...' : metrics?.completedEvents || 0}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-black">Quick Actions</CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600">Common tasks and navigation</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Link href="/">
              <Button variant="outline" className="w-full justify-start">
                <Search className="w-4 h-4 mr-2" />
                Browse Events
              </Button>
            </Link>
            <Link href="/dashboard/customer/bookings">
              <Button variant="outline" className="w-full justify-start">
                <CalendarDays className="w-4 h-4 mr-2" />
                View My Bookings
              </Button>
            </Link>
            <Link href="/dashboard/customer/profile">
              <Button variant="outline" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-black">Getting Started</CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600">Tips for new customers</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Browse through our curated list of event services</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Contact service providers to discuss your event needs</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Book services and manage your events from your dashboard</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
