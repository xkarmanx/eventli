import { createClient } from "@/shared/lib/supabase/client";
import { ensureTextIsSafe } from "@/shared/lib/moderation";

// Booking status types
export type BookingStatus = "pending" | "accepted" | "declined" | "completed";

export interface CreateBookingInput {
  listing_id: string;
  customer_id: string;
  seller_id: string;
  event_date: string;      // ISO date string (YYYY-MM-DD)
  event_time: string;      // e.g. "18:00"
  guest_count: string;
  address: string;
  event_type: string;
  notes?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  image?: string; // Optional image URL
}

const supabase = createClient();

// Create a new booking request
export async function createBooking(input: CreateBookingInput) {
  // Moderate booking notes if provided
  if (input.notes && input.notes.trim()) {
    console.log(`🔍 MODERATING BOOKING NOTES: "${input.notes.substring(0, 50)}${input.notes.length > 50 ? '...' : ''}"`);
    await ensureTextIsSafe(input.notes, "booking_notes");
  }

  // Moderate event type if it's custom text
  if (input.event_type && input.event_type.trim() && !['Birthday', 'Wedding', 'Corporate', 'Funeral'].includes(input.event_type)) {
    console.log(`🔍 MODERATING CUSTOM EVENT TYPE: "${input.event_type}"`);
    await ensureTextIsSafe(input.event_type, "booking_event_type");
  }

  // Moderate address (could contain inappropriate content)
  if (input.address && input.address.trim()) {
    console.log(`🔍 MODERATING EVENT ADDRESS: "${input.address}"`);
    await ensureTextIsSafe(input.address, "booking_address");
  }

  const { data, error } = await supabase
    .from("booking_requests")
    .insert([
      {
        listing_id: input.listing_id,
        customer_id: input.customer_id,
        seller_id: input.seller_id,
        status: "pending",
        address: input.address,
        event_date: input.event_date,
        event_time: input.event_time,
        event_type: input.event_type,
        guest_count: input.guest_count,
        notes: input.notes || null,
        customer_name: input.customer_name,
        customer_email: input.customer_email,
        customer_phone: input.customer_phone,
      }
    ])
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("Booking not created (no data returned)");
  return data;
}

// Get all bookings for a seller
export async function getSellerBookings(seller_id: string) {
  const { data, error } = await supabase
    .from("booking_requests")
    .select(`
      *,
      listings (
        image_url
      )
    `)
    .eq("seller_id", seller_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((b: any) => ({
    ...b,
    image: b.listings?.image_url ?? null,
  }));
}

// Get all bookings for a customer
export async function getCustomerBookings(customer_id: string) {
  const { data, error } = await supabase
    .from("booking_requests")
    .select(`
      *,
      listings (
        image_url
      )
    `)
    .eq("customer_id", customer_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  // Map the image_url from the joined listing to the booking object
  return (data ?? []).map((b: any) => ({
    ...b,
    image: b.listings?.image_url ?? null,
  }));
}

// Update booking status (e.g., confirm, cancel, complete)
export async function updateBookingStatus(booking_id: string, status: BookingStatus) {
  const { data, error } = await supabase
    .from("booking_requests")
    .update({ status })
    .eq("id", booking_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get a single booking by ID
export async function getBookingById(booking_id: string) {
  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("id", booking_id)
    .single();

  if (error) throw error;
  return data;
}