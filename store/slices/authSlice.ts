import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TokenManager, setAuthCookie, removeAuthCookie, type DecodedToken } from "@/lib/api/auth/token-manager";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  userRoles: string[];
  decodedToken: DecodedToken | null;
  isTokenExpired: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  token: null,
  userId: null,
  userEmail: null,
  userName: null,
  userRoles: [],
  decodedToken: null,
  isTokenExpired: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    setUserId: (state, action: PayloadAction<string | null>) => {
      state.userId = action.payload;
    },
    setUserEmail: (state, action: PayloadAction<string | null>) => {
      state.userEmail = action.payload;
    },
    setUserName: (state, action: PayloadAction<string | null>) => {
      state.userName = action.payload;
    },
    setUserRoles: (state, action: PayloadAction<string[]>) => {
      state.userRoles = action.payload;
    },
    setDecodedToken: (state, action: PayloadAction<DecodedToken | null>) => {
      state.decodedToken = action.payload;
    },
    setTokenExpired: (state, action: PayloadAction<boolean>) => {
      state.isTokenExpired = action.payload;
    },
    login: (
      state,
      action: PayloadAction<{
        token: string;
        refreshToken: string;
        userId?: string;
        hash?: string;
      }>
    ) => {
      const { token: newToken, refreshToken, userId: providedUserId, hash } = action.payload;

      // Store tokens
      TokenManager.setToken(newToken);
      TokenManager.setRefreshToken(refreshToken);

      // Set auth cookie for middleware route protection
      setAuthCookie();

      // Extract user information from token
      const decoded = TokenManager.getDecodedToken();
      const extractedUserId = TokenManager.getUserId();
      const extractedEmail = TokenManager.getUserEmail();
      const extractedName = TokenManager.getUserName();
      const extractedRoles = TokenManager.getUserRoles();

      // Use provided userId if available, otherwise use the one from token
      const finalUserId = providedUserId || extractedUserId;

      if (typeof window !== "undefined") {
        if (finalUserId) localStorage.setItem("userId", finalUserId);
        if (hash) localStorage.setItem("userHash", hash);
      }

      // Update state
      state.isAuthenticated = true;
      state.token = newToken;
      state.userId = finalUserId;
      state.userEmail = extractedEmail;
      state.userName = extractedName;
      state.userRoles = extractedRoles;
      state.decodedToken = decoded;
      state.isTokenExpired = false;
    },
    logout: (state) => {
      // Clear tokens
      TokenManager.clearAll();
      if (typeof window !== "undefined") {
        localStorage.removeItem("userId");
        localStorage.removeItem("userHash");
      }

      // Reset state
      state.isAuthenticated = false;
      state.token = null;
      state.userId = null;
      state.userEmail = null;
      state.userName = null;
      state.userRoles = [];
      state.decodedToken = null;
      state.isTokenExpired = false;
    },
    checkAuth: (state) => {
      const storedToken = TokenManager.getToken();

      if (storedToken && !TokenManager.isTokenExpired()) {
        // Token exists and is not expired
        const decoded = TokenManager.getDecodedToken();
        const extractedUserId = TokenManager.getUserId();
        const extractedEmail = TokenManager.getUserEmail();
        const extractedName = TokenManager.getUserName();
        const extractedRoles = TokenManager.getUserRoles();

        // Also try to get userId from localStorage if not in token
        const localUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
        const finalUserId = extractedUserId || localUserId;

        // Ensure auth cookie is set (for page refresh scenarios)
        setAuthCookie();

        state.isAuthenticated = true;
        state.token = storedToken;
        state.userId = finalUserId;
        state.userEmail = extractedEmail;
        state.userName = extractedName;
        state.userRoles = extractedRoles;
        state.decodedToken = decoded;
        state.isTokenExpired = false;
      } else {
        // No token or token is expired
        state.isAuthenticated = false;
        state.token = null;
        state.userId = null;
        state.userEmail = null;
        state.userName = null;
        state.userRoles = [];
        state.decodedToken = null;
        state.isTokenExpired = true;

        // Clear expired token and auth cookie
        if (storedToken && TokenManager.isTokenExpired()) {
          TokenManager.clearAll();
        }
        // Remove auth cookie if no valid token
        removeAuthCookie();
      }

      state.isLoading = false;
    },
  },
});

export const {
  setAuthenticated,
  setLoading,
  setToken,
  setUserId,
  setUserEmail,
  setUserName,
  setUserRoles,
  setDecodedToken,
  setTokenExpired,
  login,
  logout,
  checkAuth,
} = authSlice.actions;

export default authSlice.reducer;
