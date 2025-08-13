// Test the landing page functionality
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLandingPageData() {
  console.log('🧪 Testing Landing Page Data...\n');

  try {
    // Test 1: Get all public listings (default behavior)
    console.log('1️⃣ Testing default listing retrieval...');
    const { data: allListings, error: allError } = await supabase
      .from('listings')
      .select(`
        *,
        profiles!listings_seller_id_fkey (
          full_name
        )
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Error fetching all listings:', allError);
      return;
    }

    console.log(`✅ Successfully fetched ${allListings.length} published listings`);

    // Test 2: Test event type filtering
    console.log('\n2️⃣ Testing event type filtering...');
    const eventTypes = ['Wedding', 'Birthday', 'Corporate', 'Funeral'];
    
    for (const eventType of eventTypes) {
      const { data: filteredListings, error: filterError } = await supabase
        .from('listings')
        .select(`
          *,
          profiles!listings_seller_id_fkey (
            full_name
          )
        `)
        .eq('is_published', true)
        .eq('event_type', eventType)
        .order('created_at', { ascending: false });

      if (filterError) {
        console.error(`❌ Error filtering by ${eventType}:`, filterError);
        continue;
      }

      console.log(`✅ ${eventType}: ${filteredListings.length} listings`);
    }

    // Test 3: Show breakdown by event type
    console.log('\n3️⃣ Breakdown by event type:');
    const eventTypeCounts = {};
    allListings.forEach(listing => {
      const eventType = listing.event_type || 'Other';
      eventTypeCounts[eventType] = (eventTypeCounts[eventType] || 0) + 1;
    });

    Object.entries(eventTypeCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} listings`);
    });

    // Test 4: Verify basic listing structure
    console.log('\n4️⃣ Verifying listing structure...');
    if (allListings.length > 0) {
      const sampleListing = allListings[0];
      const requiredFields = ['id', 'title', 'description', 'price', 'location', 'event_type'];
      const missingFields = requiredFields.filter(field => !sampleListing[field]);
      
      if (missingFields.length === 0) {
        console.log('✅ All required fields present in listings');
      } else {
        console.log('⚠️ Missing fields:', missingFields);
      }
    }

    console.log('\n🎉 Landing page data test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testLandingPageData();
