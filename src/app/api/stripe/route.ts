import { createClient } from "@/shared/lib/supabase/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * This API route handles incoming webhooks from Stripe.
 * It securely verifies the request and processes relevant events,
 * such as activating a listing boost after a successful payment.
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature")!;

  let event: Stripe.Event;

  // 1. Securely verify the webhook signature, as recommended by Stripe.
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error(`❌ Webhook signature verification failed:`, error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const supabase = await createClient();

  // 2. Handle the 'checkout.session.completed' event.
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { listing_id, plan_id } = session.metadata || {};

    if (!listing_id || !plan_id) {
      console.error("❌ Webhook Error: Missing metadata from checkout session.", session);
      return new NextResponse("Webhook Error: Missing metadata", { status: 400 });
    }

    try {
      // Get plan details to calculate expiration.
      const { data: plan, error: planError } = await supabase
        .from('boost_plans')
        .select('duration_days')
        .eq('id', plan_id)
        .single();

      if (planError || !plan) throw new Error(`Plan not found: ${plan_id}`);

      const activatedAt = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(activatedAt.getDate() + plan.duration_days);

      // 3. Create the 'active_boosts' record.
      // The database trigger will handle updating the 'listings' table.
      const { error: boostError } = await supabase
        .from('active_boosts')
        .insert({
          listing_id,
          plan_id,
          stripe_payment_id: session.id,
          status: 'active',
          activated_at: activatedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        });

      if (boostError) throw new Error(`Failed to create active_boost: ${boostError.message}`);

      console.log(`✅ Successfully activated boost for listing: ${listing_id}`);

    } catch (dbError: any) {
      console.error("❌ Database update failed:", dbError.message);
      return new NextResponse(`Webhook database error: ${dbError.message}`, { status: 500 });
    }
  }

  // 4. Acknowledge receipt of the event to Stripe.
  return NextResponse.json({ received: true });
}