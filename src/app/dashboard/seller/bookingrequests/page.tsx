"use client";

import { useEffect, useState, JSX } from "react";
import { getSellerBookings, updateBookingStatus } from "@/features/services/bookings_crud";
import { createClient } from "@/shared/lib/supabase/client";
import { Button } from "@/shared/components/ui/button";
import {
  Loader2,
  Calendar,
  MapPin,
  Users,
  Clock,
  Tag,
  CheckCircle2,
  XCircle,
  Hourglass,
  FileText,
  Mail,
  Phone,
  User
} from "lucide-react";

type IncomingFilter = "all" | "booking_requests" | "declined" | "completed";

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

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

const STATUS_ICONS: Record<string, JSX.Element> = {
  pending: <Hourglass className="w-4 h-4 mr-1 inline" />,
  accepted: <CheckCircle2 className="w-4 h-4 mr-1 inline" />,
  declined: <XCircle className="w-4 h-4 mr-1 inline" />,
  completed: <CheckCircle2 className="w-4 h-4 mr-1 inline" />,
};

export default function SellerBookingRequestsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<"upcoming" | "incoming">("upcoming");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [incomingFilter, setIncomingFilter] = useState<IncomingFilter>("all");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getSellerBookings(userId)
      .then((data) => {
        setBookings(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  const handleAction = async (bookingId: string, status: "accepted" | "declined") => {
    setActionLoading(bookingId + status);
    try {
      await updateBookingStatus(bookingId, status);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status, updated_at: new Date().toISOString() } : b
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  const upcomingBookings = [...bookings]
    .filter((b) => b.status === "accepted")
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const declinedBookings = bookings.filter((b) => b.status === "declined");
  const completedBookings = bookings.filter((b) => b.status === "completed");

  const BookingImage = ({ booking }: { booking: Booking }) =>
    booking.image ? (
      <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
        <img
          src={booking.image}
          alt={booking.event_type || "Listing image"}
          className="object-cover w-full h-full"
          loading="lazy"
        />
      </div>
    ) : (
      <div className="w-32 h-32 flex-shrink-0 rounded-lg bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
        No Image
      </div>
    );

  // 4-item grid (2x2) for event meta: Date, Time, Guests, Address
  const EventMetaGrid = ({ booking }: { booking: Booking }) => (
    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-2">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-500" />
        <span className="text-gray-700 font-medium">{booking.event_date}</span>
      </div>
      <div className="flex items-center gap-2 -ml-40">
        <Clock className="w-5 h-5 text-purple-500" />
        <span className="text-gray-700 font-medium">{booking.event_time}</span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-orange-500" />
        <span className="text-gray-700">{booking.guest_count}</span>
      </div>
      <div className="flex items-center gap-2 -ml-40">
        <MapPin className="w-5 h-5 text-pink-500" />
        <span className="text-gray-700 truncate">{booking.address}</span>
      </div>
    </div>
  );

  const TopRow = ({ booking }: { booking: Booking }) => (
    <div className="flex flex-col sm:flex-row items-start gap-4">
      <BookingImage booking={booking} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-600"}`}
          >
            {STATUS_ICONS[booking.status] || <FileText className="w-4 h-4 mr-1 inline" />}
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
          <span className="ml-2 text-xs sm:text-sm text-gray-400">
            {booking.event_date ? `Event: ${new Date(booking.event_date).toLocaleDateString()}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-5 h-5 text-teal-500" />
          <span className="font-bold text-lg text-black truncate">{booking.event_type}</span>
        </div>
        <EventMetaGrid booking={booking} />
        {booking.notes && (
          <div className="text-gray-600 text-sm">
            <span className="font-medium">Notes:</span> {booking.notes}
          </div>
        )}
      </div>
    </div>
  );

  const CustomerInfo = ({ booking }: { booking: Booking }) => (
    <div className="pt-4 mt-4 border-t border-gray-100 w-full">
      <div className="font-semibold text-gray-700 mb-2">Customer Information</div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-x-10 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" />
          <span className="text-black">{booking.customer_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-indigo-500" />
          <span className="text-gray-700 break-all">{booking.customer_email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-green-500" />
          <span className="text-gray-700">{booking.customer_phone}</span>
        </div>
      </div>
    </div>
  );

  const MetaBlock = ({ booking }: { booking: Booking }) => (
    <div className="flex flex-col gap-2 items-end text-xs text-gray-500">
      <div>
        <span className="block">
          <span className="font-medium">Created:</span>{" "}
          {booking.created_at ? new Date(booking.created_at).toLocaleString() : "--"}
        </span>
        <span className="block">
          <span className="font-medium">Updated:</span>{" "}
          {booking.updated_at ? new Date(booking.updated_at).toLocaleString() : "--"}
        </span>
      </div>
      <div>
        <span className="block">
          <span className="font-medium">Booking ID:</span> {booking.id}
        </span>
      </div>
    </div>
  );

  const CardWrapper = ({
    booking,
    children,
    extraTopRight
  }: {
    booking: Booking;
    children: JSX.Element | JSX.Element[];
    extraTopRight?: JSX.Element;
  }) => (
    <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col gap-2 hover:shadow-md transition">
      {extraTopRight && (
        <div className="absolute top-4 right-4 flex gap-2 z-10">{extraTopRight}</div>
      )}
      <div className="pr-0 md:pr-48">{children}</div>
      <div className="hidden md:flex flex-col gap-2 items-end absolute right-5 bottom-5">
        <MetaBlock booking={booking} />
      </div>
      <div className="mt-4 md:hidden">
        <MetaBlock booking={booking} />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-black">Booking Requests</h1>

      <div className="flex gap-2 mb-6">
        <Button
          variant={tab === "upcoming" ? "default" : "outline"}
          className={tab === "upcoming" ? "bg-teal-600 text-white" : ""}
          onClick={() => setTab("upcoming")}
        >
          Upcoming Bookings
        </Button>
        <Button
          variant={tab === "incoming" ? "default" : "outline"}
          className={tab === "incoming" ? "bg-teal-600 text-white" : ""}
          onClick={() => setTab("incoming")}
        >
          Manage Bookings
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-gray-600 text-lg">Loading bookings...</span>
        </div>
      ) : tab === "upcoming" ? (
        <div>
          {upcomingBookings.length === 0 ? (
            <div className="p-6 bg-muted rounded-md text-center text-gray-600">
              <p>No upcoming bookings.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {upcomingBookings.map((booking) => (
                <CardWrapper key={booking.id} booking={booking}>
                  <>
                    <TopRow booking={booking} />
                    <CustomerInfo booking={booking} />
                  </>
                </CardWrapper>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex gap-2 mb-4">
            {["all", "booking_requests", "declined", "completed"].map((filter) => (
              <Button
                key={filter}
                variant={incomingFilter === filter ? "default" : "outline"}
                className={incomingFilter === filter ? "bg-teal-600 text-white" : ""}
                onClick={() => setIncomingFilter(filter as IncomingFilter)}
              >
                {filter === "all"
                  ? "All"
                  : filter === "booking_requests"
                  ? "Booking Requests"
                  : filter === "declined"
                  ? "Declined Bookings"
                  : "Completed Bookings"}
              </Button>
            ))}
          </div>

          {(incomingFilter === "all" || incomingFilter === "booking_requests") && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-3">Booking Requests</h2>
              {pendingBookings.length === 0 ? (
                <div className="p-6 bg-muted rounded-md text-center text-gray-600">
                  <p>No pending booking requests.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingBookings.map((booking) => (
                    <CardWrapper
                      key={booking.id}
                      booking={booking}
                      extraTopRight={
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 text-white"
                            disabled={actionLoading === booking.id + "accepted"}
                            onClick={() => handleAction(booking.id, "accepted")}
                          >
                            {actionLoading === booking.id + "accepted" ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Accept"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 text-white"
                            disabled={actionLoading === booking.id + "declined"}
                            onClick={() => handleAction(booking.id, "declined")}
                          >
                            {actionLoading === booking.id + "declined" ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Decline"
                            )}
                          </Button>
                        </>
                      }
                    >
                      <>
                        <TopRow booking={booking} />
                        <CustomerInfo booking={booking} />
                      </>
                    </CardWrapper>
                  ))}
                </div>
              )}
            </div>
          )}

          {(incomingFilter === "all" || incomingFilter === "declined") && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-3">Declined Bookings</h2>
              {declinedBookings.length === 0 ? (
                <div className="p-6 bg-muted rounded-md text-center text-gray-600">
                  <p>No declined bookings.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {declinedBookings.map((booking) => (
                    <CardWrapper key={booking.id} booking={booking}>
                      <>
                        <TopRow booking={booking} />
                        <CustomerInfo booking={booking} />
                      </>
                    </CardWrapper>
                  ))}
                </div>
              )}
            </div>
          )}

          {(incomingFilter === "all" || incomingFilter === "completed") && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Completed Bookings</h2>
              {completedBookings.length === 0 ? (
                <div className="p-6 bg-muted rounded-md text-center text-gray-600">
                  <p>No completed bookings.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {completedBookings.map((booking) => (
                    <CardWrapper key={booking.id} booking={booking}>
                      <>
                        <TopRow booking={booking} />
                        <CustomerInfo booking={booking} />
                      </>
                    </CardWrapper>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}