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
  // Accumulated positive trade % toward the next completion (0..growthPerCompletion)
  nextProgressPct: number;
  // ISO date string YYYY-MM-DD of last time streak was incremented
  lastStreakDate?: string | null;
}

interface UserContextType {
  settings: UserSettings;
  progress: UserProgress;
  rules: UserRule[];
  updateSettings: (settings: Partial<UserSettings>) => void;
  updateProgress: (progress: Partial<UserProgress>) => void;
  addRule: (text: string, tags?: string[]) => void;
  editRule: (id: string, text: string) => void;
  updateRuleMeta: (id: string, data: Partial<UserRule>) => void;
  deleteRule: (id: string) => void;
  toggleRuleActive: (id: string) => void;
  recordViolation: (id: string) => void;
  // Adds trade percentage toward next completion; compliant trades with positive % contribute.
  recordTradeProgress: (gainPct: number, compliant: boolean) => void;
  markCompliance: (id: string) => void;
}

export interface UserRule {
  id: string;
  text: string;
  active: boolean;
  violations: number;
  lastViolation: string | null;
  tags?: string[];
  category?: 'psychology' | 'risk' | 'entry-exit' | 'analysis' | 'discipline' | 'money';
}

const defaultSettings: UserSettings = {
  startingPortfolio: 100,
  targetCompletions: 50,
  growthPerCompletion: 1,
  progressObject: 'beer',
  rules: []
};

