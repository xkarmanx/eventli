// src/shared/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Role = "customer" | "seller";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          full_name: string | null
          avatar_url: string | null
          role: Role
          bio: string | null
          phone: string | null
          website: string | null
          location: string | null
          stripe_customer_id: string | null
          created_at: string | null
          is_setup_complete: boolean | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: Role
          bio?: string | null
          phone?: string | null
          website?: string | null
          location?: string | null
          stripe_customer_id?: string | null
          created_at?: string | null
          is_setup_complete?: boolean | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: Role
          bio?: string | null
          phone?: string | null
          website?: string | null
          location?: string | null
          stripe_customer_id?: string | null
          created_at?: string | null
          is_setup_complete?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      listings: {
        Row: {
          id: string
          seller_id: string
          category_id: string | null
          title: string
          description: string | null
          image_url: string | null
          price: number | null
          location: string | null
          is_published: boolean | null
          is_featured: boolean | null
          views_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          seller_id: string
          category_id?: string | null
          title: string
          description?: string | null
          image_url?: string | null
          price?: number | null
          location?: string | null
          is_published?: boolean | null
          is_featured?: boolean | null
          views_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          seller_id?: string
          category_id?: string | null
          title?: string
          description?: string | null
          image_url?: string | null
          price?: number | null
          location?: string | null
          is_published?: boolean | null
          is_featured?: boolean | null
          views_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      failed_login_attempts: {
        Row: {
          id: string
          ip_address: string
          user_email: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          ip_address: string
          user_email?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          ip_address?: string
          user_email?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      seller_analytics: {
        Row: {
          seller_id: string | null
          total_listings: number | null
          published_listings: number | null
          featured_listings: number | null
          total_views: number | null
          average_price: number | null
          last_listing_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Functions: {
      handle_new_user: {
        Args: {}
        Returns: unknown
      }
      handle_updated_at: {
        Args: {}
        Returns: unknown
      }
      increment_listing_views: {
        Args: {
          listing_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}