/**
 * Database Setup Utilities
 * Helper functions for database migration and setup
 */

import { databaseService } from '../services/database';

/**
 * Clear all local data and prepare for Supabase migration
 */
export const clearLocalDatabase = async (): Promise<void> => {
  try {
    await databaseService.clearLocalData();
    console.log('Local database cleared successfully');
  } catch (error) {
    console.error('Error clearing local database:', error);
    throw error;
  }
};

/**
 * Setup Supabase connection
 */
export const setupSupabase = (): boolean => {
  return databaseService.switchToSupabase();
};

/**
 * Get Supabase setup instructions
 */
export const getSupabaseInstructions = () => {
  return {
    title: 'Supabase Setup Instructions',
    steps: [
      {
        step: 1,
        title: 'Create a Supabase Project',
        description: 'Go to https://supabase.com and create a new project'
      },
      {
        step: 2,
        title: 'Get Your Project URL and API Key',
        description: 'In your Supabase dashboard, go to Settings > API to find your URL and anon public key'
      },
      {
        step: 3,
        title: 'Set Environment Variables',
        description: 'Create a .env file in your project root with:\nVITE_SUPABASE_URL=your_project_url\nVITE_SUPABASE_ANON_KEY=your_anon_key'
      },
      {
        step: 4,
        title: 'Create Database Tables',
        description: 'Run the SQL schema provided below in your Supabase SQL editor'
      }
    ],
    schema: `
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar TEXT,
  premium_status TEXT DEFAULT 'none' CHECK (premium_status IN ('none', 'trial', 'premium', 'lifetime')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferences JSONB DEFAULT '{}'::jsonb
);

-- Trades table
CREATE TABLE trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('long', 'short')),
  entry_price DECIMAL NOT NULL,
  exit_price DECIMAL,
  quantity DECIMAL NOT NULL,
  entry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_date TIMESTAMP WITH TIME ZONE,
  profit_loss DECIMAL,
  profit_loss_percent DECIMAL,
  fees DECIMAL DEFAULT 0,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  screenshots TEXT[] DEFAULT '{}',
  rule_compliant BOOLEAN DEFAULT true,
  emotions TEXT[] DEFAULT '{}',
  setup TEXT NOT NULL,
  strategy TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending')),
  ai_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress table
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  completions INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  discipline_score DECIMAL DEFAULT 0,
  total_profit_loss DECIMAL DEFAULT 0,
  win_rate DECIMAL DEFAULT 0,
  average_risk_reward DECIMAL DEFAULT 0,
  current_balance DECIMAL DEFAULT 0,
  achievements JSONB DEFAULT '[]'::jsonb,
  milestones JSONB DEFAULT '[]'::jsonb,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  next_level_progress DECIMAL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trading rules table
CREATE TABLE trading_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  conditions JSONB DEFAULT '[]'::jsonb,
  actions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT false,
  template_id UUID,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0,
  violation_count INTEGER DEFAULT 0
);

-- App settings table
CREATE TABLE app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  starting_portfolio DECIMAL NOT NULL,
  target_completions INTEGER NOT NULL,
  growth_per_completion DECIMAL NOT NULL,
  progress_object TEXT NOT NULL,
  rules JSONB DEFAULT '[]'::jsonb,
  notifications JSONB DEFAULT '{}'::jsonb,
  privacy JSONB DEFAULT '{}'::jsonb,
  trading JSONB DEFAULT '{}'::jsonb,
  ui JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_created_at ON trades(created_at);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trading_rules_user_id ON trading_rules(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own trades" ON trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON trades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trades" ON trades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trades" ON trades FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own rules" ON trading_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rules" ON trading_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rules" ON trading_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rules" ON trading_rules FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON app_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON app_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON app_settings FOR UPDATE USING (auth.uid() = user_id);
    `
  };
};
