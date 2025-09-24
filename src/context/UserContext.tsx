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
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateProgress = (newProgress: Partial<UserProgress>) => {
    setProgress(prev => ({ ...prev, ...newProgress }));
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