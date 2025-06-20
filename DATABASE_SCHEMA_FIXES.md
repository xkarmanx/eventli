# Database Schema Alignment Summary

## Changes Made (with "kcs" comments)

### 1. **Signup Route (`/src/app/api/auth/signup/route.ts`)**
- **Fixed Profile Creation Schema**: Updated to match actual database schema
  - Uses `id` as primary key (matches `auth.users.id`)
  - Sets `user_id` field for compatibility  
  - Uses correct field names: `email`, `name`, `role`
  - Sets role to `'SELLER'` instead of default `'CUSTOMER'`
- **Added Redirect Response**: Returns redirect path to seller setup
- **Improved Error Handling**: Better error messages and logging

### 2. **Shared Types (`/src/shared/types/index.ts`)**
- **Updated Profile Interface**: Aligned with actual database schema
  - `id` as primary key (string, matches auth.users.id)
  - `user_id` as optional compatibility field
  - `role` as `'CUSTOMER' | 'SELLER'` (matches USER-DEFINED type)
  - All fields made optional to match nullable database columns
- **Updated Listing Interface**: 
  - Uses `user_id` field instead of `seller_id`
  - Made most fields optional to match `listings` table schema
  - Removed `updated_at` field (not in listings table)

### 3. **Listing Services**
- **Standardized Table Usage**: All services now use `listings` table (plural)
  - Updated `/src/lib/services/listing_crud.ts` to use `listings` instead of `listing`
  - Maintained consistency with `/src/shared/lib/services/listing.ts`

### 4. **Setup Organization Page (`/src/app/auth/setup-organization/page.tsx`)**
- **Fixed Profile Updates**: 
  - Uses `id` field (primary key) instead of `user_id` for WHERE clause
  - Added `updated_at` timestamp
  - Ensures role is set to `'SELLER'`

### 5. **Signup Page (`/src/app/auth/signup/page.tsx`)**
- **Enhanced Redirect Handling**: Uses redirect path from API response
- **Maintains Seller Flow**: Still redirects to `/auth/setup-organization`

## Database Schema Compliance

### Profiles Table
✅ **Fixed to match actual schema:**
- `id` (uuid, primary key, matches auth.users.id)
- `user_id` (uuid, nullable, for compatibility)
- `email` (text, nullable)
- `name` (text, nullable) 
- `role` (USER-DEFINED, default 'CUSTOMER')
- `company_name`, `company_email`, `phone_number`, etc. (all nullable)

### Listings Table
✅ **Updated to use correct table:**
- Uses `listings` table (not `listing`)
- `user_id` references auth user
- Most fields nullable as per schema

### Organizations Table
✅ **Available for future use:**
- Has `user_id` field for auth linkage
- Contains business-specific fields

## Seller-Focused Authentication Flow

### Current Flow:
1. **Signup** → Creates profile with `role: 'SELLER'`
2. **Redirects to** → `/auth/setup-organization` (seller setup)
3. **Completes Setup** → Updates profile with business details
4. **Final Redirect** → `/main/seller-dashboard`

### Login Flow:
1. **Login** → Standard auth login
2. **Success** → Returns to previous page or dashboard

## Key Benefits

1. **Schema Compliance**: All operations now match actual database structure
2. **Seller-Focused**: All flows assume seller registration/login
3. **Error Prevention**: Eliminates "column not found" errors
4. **Consistency**: Standardized table usage across services
5. **Compatibility**: Maintains both `id` and `user_id` fields for flexibility

## Next Steps (Optional)

1. **Database Cleanup**: Consider consolidating `listing` and `listings` tables
2. **RLS Policies**: Ensure Row Level Security policies use correct field names
3. **Triggers**: Add triggers to keep `id` and `user_id` in sync automatically
4. **Non-nullable**: Make `user_id` non-nullable once all records are backfilled

All authentication and database operations should now work correctly with your actual Supabase database schema.
