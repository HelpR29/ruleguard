/**
 * Supabase Database Types
 * Generated types for database schema
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          avatar?: string;
          premium_status: 'none' | 'trial' | 'premium' | 'lifetime';
          created_at: string;
          last_login_at: string;
          preferences: any;
        };
        Insert: {
          id?: string;
          email: string;
          display_name: string;
          avatar?: string;
          premium_status?: 'none' | 'trial' | 'premium' | 'lifetime';
          created_at?: string;
          last_login_at?: string;
          preferences?: any;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          avatar?: string;
          premium_status?: 'none' | 'trial' | 'premium' | 'lifetime';
          created_at?: string;
          last_login_at?: string;
          preferences?: any;
        };
      };
      trades: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          type: 'long' | 'short';
          entry_price: number;
          exit_price?: number;
          quantity: number;
          entry_date: string;
          exit_date?: string;
          profit_loss?: number;
          profit_loss_percent?: number;
          fees: number;
          notes?: string;
          tags: string[];
          screenshots: string[];
          rule_compliant: boolean;
          emotions: string[];
          setup: string;
          strategy: string;
          status: 'open' | 'closed' | 'pending';
          ai_analysis?: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          type: 'long' | 'short';
          entry_price: number;
          exit_price?: number;
          quantity: number;
          entry_date: string;
          exit_date?: string;
          profit_loss?: number;
          profit_loss_percent?: number;
          fees: number;
          notes?: string;
          tags?: string[];
          screenshots?: string[];
          rule_compliant?: boolean;
          emotions?: string[];
          setup: string;
          strategy: string;
          status?: 'open' | 'closed' | 'pending';
          ai_analysis?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symbol?: string;
          type?: 'long' | 'short';
          entry_price?: number;
          exit_price?: number;
          quantity?: number;
          entry_date?: string;
          exit_date?: string;
          profit_loss?: number;
          profit_loss_percent?: number;
          fees?: number;
          notes?: string;
          tags?: string[];
          screenshots?: string[];
          rule_compliant?: boolean;
          emotions?: string[];
          setup?: string;
          strategy?: string;
          status?: 'open' | 'closed' | 'pending';
          ai_analysis?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          completions: number;
          streak: number;
          longest_streak: number;
          discipline_score: number;
          total_profit_loss: number;
          win_rate: number;
          average_risk_reward: number;
          current_balance: number;
          achievements: any[];
          milestones: any[];
          level: number;
          experience: number;
          next_level_progress: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          completions?: number;
          streak?: number;
          longest_streak?: number;
          discipline_score?: number;
          total_profit_loss?: number;
          win_rate?: number;
          average_risk_reward?: number;
          current_balance?: number;
          achievements?: any[];
          milestones?: any[];
          level?: number;
          experience?: number;
          next_level_progress?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          completions?: number;
          streak?: number;
          longest_streak?: number;
          discipline_score?: number;
          total_profit_loss?: number;
          win_rate?: number;
          average_risk_reward?: number;
          current_balance?: number;
          achievements?: any[];
          milestones?: any[];
          level?: number;
          experience?: number;
          next_level_progress?: number;
          updated_at?: string;
        };
      };
      trading_rules: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: string;
          priority: 'low' | 'medium' | 'high' | 'critical';
          conditions: any[];
          actions: any[];
          is_active: boolean;
          is_template: boolean;
          template_id?: string;
          tags: string[];
          created_at: string;
          updated_at: string;
          usage_count: number;
          violation_count: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          category: string;
          priority?: 'low' | 'medium' | 'high' | 'critical';
          conditions?: any[];
          actions?: any[];
          is_active?: boolean;
          is_template?: boolean;
          template_id?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
          usage_count?: number;
          violation_count?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          category?: string;
          priority?: 'low' | 'medium' | 'high' | 'critical';
          conditions?: any[];
          actions?: any[];
          is_active?: boolean;
          is_template?: boolean;
          template_id?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
          usage_count?: number;
          violation_count?: number;
        };
      };
      app_settings: {
        Row: {
          id: string;
          user_id: string;
          starting_portfolio: number;
          target_completions: number;
          growth_per_completion: number;
          progress_object: string;
          rules: any[];
          notifications: any;
          privacy: any;
          trading: any;
          ui: any;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          starting_portfolio: number;
          target_completions: number;
          growth_per_completion: number;
          progress_object: string;
          rules?: any[];
          notifications?: any;
          privacy?: any;
          trading?: any;
          ui?: any;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          starting_portfolio?: number;
          target_completions?: number;
          growth_per_completion?: number;
          progress_object?: string;
          rules?: any[];
          notifications?: any;
          privacy?: any;
          trading?: any;
          ui?: any;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
