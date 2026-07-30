/**
 * Theme Color Configuration
 * Add more colors to this file as needed
 */

export type ThemeColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple';

export interface ColorScheme {
  light: {
    primary: string;
    primaryForeground: string;
  };
  dark: {
    primary: string;
    primaryForeground: string;
  };
}

/**
 * Color palette definitions
 * Each color includes light and dark mode variants
 * All values use hex color format for consistency
 */
export const themeColors: Record<ThemeColor, ColorScheme> = {
  blue: {
    light: {
      primary: '#008dff',
      primaryForeground: '#fafafa',
    },
    dark: {
      primary: '#e5e5e5',
      primaryForeground: '#0a0a0a',
    },
  },
  green: {
    light: {
      primary: '#10b981',
      primaryForeground: '#fafafa',
    },
    dark: {
      primary: '#34d399',
      primaryForeground: '#0a0a0a',
    },
  },
  yellow: {
    light: {
      primary: '#f59e0b',
      primaryForeground: '#0a0a0a',
    },
    dark: {
      primary: '#fbbf24',
      primaryForeground: '#0a0a0a',
    },
  },
  red: {
    light: {
      primary: '#ef4444',
      primaryForeground: '#fafafa',
    },
    dark: {
      primary: '#f87171',
      primaryForeground: '#0a0a0a',
    },
  },
  purple: {
    light: {
      primary: '#8b5cf6',
      primaryForeground: '#fafafa',
    },
    dark: {
      primary: '#a78bfa',
      primaryForeground: '#0a0a0a',
    },
  },
};

/**
 * Get color scheme for a specific theme color
 */
export function getColorScheme(color: ThemeColor): ColorScheme {
  return themeColors[color];
}

/**
 * Get all available theme colors
 */
export function getAvailableColors(): ThemeColor[] {
  return Object.keys(themeColors) as ThemeColor[];
}
