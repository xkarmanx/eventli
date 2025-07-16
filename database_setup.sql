-- EventLi Core Database Setup (Profiles + Listings)
-- This file contains the minimal SQL setup for customer/seller authentication and listings
-- Run these commands in your Supabase SQL editor or PostgreSQL database

-- =============================================================================
-- 1. ENABLE ROW LEVEL SECURITY (RLS) AND CREATE EXTENSIONS
-- =============================================================================

-- Enable Row Level Security on auth.users (should already be enabled)
-- This is handled automatically by Supabase

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 2. CREATE PROFILES TABLE
-- =============================================================================

-- Drop the table if it exists (for clean setup)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create the profiles table with customer/seller roles
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('customer', 'seller')) DEFAULT 'customer',
    bio TEXT,
    phone TEXT,
    website TEXT,
    location TEXT,
    stripe_customer_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 3. CREATE FAILED LOGIN ATTEMPTS TABLE (for security)
-- =============================================================================

-- Drop the table if it exists
DROP TABLE IF EXISTS public.failed_login_attempts CASCADE;

-- Create failed login attempts table for rate limiting
CREATE TABLE public.failed_login_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET NOT NULL,
    user_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on failed_login_attempts table
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. CREATE CATEGORIES TABLE (for listings)
-- =============================================================================

-- Drop the table if it exists
DROP TABLE IF EXISTS public.categories CASCADE;

-- Create categories table for listings
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 5. CREATE LISTINGS TABLE
-- =============================================================================

-- Drop the table if it exists
DROP TABLE IF EXISTS public.listings CASCADE;

-- Create listings table (simplified events/products)
CREATE TABLE public.listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    location TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_price CHECK (price >= 0)
);

-- Enable RLS on listings table
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 6. CREATE SELLER ANALYTICS VIEW
-- =============================================================================

-- Drop the view if it exists
DROP VIEW IF EXISTS public.seller_analytics;

-- Create analytics view for sellers
CREATE VIEW public.seller_analytics AS
SELECT 
    l.seller_id,
    COUNT(l.id) as total_listings,
    COUNT(CASE WHEN l.is_published = true THEN 1 END) as published_listings,
    COUNT(CASE WHEN l.is_featured = true THEN 1 END) as featured_listings,
    SUM(l.views_count) as total_views,
    AVG(l.price) as average_price,
    MAX(l.created_at) as last_listing_date
FROM public.listings l
GROUP BY l.seller_id;

-- =============================================================================
-- 7. CREATE ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Profiles table policies
CREATE POLICY "Users can view any profile" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories table policies (public read, sellers can manage)
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Sellers can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'seller'
        )
    );

-- Listings table policies
CREATE POLICY "Anyone can view published listings" ON public.listings
    FOR SELECT USING (is_published = true);

CREATE POLICY "Sellers can view their own listings" ON public.listings
    FOR SELECT USING (seller_id = auth.uid());

CREATE POLICY "Sellers can create listings" ON public.listings
    FOR INSERT WITH CHECK (
        seller_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'seller'
        )
    );

CREATE POLICY "Sellers can update their own listings" ON public.listings
    FOR UPDATE USING (seller_id = auth.uid());

CREATE POLICY "Sellers can delete their own listings" ON public.listings
    FOR DELETE USING (seller_id = auth.uid());

-- Failed login attempts policies (admin access only)
CREATE POLICY "Service role can manage failed attempts" ON public.failed_login_attempts
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- 8. CREATE FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to update updated_at on listings
DROP TRIGGER IF EXISTS handle_updated_at_listings ON public.listings;
CREATE TRIGGER handle_updated_at_listings
    BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to increment views count
CREATE OR REPLACE FUNCTION public.increment_listing_views(listing_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.listings 
    SET views_count = views_count + 1 
    WHERE id = listing_id AND is_published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 9. INSERT DEFAULT CATEGORIES
-- =============================================================================

-- Insert default listing categories
INSERT INTO public.categories (name, description) VALUES
    ('Electronics', 'Phones, laptops, and electronic devices'),
    ('Clothing', 'Fashion, accessories, and apparel'),
    ('Home & Garden', 'Furniture, decor, and garden items'),
    ('Automotive', 'Cars, motorcycles, and auto parts'),
    ('Sports & Recreation', 'Sporting goods and recreational equipment'),
    ('Books & Media', 'Books, movies, music, and games'),
    ('Services', 'Professional and personal services'),
    ('Real Estate', 'Properties for rent or sale'),
    ('Jobs', 'Employment opportunities'),
    ('Collectibles', 'Antiques, art, and collectible items')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 10. CREATE INDEXES FOR BETTER PERFORMANCE
-- =============================================================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location);

-- Listings table indexes
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON public.listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_is_published ON public.listings(is_published);
CREATE INDEX IF NOT EXISTS idx_listings_is_featured ON public.listings(is_featured);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_location ON public.listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at);
CREATE INDEX IF NOT EXISTS idx_listings_views_count ON public.listings(views_count);

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

