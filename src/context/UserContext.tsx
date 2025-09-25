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
  streak: 7,
  nextProgressPct: 0
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

  // Accumulate trade % toward next completion threshold.
  const recordTradeProgress = (gainPct: number, compliant: boolean) => {
    // Only compliant positive trades count toward progress
    if (!compliant || gainPct <= 0) return;
    const goal = settings.growthPerCompletion; // e.g., 5%
    let carry = progress.nextProgressPct + gainPct;
    let addCount = 0;
    while (carry >= goal && (progress.completions + addCount) < settings.targetCompletions) {
      carry -= goal;
      addCount += 1;
    }

    if (addCount > 0) {
      const rate = settings.growthPerCompletion / 100;
      const newCompletions = Math.min(progress.completions + addCount, settings.targetCompletions);
      // Apply compounded growth for each completion added
      const newBalance = progress.currentBalance * Math.pow(1 + rate, addCount);
      const newDiscipline = Math.min(100, progress.disciplineScore + addCount);
      const newStreak = progress.streak + 1; // per trading day; keep simple increment here
      updateProgress({
        completions: newCompletions,
        currentBalance: Number(newBalance.toFixed(2)),
        disciplineScore: newDiscipline,
        streak: newStreak,
        nextProgressPct: carry,
      });
    } else {
      updateProgress({ nextProgressPct: carry });
    }
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