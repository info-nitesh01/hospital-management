"use client";

import { Provider } from "react-redux";
import { store } from "./index";
import { useEffect, useRef } from "react";
import { checkAuth } from "./slices/authSlice";
import { loadThemeFromStorage } from "./slices/themeSlice";
import { hydrateUserFromLogin } from "./slices/userSlice";
import { TokenManager } from "@/lib/api/auth/token-manager";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      // Initialize auth state on mount
      store.dispatch(checkAuth());

      // Load theme from localStorage
      store.dispatch(loadThemeFromStorage());

      // Hydrate user data if authenticated
      const token = TokenManager.getToken();
      if (token && !TokenManager.isTokenExpired()) {
        const decodedToken = TokenManager.getDecodedToken();
        const userId = TokenManager.getUserId();

        if (typeof window !== "undefined") {
          const hash = localStorage.getItem("userHash") || undefined;
          const projectId = localStorage.getItem("projectId") || null;

          if (userId) {
            store.dispatch(hydrateUserFromLogin({
              userId,
              hash,
              projectId,
              decodedToken: {
                email: decodedToken?.email,
                name: decodedToken?.name,
                role: decodedToken?.role,
                username: decodedToken?.username,
              },
            }));
          }
        }
      }

      initialized.current = true;
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
