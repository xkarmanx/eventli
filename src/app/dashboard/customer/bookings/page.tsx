"use client";

import { useEffect, useState, JSX } from "react";
import { getCustomerBookings } from "@/features/services/bookings_crud";
import { createClient } from "@/shared/lib/supabase/client";
import { Button } from "@/shared/components/ui/button";
import { Loader2, Calendar, MapPin, Users, Clock, Tag, CheckCircle2, XCircle, Hourglass, FileText } from "lucide-react";

type BookingStatus = "all" | "pending" | "accepted" | "declined" | "completed";

interface Booking {
  id: string;
  listing_id: string;
  customer_id: string;
  seller_id: string;
  status: string;
  address: string;
  event_date: string;
  event_time: string;
  event_type: string;
  guest_count: string;
  notes?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  created_at?: string | null;
  updated_at?: string | null;
  image?: string | null;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  all: "All",
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  completed: "Completed",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-200 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

const STATUS_ICONS: Record<string, JSX.Element> = {
  pending: <Hourglass className="w-4 h-4 mr-1 inline" />,
  accepted: <CheckCircle2 className="w-4 h-4 mr-1 inline" />,
  declined: <XCircle className="w-4 h-4 mr-1 inline" />,
  completed: <CheckCircle2 className="w-4 h-4 mr-1 inline" />,
};

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filtered, setFiltered] = useState<Booking[]>([]);
  const [status, setStatus] = useState<BookingStatus>("all");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch current user
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  // Fetch bookings for this customer
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getCustomerBookings(userId)
      .then((data) => {
        setBookings(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  // Filter bookings by status, order by created_at descending
  useEffect(() => {
    let sorted = [...bookings].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    if (status === "all") {
      setFiltered(sorted);
    } else {
      setFiltered(sorted.filter((b) => b.status === status));
    }
  }, [bookings, status]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-black">My Bookings</h1>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <Button
            key={key}
            variant={status === key ? "default" : "outline"}
            className={`capitalize ${status === key ? "bg-teal-600 text-white" : ""}`}
            onClick={() => setStatus(key as BookingStatus)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-gray-600 text-lg">Loading bookings...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-6 bg-muted rounded-md text-center text-gray-600">
          <p>No bookings found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:shadow-md transition relative"
            >
              {/* Booking Image */}
              {booking.image && (
                <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={booking.image}
                    alt={booking.event_type || "Booking image"}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              {/* Left: Status & Title */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-600"}`}
                  >
                    {STATUS_ICONS[booking.status] || <FileText className="w-4 h-4 mr-1 inline" />}
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  <span className="ml-2 text-sm text-gray-400">
                    {booking.status === "pending" && booking.created_at
                      ? `Requested: ${new Date(booking.created_at).toLocaleDateString()}`
                      : booking.status === "accepted" && booking.updated_at
                      ? `Accepted: ${new Date(booking.updated_at).toLocaleDateString()}`
                      : booking.status === "declined" && booking.updated_at
                      ? `Declined: ${new Date(booking.updated_at).toLocaleDateString()}`
                      : booking.status === "completed" && booking.updated_at
                      ? `Completed: ${new Date(booking.updated_at).toLocaleDateString()}`
                      : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-5 h-5 text-teal-500" />
                  <span className="font-bold text-lg text-black truncate">{booking.event_type}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700 font-medium">{booking.event_date}</span>
                  <Clock className="w-5 h-5 text-purple-500 ml-4" />
                  <span className="text-gray-700 font-medium">{booking.event_time}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-pink-500" />
                  <span className="text-gray-700">{booking.address}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-700">{booking.guest_count}</span>
                </div>
                {booking.notes && (
                  <div className="mt-2 text-gray-600 text-sm">
                    <span className="font-medium">Notes:</span> {booking.notes}
                  </div>
                )}
              </div>
              {/* Right: Meta */}
              <div className="flex flex-col gap-2 items-end min-w-[160px] absolute right-5 bottom-5">
                <div className="text-xs text-gray-500">
                  <span className="block">
                    <span className="font-medium">Created:</span>{" "}
                    {booking.created_at ? new Date(booking.created_at).toLocaleString() : "--"}
                  </span>
                  <span className="block">
                    <span className="font-medium">Updated:</span>{" "}
                    {booking.updated_at ? new Date(booking.updated_at).toLocaleString() : "--"}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  <span className="block">
                    <span className="font-medium">Booking ID:</span> {booking.id}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

