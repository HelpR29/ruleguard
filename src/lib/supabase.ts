/**
 * Supabase Configuration
 * Database client setup for LockIn trading application
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Using localStorage fallback.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database connection status
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Test database connection
export const testConnection = async () => {
  try {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase not configured' };
    }

    // Test with auth.users table which should always exist
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: 'Connected to Supabase' };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
