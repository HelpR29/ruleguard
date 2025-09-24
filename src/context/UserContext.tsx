import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserSettings {
  startingPortfolio: number;
  targetCompletions: number;
  growthPerCompletion: number;
  progressObject: 'beer' | 'wine' | 'donut' | 'diamond' | 'trophy';
  rules: string[];
}

interface UserProgress {
  completions: number;
  currentBalance: number;
  disciplineScore: number;
  streak: number;
}

interface UserContextType {
  settings: UserSettings;
  progress: UserProgress;
  rules: UserRule[];
  updateSettings: (settings: Partial<UserSettings>) => void;
  updateProgress: (progress: Partial<UserProgress>) => void;
  addRule: (text: string) => void;
  editRule: (id: string, text: string) => void;
  deleteRule: (id: string) => void;
  toggleRuleActive: (id: string) => void;
  recordViolation: (id: string) => void;
}

export interface UserRule {
  id: string;
  text: string;
  active: boolean;
  violations: number;
  lastViolation: string | null;
}

const defaultSettings: UserSettings = {
  startingPortfolio: 100,
  targetCompletions: 50,
  growthPerCompletion: 1,
  progressObject: 'beer',
  rules: []
};

const defaultProgress: UserProgress = {
  completions: 12,
  currentBalance: 112.68,
  disciplineScore: 85,
  streak: 7
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const raw = localStorage.getItem('user_settings');
      if (raw) return { ...defaultSettings, ...JSON.parse(raw) } as UserSettings;
    } catch {}
    return defaultSettings;
  });

  const [rules, setRules] = useState<UserRule[]>(() => {
    try {
      const raw = localStorage.getItem('user_rules');
      if (raw) return JSON.parse(raw) as UserRule[];
      // seed from onboarding settings.rules if present
      const seeded = (settings.rules || []).map<UserRule>((text, idx) => ({
        id: `seed-${idx}-${Date.now()}`,
        text,
        active: true,
        violations: 0,
        lastViolation: null,
      }));
      if (seeded.length) localStorage.setItem('user_rules', JSON.stringify(seeded));
      return seeded;
    } catch {
      return [];
    }
  });
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const raw = localStorage.getItem('user_progress');
      if (raw) return { ...defaultProgress, ...JSON.parse(raw) } as UserProgress;
    } catch {}
    return defaultProgress;
  });

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const merged = { ...prev, ...newSettings };
      try { localStorage.setItem('user_settings', JSON.stringify(merged)); } catch {}
      return merged;
    });
  };

  const updateProgress = (newProgress: Partial<UserProgress>) => {
    setProgress(prev => {
      const merged = { ...prev, ...newProgress };
      try { localStorage.setItem('user_progress', JSON.stringify(merged)); } catch {}
      return merged;
    });
  };

  // Rules CRUD + persistence
  const persistRules = (next: UserRule[]) => {
    try { localStorage.setItem('user_rules', JSON.stringify(next)); } catch {}
  };

  const addRule = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setRules(prev => {
      const next = [...prev, { id: `${Date.now()}`, text: trimmed, active: true, violations: 0, lastViolation: null }];
      persistRules(next);
      return next;
    });
  };

  const editRule = (id: string, text: string) => {
    setRules(prev => {
      const next = prev.map(r => (r.id === id ? { ...r, text: text.trim() } : r));
      persistRules(next);
      return next;
    });
  };

  const deleteRule = (id: string) => {
    setRules(prev => {
      const next = prev.filter(r => r.id !== id);
      persistRules(next);
      return next;
    });
  };

  const toggleRuleActive = (id: string) => {
    setRules(prev => {
      const next = prev.map(r => (r.id === id ? { ...r, active: !r.active } : r));
      persistRules(next);
      return next;
    });
  };

  const recordViolation = (id: string) => {
    setRules(prev => {
      const next = prev.map(r => (r.id === id ? { ...r, violations: r.violations + 1, lastViolation: 'just now' } : r));
      persistRules(next);
      return next;
    });
    updateProgress({ disciplineScore: Math.max(0, progress.disciplineScore - 1) });
  };

  return (
    <UserContext.Provider value={{ settings, progress, rules, updateSettings, updateProgress, addRule, editRule, deleteRule, toggleRuleActive, recordViolation }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}