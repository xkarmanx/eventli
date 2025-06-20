import { createSupabaseBrowserClient } from '@/shared/lib/database/client';
import { Listing } from '@/shared/types';

const supabase = createSupabaseBrowserClient();

export async function createListing(listing: Omit<Listing, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('listings')
    .insert([listing])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserListings(userId: string) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function updateListing(id: string, updates: Partial<Omit<Listing, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('listings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteListing(id: string) {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function uploadImage(file: File, bucket: string = 'listings') {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  return publicUrl;
}

// kvs: Default export for module compatibility
export default {};
