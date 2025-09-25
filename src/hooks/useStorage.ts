/**
 * Storage Hook - Gradual Migration Adapter
 * Provides a simple interface that can switch between localStorage and hybrid database
 */

import { useState, useEffect, useCallback } from 'react';
import { hybridDatabase } from '../services/hybridDatabase';

// Simple storage interface that works like localStorage but with hybrid backend
export function useStorage<T>(key: string, defaultValue: T, userId: string = 'demo-user') {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  // Load initial value
  useEffect(() => {
    const loadValue = async () => {
      try {
        setLoading(true);
        
        // For now, still use localStorage but prepare for hybrid migration
        // TODO: Migrate specific keys to hybrid database
        const stored = localStorage.getItem(key);
        if (stored !== null) {
          setValue(JSON.parse(stored));
        }
      } catch (error) {
        console.error(`Error loading ${key}:`, error);
        setValue(defaultValue);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key, defaultValue]);

  // Save value
  const saveValue = useCallback(async (newValue: T) => {
    try {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
      
      // TODO: Also save to hybrid database for specific keys
      // if (key === 'journal_trades') {
      //   await hybridDatabase.saveTrades(newValue as Trade[], userId);
      // }
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }, [key, userId]);

  return {
    value,
    setValue: saveValue,
    loading
  };
}

// Specific hooks for common data types
export function useTradesStorage(userId: string = 'demo-user') {
  return useStorage('journal_trades', [], userId);
}

export function useUserProfile(userId: string = 'demo-user') {
  const displayName = useStorage('display_name', 'Trading Pro', userId);
  const premiumStatus = useStorage('premium_status', 'none', userId);
  const achievements = useStorage('user_achievements', [], userId);

  return {
    displayName,
    premiumStatus,
    achievements
  };
}

export function useAppSettings(userId: string = 'demo-user') {
  return useStorage('user_settings', {
    startingPortfolio: 100,
    targetCompletions: 50,
    growthPerCompletion: 1,
    progressObject: 'beer',
    rules: []
  }, userId);
}
