import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

export type AuthContextType = {
  session: any | null;
  user: any | null;
  profile: { display_name?: string } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signUp: (email: string, password: string) => Promise<{ error?: any }>
  signOut: () => Promise<{ error?: any }>
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (user: any) => {
    if (!user) {
      setProfile(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      setProfile(data);
      // Keep localStorage in sync (for any legacy readers), but do not use it as a fallback
      try {
        if (data?.display_name) localStorage.setItem('display_name', data.display_name);
        else localStorage.removeItem('display_name');
      } catch {}
    } catch (e) {
      console.error('Error fetching profile', e);
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      await fetchProfile(data.session?.user);
      setLoading(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess ?? null);
      setUser(sess?.user ?? null);
      fetchProfile(sess?.user);
    });
    return () => { sub.subscription?.unsubscribe(); mounted = false; };
  }, []);

  const value: AuthContextType = useMemo(() => ({
    session,
    user,
    profile,
    loading,
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    },
    async signUp(email, password) {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error };
    },
    async signOut() {
      const { error } = await supabase.auth.signOut();
      return { error };
    },
    async refreshProfile() {
      await fetchProfile(user);
    }
  }), [session, user, profile, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
