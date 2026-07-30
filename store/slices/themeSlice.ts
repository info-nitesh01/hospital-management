import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ThemeConfig,
  ThemeMode,
  defaultThemeConfig,
  THEME_STORAGE_KEY,
} from "@/config/theme-config";
import { ThemeColor } from "@/config/theme-colors";

export interface ThemeState {
  config: ThemeConfig;
  mounted: boolean;
}

const initialState: ThemeState = {
  config: defaultThemeConfig,
  mounted: false,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setMounted: (state, action: PayloadAction<boolean>) => {
      state.mounted = action.payload;
    },
    setConfig: (state, action: PayloadAction<ThemeConfig>) => {
      state.config = action.payload;
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(action.payload));
      }
    },
    setThemeColor: (state, action: PayloadAction<ThemeColor>) => {
      state.config.primaryColor = action.payload;
      state.config.customColor = undefined;
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(state.config));
      }
    },
    setCustomColor: (state, action: PayloadAction<string>) => {
      state.config.customColor = action.payload;
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(state.config));
      }
    },
    setButtonPrimaryColor: (state, action: PayloadAction<ThemeColor>) => {
      state.config.buttonPrimaryColor = action.payload;
      state.config.customButtonColor = undefined;
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(state.config));
      }
    },
    setCustomButtonColor: (state, action: PayloadAction<string>) => {
      state.config.customButtonColor = action.payload;
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(state.config));
      }
    },
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.config.mode = action.payload;
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(state.config));
      }
    },
    toggleMode: (state) => {
      state.config.mode = state.config.mode === "light" ? "dark" : "light";
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(state.config));
      }
    },
    setFontSize: (state, action: PayloadAction<number>) => {
      state.config.fontSize = action.payload;
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(state.config));
      }
    },
    resetTheme: (state) => {
      state.config = defaultThemeConfig;
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(defaultThemeConfig));
      }
    },
    loadThemeFromStorage: (state) => {
      if (typeof window !== "undefined") {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          try {
            const parsed = JSON.parse(savedTheme) as ThemeConfig;
            state.config = parsed;
          } catch (error) {
            console.error("Failed to parse saved theme:", error);
          }
        }
        state.mounted = true;
      }
    },
  },
});

export const {
  setMounted,
  setConfig,
  setThemeColor,
  setCustomColor,
  setButtonPrimaryColor,
  setCustomButtonColor,
  setThemeMode,
  toggleMode,
  setFontSize,
  resetTheme,
  loadThemeFromStorage,
} = themeSlice.actions;

export default themeSlice.reducer;
