import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ThemeConfig,
  ThemeMode,
  defaultThemeConfig,
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
    },
    hydrateTheme: (state, action: PayloadAction<ThemeConfig>) => {
      state.config = action.payload;
      state.mounted = true;
    },
    setThemeColor: (state, action: PayloadAction<ThemeColor>) => {
      state.config.primaryColor = action.payload;
      state.config.customColor = undefined;
    },
    setCustomColor: (state, action: PayloadAction<string>) => {
      state.config.customColor = action.payload;
    },
    setButtonPrimaryColor: (state, action: PayloadAction<ThemeColor>) => {
      state.config.buttonPrimaryColor = action.payload;
      state.config.customButtonColor = undefined;
    },
    setCustomButtonColor: (state, action: PayloadAction<string>) => {
      state.config.customButtonColor = action.payload;
    },
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.config.mode = action.payload;
    },
    toggleMode: (state) => {
      state.config.mode = state.config.mode === "light" ? "dark" : "light";
    },
    setFontSize: (state, action: PayloadAction<number>) => {
      state.config.fontSize = action.payload;
    },
  },
});

export const {
  setMounted,
  setConfig,
  hydrateTheme,
  setThemeColor,
  setCustomColor,
  setButtonPrimaryColor,
  setCustomButtonColor,
  setThemeMode,
  toggleMode,
  setFontSize,
} = themeSlice.actions;

export default themeSlice.reducer;
