import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL: string = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Initialize Supabase client
const supabaseClient: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Get user by ID
 */
export async function authGetDbUser(userId: string) {
  const { data, error } = await supabaseClient
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(`Error fetching user by ID: ${error.message}`);
  }
  return data;
}

/**
 * Get user by email
 */
export async function authGetDbUserByEmail(email: string) {
  const { data, error } = await supabaseClient
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    throw new Error(`Error fetching user by email: ${error.message}`);
  }
  console.log(data);
  return data;
}

/**
 * Update user
 */
export async function authUpdateDbUser(user: Partial<{ id: string; [key: string]: any }>) {
  if (!user.id) {
    throw new Error('User ID is required to update the user.');
  }

  const { data, error } = await supabaseClient
    .from('users')
    .update(user)
    .eq('id', user.id);

  if (error) {
    throw new Error(`Error updating userrfrrrrr: ${error.message}`);
  }
  console.log(data);
  return data;
}

/**
 * Create user
 */
export async function authCreateDbUser(user: Partial<{ email: string; [key: string]: any }>) {
  const { data, error } = await supabaseClient
    .from('users')
    .insert(user)
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
  return data;
}
