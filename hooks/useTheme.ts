import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  setConfig as setConfigAction,
  setThemeColor as setThemeColorAction,
  setCustomColor as setCustomColorAction,
  setButtonPrimaryColor as setButtonPrimaryColorAction,
  setCustomButtonColor as setCustomButtonColorAction,
  setThemeMode as setThemeModeAction,
  toggleMode as toggleModeAction,
  setFontSize as setFontSizeAction,
} from "@/store/slices/themeSlice";
import { ThemeColor } from "@/config/theme-colors";
import { ThemeMode } from "@/config/theme-config";

export function useTheme() {
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.theme.config);

  const setConfig = (nextConfig: typeof config) => {
    dispatch(setConfigAction(nextConfig));
  };

  const setThemeColor = (color: ThemeColor) => {
    dispatch(setThemeColorAction(color));
  };

  const setCustomColor = (color: string) => {
    dispatch(setCustomColorAction(color));
  };

  const setButtonPrimaryColor = (color: ThemeColor) => {
    dispatch(setButtonPrimaryColorAction(color));
  };

  const setCustomButtonColor = (color: string) => {
    dispatch(setCustomButtonColorAction(color));
  };

  const setThemeMode = (mode: ThemeMode) => {
    dispatch(setThemeModeAction(mode));
  };

  const toggleMode = () => {
    dispatch(toggleModeAction());
  };

  const setFontSize = (size: number) => {
    dispatch(setFontSizeAction(size));
  };

  return {
    config,
    setConfig,
    setThemeColor,
    setCustomColor,
    setButtonPrimaryColor,
    setCustomButtonColor,
    setThemeMode,
    toggleMode,
    setFontSize,
  };
}
