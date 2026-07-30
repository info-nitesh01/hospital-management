/**
 * Theme Configuration Types and Defaults
 */

import { ThemeColor } from './theme-colors';

export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  primaryColor: ThemeColor;
  customColor?: string;
  buttonPrimaryColor?: ThemeColor;
  customButtonColor?: string;
  mode: ThemeMode;
  fontSize: number; // Font scale multiplier (0.75 - 1.5)
}

/**
 * Default theme configuration
 */
export const defaultThemeConfig: ThemeConfig = {
  primaryColor: 'blue',
  mode: 'light',
  fontSize: 1, // Default scale
};

/**
 * Local storage key for theme persistence
 */
export const THEME_STORAGE_KEY = 'app-theme-config';
