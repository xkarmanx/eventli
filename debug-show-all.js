// Test script to debug the "Show All Events" issue
// This file helps identify where the problem might be

console.log("🐛 Debugging 'Show All Events' Issue");
console.log("=====================================");

console.log("\n📝 Steps to debug:");
console.log("1. Open your browser's Developer Tools (F12)");
console.log("2. Go to the Console tab");
console.log("3. Navigate to your app in mobile view");
console.log("4. Click Search button");
console.log("5. Click 'Show All Events'");
console.log("6. Watch the console for these logs:");

console.log("\n🔍 Expected log sequence:");
console.log("1. 🧹 SearchSlideSheet: handleClearAll called");
console.log("2. 🔍 SearchSlideSheet: calling onSearch with empty params");
console.log("3. 📱 MobileBottomNav: handleSearchApply called with empty params");
console.log("4. 📱 MobileBottomNav: Empty search detected, redirecting to homepage");
console.log("5. 🏠 HomePage: searchParams received: {}");
console.log("6. 🏠 HomePage: hasSearchParams: false");
console.log("7. 🏠 HomePage: Fetching all public listings");
console.log("8. 📋 getPublicListingsAsServices called");
console.log("9. 📋 getPublicListingsAsServices returning X services");

console.log("\n⚠️ If you see these issues:");
console.log("- No logs at all → JavaScript is not loading");
console.log("- Logs stop at step 4 → Navigation issue");
console.log("- 'returning 0 services' → Database has no published listings");
console.log("- Errors in console → Check the specific error message");

console.log("\n🔧 Quick fixes to try:");
console.log("1. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)");
console.log("2. Clear browser cache");
console.log("3. Check if you have any published listings in your database");
console.log("4. Make sure you're on the correct URL (should be just '/')");

console.log("\n💡 Database check:");
console.log("- Go to Supabase Dashboard");
console.log("- Open Table Editor");
console.log("- Check 'listings' table");
console.log("- Ensure some rows have is_published = true");

console.log("\n✅ Run this script and follow the debugging steps!");
