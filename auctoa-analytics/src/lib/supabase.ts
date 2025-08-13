import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for your Auctoa data structures
export interface ChatHistory {
  id: number
  session_id: string
  message: string
  timestamp: string
  user_ip: string | null
}

export interface FormResponse {
  id: number
  created_at: string
  label: string
  language: string
  response: Record<string, unknown> // JSON data
  portal: string
}

export interface PropertyRequest {
  id: string
  timestamp: string
  status: 'completed' | 'in_progress'
  address: string
  state: string
  bodenrichtwert: string
  form_data: Record<string, unknown> // JSON data
}

export interface WatchLead {
  id: string
  created_at: string
  email: string
  brand: string
  condition: string
  has_box: boolean
  has_papers: boolean
  additional_info: string
}