const defaultProgress: UserProgress = {
  completions: 0,
  currentBalance: 100, // Will be calculated from startingPortfolio
  disciplineScore: 0,
  streak: 0,
  nextProgressPct: 0,
  lastStreakDate: null
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
      if (raw) {
        const stored = JSON.parse(raw) as UserProgress;
        // Ensure currentBalance matches startingPortfolio if completions is 0
        if (stored.completions === 0) {
          stored.currentBalance = settings.startingPortfolio;
        }
        return { ...defaultProgress, ...stored };
      }
    } catch {}
    // Set currentBalance to match startingPortfolio
    return { ...defaultProgress, currentBalance: settings.startingPortfolio };
  });

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const merged = { ...prev, ...newSettings };
      try { localStorage.setItem('user_settings', JSON.stringify(merged)); } catch {}
      try { window.dispatchEvent(new CustomEvent('rg:data-change', { detail: { keys: ['user_settings'] } })); } catch {}
      return merged;
    });
  };

  // Option B: Fractional completions — award progress immediately per trade
  const recordTradeProgress = (gainPct: number, compliant: boolean) => {
    // Only compliant positive trades count toward progress
    if (!compliant || gainPct <= 0) return;
    const goal = settings.growthPerCompletion; // e.g., 5% to earn 1 completion
    if (goal <= 0) return;

    // Fractional completions earned this trade
    const inc = gainPct / goal; // e.g., 2.5% / 5% = 0.5 completion
    const rate = settings.growthPerCompletion / 100;

    // New totals (cap at targetCompletions)
    const target = settings.targetCompletions;
    const prevCompletions = progress.completions || 0;
    const rawCompletions = prevCompletions + inc;
    const newCompletions = Math.min(rawCompletions, target);

    // Compound balance proportionally by (1+rate)^inc
    const newBalance = progress.currentBalance * Math.pow(1 + rate, inc);
    // Discipline increases only on whole-completion thresholds
    const wholeAdds = Math.max(0, Math.floor(newCompletions) - Math.floor(prevCompletions));
    const newDiscipline = Math.min(100, (progress.disciplineScore || 0) + wholeAdds);
    // Streak increments at most once per calendar day
    const today = new Date().toISOString().slice(0,10);
    const shouldIncrementStreak = (progress.lastStreakDate || null) !== today;
    const newStreak = shouldIncrementStreak ? (progress.streak + 1) : progress.streak;

    // Persist fractional completions into daily_stats and activity_log
    try {
      const key = new Date().toISOString().slice(0,10);
      const stats = JSON.parse(localStorage.getItem('daily_stats') || '{}');
      const today = stats[key] || { completions: 0, violations: 0 };
      today.completions = (today.completions || 0) + inc;
      stats[key] = today;
      localStorage.setItem('daily_stats', JSON.stringify(stats));
      const log = JSON.parse(localStorage.getItem('activity_log') || '[]');
      log.push({ ts: Date.now(), type: 'completion', amount: inc });
      localStorage.setItem('activity_log', JSON.stringify(log));
      try { window.dispatchEvent(new CustomEvent('rg:data-change', { detail: { keys: ['daily_stats','activity_log'] } })); } catch {}
    } catch {}

    updateProgress({
      completions: newCompletions,
      currentBalance: newBalance, // store high precision; UI should format
      disciplineScore: newDiscipline, // integer steps only
      streak: newStreak,
      lastStreakDate: shouldIncrementStreak ? today : (progress.lastStreakDate || null),
      nextProgressPct: 0, // no longer used in fractional mode
    });
  };

  const updateProgress = (newProgress: Partial<UserProgress>) => {
    setProgress(prev => {
      const merged = { ...prev, ...newProgress };
      try { localStorage.setItem('user_progress', JSON.stringify(merged)); } catch {}
      try { window.dispatchEvent(new CustomEvent('rg:data-change', { detail: { keys: ['user_progress'] } })); } catch {}
      return merged;
    });
  };

  // Keep settings/progress in sync if changed in other parts or tabs
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === 'user_settings' && e.newValue) {
        try { setSettings(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === 'user_progress' && e.newValue) {
        try { setProgress(prev => ({ ...prev, ...JSON.parse(e.newValue as string) })); } catch {}
      }
    };
    const onCustom = () => {
      try {
        const s = JSON.parse(localStorage.getItem('user_settings') || 'null');
        if (s) setSettings((prev)=>({ ...prev, ...s }));
        const p = JSON.parse(localStorage.getItem('user_progress') || 'null');
        if (p) setProgress((prev)=>({ ...prev, ...p }));
      } catch {}
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('rg:data-change', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('rg:data-change', onCustom as EventListener);
    };
  }, []);

  // Rules CRUD + persistence
  const persistRules = (next: UserRule[]) => {
    try { localStorage.setItem('user_rules', JSON.stringify(next)); } catch {}
  };

  const addRule = (text: string, tags?: string[]) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setRules(prev => {
      const next = [...prev, { id: `${Date.now()}`, text: trimmed, active: true, violations: 0, lastViolation: null, tags: tags && tags.length ? tags : [] }];
      persistRules(next);
      return next;
    });
  };

  const editRule = (id: string, text: string) => {
    updateRuleMeta(id, { text: text.trim() });
  };

  const updateRuleMeta = (id: string, data: Partial<UserRule>) => {
    setRules(prev => {
      const next = prev.map(r => (r.id === id ? { ...r, ...data } : r));
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
    // Increment daily stats
    try {
      const key = new Date().toISOString().slice(0,10);
      const stats = JSON.parse(localStorage.getItem('daily_stats') || '{}');
      const today = stats[key] || { completions: 0, violations: 0 };
      today.violations += 1;
      stats[key] = today;
      localStorage.setItem('daily_stats', JSON.stringify(stats));
      // activity log
      const log = JSON.parse(localStorage.getItem('activity_log') || '[]');
      log.push({ ts: Date.now(), type: 'violation', ruleId: id });
      localStorage.setItem('activity_log', JSON.stringify(log));
    } catch {}
  };

  const markCompliance = (id: string) => {
    setRules(prev => {
      const next = prev.map(r => (
        r.id === id
          ? { ...r, violations: Math.max(0, r.violations - 1), lastViolation: r.violations - 1 > 0 ? r.lastViolation : null }
          : r
      ));
      persistRules(next);
      return next;
    });
    updateProgress({ disciplineScore: Math.min(100, progress.disciplineScore + 1) });
  };

  return (
    <UserContext.Provider value={{ settings, progress, rules, updateSettings, updateProgress, addRule, editRule, updateRuleMeta, deleteRule, toggleRuleActive, recordViolation, recordTradeProgress, markCompliance }}>
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