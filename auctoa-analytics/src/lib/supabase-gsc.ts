// Supabase client specifically for Google Search Console data
import { createClient } from '@supabase/supabase-js';

const gscSupabaseUrl = process.env.NEXT_PUBLIC_GSC_SUPABASE_URL;
const gscSupabaseServiceKey = process.env.GSC_SUPABASE_SERVICE_ROLE_KEY;

if (!gscSupabaseUrl || !gscSupabaseServiceKey) {
  console.warn('GSC Supabase environment variables not configured, using fallback data');
}

// Create GSC-specific Supabase client using service role key for full permissions
export const gscSupabase = gscSupabaseUrl && gscSupabaseServiceKey 
  ? createClient(gscSupabaseUrl, gscSupabaseServiceKey)
  : null;

// GSC Table interfaces
export interface GSCRecord {
  id: number;
  created_at: string;
  daily_impressions: number;
  daily_clicks: number;
  website: string;
  date: string;
  position?: number;
  avg_position?: number;
  average_position?: number;
}

export default gscSupabase;