import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface DatabaseUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'admin' | 'viewer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseLead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  contact_preference: 'phone' | 'email' | 'both';
  best_time_to_call?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'converted' | 'not_interested';
  source: string;
  score: number;
  tags: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSystemDetails {
  id: string;
  lead_id: string;
  system_size: number;
  estimated_cost: number;
  annual_savings: number;
  payback_period: number;
  panel_count: number;
  roof_area: number;
  monthly_bill: number;
  usage_kwh: number;
  address: string;
  property_type: string;
  roof_type: string;
  created_at: string;
}

export interface DatabasePricingTier {
  id: string;
  name: string;
  price_per_watt: number;
  min_system_size: number;
  max_system_size?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseLandingPage {
  id: string;
  name: string;
  slug: string;
  template: string;
  status: 'draft' | 'published' | 'archived';
  content: any;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseABTest {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  start_date?: string;
  end_date?: string;
  confidence_level: number;
  minimum_sample_size: number;
  statistical_significance: number;
  winner_variant?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseABTestVariant {
  id: string;
  test_id: string;
  name: string;
  page_id: string;
  traffic_split: number;
  views: number;
  conversions: number;
  conversion_rate: number;
  created_at: string;
  updated_at: string;
}

export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

export async function runMigrations(): Promise<void> {
  try {
    const { error } = await supabase.rpc('check_and_create_tables');
    if (error) {
      throw new DatabaseError(`Migration failed: ${error.message}`, error.code);
    }
  } catch (error) {
    throw new DatabaseError(`Migration failed: ${error}`);
  }
}