-- Failed login attempts indexes
CREATE INDEX IF NOT EXISTS idx_failed_attempts_ip ON public.failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_attempts_email ON public.failed_login_attempts(user_email);
CREATE INDEX IF NOT EXISTS idx_failed_attempts_created_at ON public.failed_login_attempts(created_at);

-- =============================================================================
-- 11. GRANT NECESSARY PERMISSIONS
-- =============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Grant permissions on tables
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

GRANT ALL ON public.categories TO authenticated;
GRANT SELECT ON public.categories TO anon;

GRANT ALL ON public.listings TO authenticated;
GRANT SELECT ON public.listings TO anon;

GRANT ALL ON public.failed_login_attempts TO service_role;

-- Grant permissions on views
GRANT SELECT ON public.seller_analytics TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.increment_listing_views(UUID) TO authenticated, anon;

-- =============================================================================
-- SETUP COMPLETE!
-- =============================================================================

-- Your database is now ready for the core profiles and listings system!
-- 
-- Next steps:
-- 1. Add your Supabase environment variables to .env.local:
--    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
--    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
--    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional, for admin operations)
--    NEXT_PUBLIC_SITE_URL=http://localhost:3000 (or your production URL)
-- 
-- 2. Configure OAuth providers in Supabase Dashboard:
--    - Go to Authentication > Providers
--    - Enable Google OAuth and add your credentials
--    - Set redirect URLs: http://localhost:3000/auth/callback (development)
-- 
-- 3. Test the authentication and listing flow:
--    - Sign up as customer/seller
--    - Create seller profile with bio, location, etc.
--    - Add listings with categories
--    - Test viewing published listings
--    - Test seller analytics
-- 
-- The database now supports:
-- ✅ User profiles with role-based access (customer/seller)
-- ✅ Listing management with categories and search
-- ✅ Security features (rate limiting, RLS policies)
-- ✅ Analytics views for sellers
-- ✅ Automatic profile creation on user registration
-- ✅ Data integrity constraints and triggers
-- ✅ View tracking for listings
-- ✅ Enhanced profile fields (bio, phone, website, location)
-- 
-- Core flows enabled:
-- 🔐 Customer & Seller Authentication
-- 👤 Profile Creation & Management
-- 📝 Seller Listing Creation
-- 🔍 Public Listing Browsing
-- 📊 Seller Analytics Dashboard
-- 🛡️ Row Level Security & RBAC


-- Run this in SQL Editor after creating the bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true);

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload listing images to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read access to listing images
CREATE POLICY "Anyone can view listing images" ON storage.objects
  FOR SELECT USING (bucket_id = 'listing-images');

-- Allow users to update/delete their own images
CREATE POLICY "Users can update own listing images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'listing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own listing images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'listing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );


  -- New Changes:

ALTER TABLE public.profiles
ADD COLUMN is_setup_complete BOOLEAN DEFAULT FALSE;

-- Add the missing is_setup_complete column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_setup_complete BOOLEAN DEFAULT FALSE;

-- Karman : Created a function for new users to get their metadata and autofill and also make sure sellers setup profile first.

-- Update the handle_new_user function in your database
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role, is_setup_complete)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
        CASE 
            WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'customer') = 'customer' THEN true
            ELSE false
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- [SCHEMA CHANGE] Add event_type, serving_style, num_staff, num_guests to listings
-- Added by: [Cody Tran], 2024-06-27
-- Purpose: To support event type, serving style, staff, and guest count in listings
-- =============================================================================

ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS event_type TEXT;

ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS serving_style TEXT;

ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS num_staff INTEGER;

ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS num_guests INTEGER;


-- =============================================================================
-- [SCHEMA CHANGE] Add pending_email & pending_email_requested_at column to profiles
-- Added by: [Cody Tran], 2024-07-10
-- Purpose: To store pending email for users that are updating their email
-- =============================================================================

ALTER TABLE public.profiles
ADD COLUMN pending_email TEXT,
ADD COLUMN pending_email_requested_at TIMESTAMP;


-- =============================================================================
-- [SCHEMA CHANGE] Create RLS policies for profile-avatar-images bucket in storage.objects
-- Added by: [Cody Tran], 2024-07-12
-- Purpose: 
--   To enforce row-level security for the new 'profile-avatar-images' bucket.
--   - Allows authenticated users to upload, update, and delete images in their own folder.
--   - Allows public read access to all profile avatar images.
--   This mirrors the policy structure used in the 'listing-images' bucket.
-- =============================================================================

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload profile avatars to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-avatar-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read access to profile avatars
CREATE POLICY "Anyone can view profile avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-avatar-images');

-- Allow users to update their own profile avatars
CREATE POLICY "Users can update own profile avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-avatar-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own profile avatars
CREATE POLICY "Users can delete own profile avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-avatar-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

