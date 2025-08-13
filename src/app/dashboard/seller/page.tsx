"use client";

import {
  ArrowRight,
  Bell,
  CalendarDays,
  LayoutDashboard,
  ListOrdered,
  Megaphone,
  MessageSquare,
  Pencil,
  Star,
  Eye,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { createClient } from '@/shared/lib/supabase/client';
import { getListings } from '@/features/services/listing_crud';
import { getSellerBookings } from '@/features/services/bookings_crud';

// Define types for our data
interface DashboardMetrics {
  totalListings: number;
  upcomingBookings: number;
  upcomingEvents: number;
  totalViews: number;
  recentListings: any[];
  recentBookings: any[];
}

interface RecentActivity {
  id: string;
  type: 'listing_created' | 'booking_request' | 'booking_accepted' | 'booking_declined';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

export default function SellerDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUserAndData = async () => {
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (error || !session?.user) {
          console.error('Auth error:', error);
          setError('Authentication failed');
          setLoading(false);
          return;
        }

        setUser(session.user);

        // Fetch all dashboard data in parallel with timeout
        const fetchWithTimeout = (promise: Promise<any>, timeout = 10000) => {
          return Promise.race([
            promise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
          ]);
        };

        try {
          const [listingsData, bookingsData] = await Promise.all([
            fetchWithTimeout(getListings(session.user.id)),
            fetchWithTimeout(getSellerBookings(session.user.id))
          ]);

          if (!isMounted) return;

          // Calculate metrics safely
          const totalListings = Array.isArray(listingsData) ? listingsData.length : 0;
          const totalViews = Array.isArray(listingsData) 
            ? listingsData.reduce((sum, l) => sum + (l.views_count || 0), 0) 
            : 0;
          
          // Count upcoming bookings (accepted status, future event dates)
          const now = new Date();
          const upcomingBookings = Array.isArray(bookingsData)
            ? bookingsData.filter(b => 
                b.status === 'accepted' && 
                b.event_date &&
                new Date(b.event_date) > now
              ).length
            : 0;

          // Count upcoming events (same as upcoming bookings for now)
          const upcomingEvents = upcomingBookings;

          // Get recent listings (last 3)
          const recentListings = Array.isArray(listingsData)
            ? listingsData
                .filter(l => l.created_at) // Filter out items without created_at
                .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
                .slice(0, 3)
            : [];

          // Get recent bookings (last 3)
          const recentBookings = Array.isArray(bookingsData)
            ? bookingsData
                .filter(b => b.created_at) // Filter out items without created_at
                .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
                .slice(0, 3)
            : [];

          setMetrics({
            totalListings,
            upcomingBookings,
            upcomingEvents,
            totalViews,
            recentListings,
            recentBookings
          });
          
          setListings(Array.isArray(listingsData) ? listingsData.slice(0, 3) : []); // Show only top 3 in preview

          // Generate recent activity
          const activities: RecentActivity[] = [];

          // Add listing activities
          recentListings.forEach(listing => {
            if (listing.created_at) {
              activities.push({
                id: `listing-${listing.id}`,
                type: 'listing_created',
                title: 'New Listing Created',
                description: `Created "${listing.title}" ${listing.is_published ? '(Published)' : '(Draft)'}`,
                timestamp: listing.created_at,
                icon: 'plus-circle'
              });
            }
          });

          // Add booking activities
          recentBookings.forEach(booking => {
            if (booking.created_at) {
              const activityType = booking.status === 'pending' ? 'booking_request' :
                                  booking.status === 'accepted' ? 'booking_accepted' :
                                  booking.status === 'declined' ? 'booking_declined' : 'booking_request';
              
              activities.push({
                id: `booking-${booking.id}`,
                type: activityType,
                title: `Booking ${booking.status === 'pending' ? 'Request' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}`,
                description: `${booking.event_type} event request from ${booking.customer_name}`,
                timestamp: booking.updated_at || booking.created_at,
                icon: booking.status === 'accepted' ? 'check-circle' : 
                      booking.status === 'declined' ? 'x-circle' : 'clock'
              });
            }
          });

          // Sort all activities by timestamp and limit
          const sortedActivities = activities
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);

          setRecentActivity(sortedActivities);

        } catch (dataError) {
          console.error('Error fetching dashboard data:', dataError);
          setError('Failed to load dashboard data');
        }

      } catch (error) {
        console.error('Error in dashboard initialization:', error);
        setError('Failed to initialize dashboard');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserAndData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
      {/* Dashboard Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-2 sm:gap-3 text-black mb-2">
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
            <span className="text-3xl font-bold text-black">
              {loading ? '...' : metrics?.totalListings || 0}
            </span>
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
            <span className="text-3xl font-bold text-black">
              {loading ? '...' : metrics?.upcomingBookings || 0}
            </span>
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
            <span className="text-3xl font-bold text-black">
              {loading ? '...' : metrics?.upcomingEvents || 0}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Manage Listings (Preview Table) */}
      <Card className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-lg sm:text-xl font-semibold text-black">Manage Listings</CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-600">Preview of your top listings</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="block md:hidden">
            {loading ? (
              [...Array(3)].map((_, idx) => (
                <div key={idx} className="p-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              ))
            ) : listings.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No listings yet. Create your first listing to get started!
              </div>
            ) : (
              listings.map((listing) => (
                <div key={listing.id} className="p-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-black">{listing.title}</div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      listing.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {listing.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Bookings: {listing.booking_count || 0}</div>
                  <Button size="sm" variant="outline" className="w-full hover:shadow-sm transition-all duration-200">
                    <Pencil className="w-4 h-4 mr-1" /> Edit/View
                  </Button>
                </div>
              ))
            )}
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
                {loading ? (
                  [...Array(3)].map((_, idx) => (
                    <tr key={idx} className="border-b border-gray-50 last:border-b-0">
                      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div></td>
                      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></td>
                      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div></td>
                      <td className="p-4"><div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div></td>
                    </tr>
                  ))
                ) : listings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      No listings yet. Create your first listing to get started!
                    </td>
                  </tr>
                ) : (
                  listings.map((listing) => (
                    <tr key={listing.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors duration-200">
                      <td className="p-4 text-gray-600 max-w-xs truncate">{listing.title}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          listing.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {listing.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{listing.booking_count || 0}</td>
                      <td className="p-4">
                        <Link href={`/dashboard/seller/listings`}>
                          <Button size="sm" variant="outline" className="hover:shadow-sm transition-all duration-200">
                            <Pencil className="w-4 h-4 mr-1" /> Edit/View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
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
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">Recent Activity &amp; Notifications</CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-600">Stay updated with what&apos;s happening</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6">
          {loading ? (
            <ul className="space-y-3 sm:space-y-4">
              {[...Array(4)].map((_, idx) => (
                <li key={idx} className="flex items-start sm:items-center gap-3 p-3 rounded-lg">
                  <div className="p-1.5 sm:p-2 bg-gray-200 rounded-full flex-shrink-0 mt-1 sm:mt-0 animate-pulse">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                </li>
              ))}
            </ul>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity to show</p>
              <p className="text-sm">Activity will appear here as you get bookings and messages</p>
            </div>
          ) : (
            <ul className="space-y-3 sm:space-y-4">
              {recentActivity.map((activity, idx) => (
                <li key={idx} className="flex items-start sm:items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className={`p-1.5 sm:p-2 ${
                    activity.type === 'booking_request' ? 'bg-blue-50' :
                    activity.type === 'booking_accepted' ? 'bg-green-50' :
                    activity.type === 'booking_declined' ? 'bg-red-50' :
                    'bg-yellow-50'
                  } rounded-full flex-shrink-0 mt-1 sm:mt-0`}>
                    {activity.type === 'booking_request' && <Bell className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />}
                    {activity.type === 'booking_accepted' && <Bell className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />}
                    {activity.type === 'booking_declined' && <Bell className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />}
                    {activity.type === 'listing_created' && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />}
                  </div>
                  <span className="text-sm sm:text-base text-gray-700">
                    {activity.description}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
