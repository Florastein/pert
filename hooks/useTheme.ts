import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark';

// Orange theme color mappings for consistent styling
export const themeColors = {
  light: {
    background: '#FFFAF3', // orange-50
    surface: '#FFFFFF',
    primary: '#F97316', // orange-500
    text: {
      primary: '#1F2937', // gray-900
      secondary: '#6B7280', // gray-500
      muted: '#9CA3AF' // gray-400
    },
    border: '#FED7AA', // orange-200
    shadow: 'rgba(249, 115, 22, 0.1)'
  },
  dark: {
    background: '#1F2937', // gray-800
    surface: '#374151', // gray-700
    primary: '#EA580C', // orange-600
    text: {
      primary: '#F9FAFB', // gray-50
      secondary: '#D1D5DB', // gray-300
      muted: '#9CA3AF' // gray-400
    },
    border: '#4B5563', // gray-600
    shadow: 'rgba(0, 0, 0, 0.3)'
  }
};

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }
    
    const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
    if (userMedia.matches) {
      return 'dark';
    }
  }
  return 'light';
};

export const useTheme = (): { theme: Theme; toggleTheme: () => void; colors: typeof themeColors.light } => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      // Set CSS custom properties for dark theme
      root.style.setProperty('--color-background', themeColors.dark.background);
      root.style.setProperty('--color-surface', themeColors.dark.surface);
      root.style.setProperty('--color-primary', themeColors.dark.primary);
      root.style.setProperty('--color-text-primary', themeColors.dark.text.primary);
      root.style.setProperty('--color-text-secondary', themeColors.dark.text.secondary);
      root.style.setProperty('--color-text-muted', themeColors.dark.text.muted);
      root.style.setProperty('--color-border', themeColors.dark.border);
      root.style.setProperty('--color-shadow', themeColors.dark.shadow);
    } else {
      root.classList.remove('dark');
      // Set CSS custom properties for light theme
      root.style.setProperty('--color-background', themeColors.light.background);
      root.style.setProperty('--color-surface', themeColors.light.surface);
      root.style.setProperty('--color-primary', themeColors.light.primary);
      root.style.setProperty('--color-text-primary', themeColors.light.text.primary);
      root.style.setProperty('--color-text-secondary', themeColors.light.text.secondary);
      root.style.setProperty('--color-text-muted', themeColors.light.text.muted);
      root.style.setProperty('--color-border', themeColors.light.border);
      root.style.setProperty('--color-shadow', themeColors.light.shadow);
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Initialize theme on mount
  useEffect(() => {
    // Force initial theme application
    const root = document.documentElement;
    const currentTheme = getInitialTheme();
    
    if (currentTheme === 'dark') {
      root.classList.add('dark');
      Object.entries(themeColors.dark).forEach(([key, value]) => {
        if (typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => {
            root.style.setProperty(`--color-${key}-${subKey}`, subValue);
          });
        } else {
          root.style.setProperty(`--color-${key}`, value);
        }
      });
    } else {
      root.classList.remove('dark');
      Object.entries(themeColors.light).forEach(([key, value]) => {
        if (typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => {
            root.style.setProperty(`--color-${key}-${subKey}`, subValue);
          });
        } else {
          root.style.setProperty(`--color-${key}`, value);
        }
      });
    }
  }, []);

  return {
    theme,
    toggleTheme,
    colors: themeColors[theme]
  };
};

// Helper hook to get current theme colors
export const useThemeColors = () => {
  const { theme } = useTheme();
  return themeColors[theme];
};

// CSS utility classes for consistent theming
export const themeClasses = {
  light: {
    bg: 'bg-orange-50',
    surface: 'bg-white',
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      muted: 'text-gray-500'
    },
    border: 'border-orange-100',
    button: {
      primary: 'bg-orange-500 hover:bg-orange-600 text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
    }
  },
  dark: {
    bg: 'bg-gray-800',
    surface: 'bg-gray-700',
    text: {
      primary: 'text-gray-100',
      secondary: 'text-gray-300',
      muted: 'text-gray-400'
    },
    border: 'border-gray-600',
    button: {
      primary: 'bg-orange-600 hover:bg-orange-700 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-500 text-gray-100'
    }
  }
};

// Utility function to get theme-aware class names
export const getThemeClasses = (theme: Theme) => themeClasses[theme];