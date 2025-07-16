// Simple script to check if we have listings data
// This is just for debugging - not meant to be run

console.log("📊 Database Check Information:");
console.log("==============================");

console.log("\n🔍 To check if you have listings in your database:");
console.log("1. Go to your Supabase dashboard");
console.log("2. Navigate to the 'Table Editor'");
console.log("3. Look for the 'listings' table");
console.log("4. Check if there are any rows with 'is_published = true'");

console.log("\n📝 If you don't have any listings:");
console.log("1. Go to your app at /dashboard/seller/listings");
console.log("2. Click 'Add a Listing' to create some test data");
console.log("3. Make sure to set 'is_published' to true");

console.log("\n🎯 Required fields for a listing to show up:");
console.log("- title (required)");
console.log("- is_published = true (required)");
console.log("- seller_id (auto-filled from user)");
console.log("- price, location, event_type (optional but recommended)");

console.log("\n⚠️  Common issues:");
console.log("- Listings with is_published = false won't show");
console.log("- Make sure you're logged in as a seller to create listings");
console.log("- Check browser console for any API errors");

console.log("\n🔧 To add test data via SQL (Supabase SQL Editor):");
console.log(`
INSERT INTO public.listings (
  seller_id, title, description, price, location, 
  event_type, serving_style, num_staff, num_guests, 
  is_published, created_at
) VALUES (
  'your-user-id-here',
  'Beautiful Wedding Catering',
  'Professional catering service for your special day',
  2500.00,
  'New York, NY',
  'wedding',
  'buffet',
  5,
  50,
  true,
  NOW()
);
`);

console.log("\n✅ After adding data, refresh your homepage to see listings!");
