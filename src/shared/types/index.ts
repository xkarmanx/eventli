export interface User {
  id: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string; // Primary key, matches auth.users.id
  user_id?: string; // Additional field for compatibility
  email?: string;
  name?: string;
  role?: 'CUSTOMER' | 'SELLER'; // kcs: Updated to match actual USER-DEFINED type
  company_name?: string;
  contact_phone?: string;
  business_address?: string;
  seller_bio?: string;
  first_name?: string;
  last_name?: string;
  company_email?: string;
  phone_number?: string;
  company_address?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Listing {
  id: string;
  user_id: string; // kcs: References auth user
  title: string;
  city?: string; // kcs: Nullable in your schema
  address?: string;
  price_range?: string;
  event_type?: string;
  serving_style?: string;
  num_of_staff?: number;
  num_of_guests?: number;
  description?: string;
  image_url?: string;
  created_at: string;
  seller?: Profile;
}

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  accepted?: boolean;
}

export interface OrganizationFormData {
  firstName: string;
  lastName: string;
  companyName: string;
  companyEmail: string;
  phoneNumber: string;
  companyAddress: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Default export for module compatibility
export default {};
