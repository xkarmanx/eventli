'use server'

import { createClient } from "@/shared/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Creates a Stripe Checkout Session for a given listing and boost plan.
 * @param planId The UUID of the selected boost plan.
 * @param listingId The UUID of the listing to be boosted.
 */
export async function createBoostCheckoutSession(planId: string, listingId: string) {
  const supabase = await createClient();
  // Fix: Await the headers() call
  const origin = (await headers()).get('origin') || 'http://localhost:3000';

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? origin;
  
  // 1. Authenticate the user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("Authentication error:", authError);
    return redirect('/login?error=You must be logged in to boost a listing.');
  }

  // 2. Validate the plan and listing
  const { data: plan, error: planError } = await supabase
    .from('boost_plans')
    .select('*')
    .eq('id', planId)
    .single();

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, seller_id, title')
    .eq('id', listingId)
    .single();

  if (planError || !plan) {
    throw new Error("Invalid boost plan selected.");
  }

  if (listingError || !listing) {
    throw new Error("Invalid listing selected.");
  }

  // 3. Authorize the action: ensure the user owns the listing
  if (listing.seller_id !== user.id) {
    throw new Error("Unauthorized. You can only boost your own listings.");
  }

  // 4. Create the Stripe Checkout Session
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/dashboard/seller/boosting?boost_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/dashboard/seller/boosting?boost_canceled=true`,
      // 5. CRUCIAL: Pass our internal IDs to the webhook via metadata
      metadata: {
        listing_id: listing.id,
        plan_id: plan.id,
        user_id: user.id,
      },
      customer_email: user.email ?? undefined,
    });

    // 7. Redirect the user to the Stripe-hosted checkout page
    if (session.url) {
      redirect(session.url);
    } else {
      throw new Error("Could not create Stripe checkout session.");
    }
  } catch (error: any) {

    if (error.digest?.startsWith('NEXT_REDIRECT')){
      throw error;
    }
    console.error("Stripe Error:", error);
    throw new Error("Failed to connect to our payment provider.");
  }
}

/**
 * Fetches all data needed for the seller's boosting dashboard page.
 * This includes all available boost plans, the seller's own listings,
 * and any currently active boosts for those listings.
 */
export async function getBoostPageData() {
  const supabase = await createClient();

  // 1. Authenticate the user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
  return redirect('/login?error=Authentication required to access this page.');
  }

  // 2. Fetch data in parallel for efficiency
  const [plansResult, listingsResult, activeBoostsResult] = await Promise.all([
    supabase.from('boost_plans').select('*') .order('priority_level', { ascending: false }),
    supabase.from('listings').select('id, title, image_url, is_published, boost_priority, boost_expires_at').eq('seller_id', user.id),
    supabase.from('active_boosts').select('*, listings(seller_id)').eq('listings.seller_id', user.id)
  ]);

  if (plansResult.error) throw new Error(`Failed to fetch boost plans: ${plansResult.error.message}`);
  if (listingsResult.error) throw new Error(`Failed to fetch listings: ${listingsResult.error.message}`);
  if (activeBoostsResult.error) throw new Error(`Failed to fetch active boosts: ${activeBoostsResult.error.message}`);

  return {
    plans: plansResult.data,
    listings: listingsResult.data,
    activeBoosts: activeBoostsResult.data,
  };
}