export const SCREEN_NAMES = {
  DASHBOARD: "dashboard",
  CLIENTS: "client",
  USERS: "users",
} as const;

export type ScreenName = typeof SCREEN_NAMES[keyof typeof SCREEN_NAMES];
