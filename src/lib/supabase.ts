import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Student {
  id: string;
  name: string;
  roll_number: string;
  section: string;
  phone: string;
  email: string;
  enrollment_number: string;
  marks: number;
  result: string;
  percentage: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  otp?: string;
  otp_expiry?: string;
  created_at: string;
}

export interface RecheckRequest {
  id: string;
  student_name: string;
  phone: string;
  email: string;
  roll_number: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
}