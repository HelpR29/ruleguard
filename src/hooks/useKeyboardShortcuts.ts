import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean; // Cmd on Mac, Windows key on PC
  action: () => void;
  description?: string;
  enabled?: boolean;
}

interface KeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: KeyboardShortcutsOptions) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when user is typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.contentEditable === 'true'
    ) {
      return;
    }

    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      const altMatches = !!shortcut.altKey === event.altKey;
      const metaMatches = !!shortcut.metaKey === event.metaKey;

      return keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches && shortcut.enabled !== false;
    });

    if (matchingShortcut) {
      event.preventDefault();
      event.stopPropagation();
      matchingShortcut.action();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  return {
    shortcuts: shortcuts.filter(s => s.enabled !== false)
  };
}

// Common keyboard shortcuts for trading applications
export const COMMON_TRADING_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'n',
    ctrlKey: true,
    description: 'New trade entry',
    action: () => {
      // This will be overridden by the component using the hook
      console.log('New trade shortcut triggered');
    }
  },
  {
    key: 's',
    ctrlKey: true,
    description: 'Save current form',
    action: () => {
      console.log('Save shortcut triggered');
    }
  },
  {
    key: 'j',
    ctrlKey: true,
    description: 'Go to Journal',
    action: () => {
      window.location.href = '/journal';
    }
  },
  {
    key: 'r',
    ctrlKey: true,
    description: 'Go to Rules',
    action: () => {
      window.location.href = '/rules';
    }
  },
  {
    key: 'd',
    ctrlKey: true,
    description: 'Go to Dashboard',
    action: () => {
      window.location.href = '/';
    }
  },
  {
    key: 'k',
    ctrlKey: true,
    description: 'Focus search/command palette',
    action: () => {
      // Focus search input if available
      const searchInput = document.querySelector('input[placeholder*="search" i]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
  },
  {
    key: '/',
    ctrlKey: true,
    description: 'Toggle theme',
    action: () => {
      const html = document.documentElement;
      const currentTheme = html.classList.contains('dark') ? 'light' : 'dark';
      html.classList.toggle('dark');
      localStorage.setItem('theme', currentTheme);
    }
  },
  {
    key: 'Escape',
    description: 'Close modals and dialogs',
    action: () => {
      // Close any open modals
      const modal = document.querySelector('[role="dialog"]');
      if (modal) {
        const closeButton = modal.querySelector('button[aria-label*="close" i], button:has(×)');
        if (closeButton instanceof HTMLButtonElement) {
          closeButton.click();
        }
      }
    }
  },
  {
    key: 'Enter',
    ctrlKey: true,
    description: 'Submit form',
    action: () => {
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'BUTTON' || activeElement.getAttribute('type') === 'submit')) {
        (activeElement as HTMLButtonElement).click();
      }
    }
  }
];

// Hook for displaying available shortcuts
export function useShortcutHelp(shortcuts: KeyboardShortcut[]) {
  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const parts = [];

    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.metaKey) parts.push('Cmd');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.shiftKey) parts.push('Shift');

    parts.push(shortcut.key.toUpperCase());

    return parts.join(' + ');
  };

  const getShortcutsList = () => {
    return shortcuts
      .filter(s => s.enabled !== false && s.description)
      .map(shortcut => ({
        shortcut: formatShortcut(shortcut),
        description: shortcut.description || ''
      }));
  };

  return {
    shortcuts: getShortcutsList(),
    formatShortcut
  };
}
