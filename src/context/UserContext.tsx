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
  updateSettings: (settings: Partial<UserSettings>) => void;
  updateProgress: (progress: Partial<UserProgress>) => void;
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

  return (
    <UserContext.Provider value={{ settings, progress, updateSettings, updateProgress }}>
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