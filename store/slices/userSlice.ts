import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  username?: string;
  showworkspace?: string;
  showvendor?: string;
  hash?: string;
  projectId?: string | null;
}

export interface UserState {
  user: UserData | null;
  isLoading: boolean;
}

const initialState: UserState = {
  user: null,
  isLoading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserData>) => {
      state.user = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<UserData>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearUser: (state) => {
      state.user = null;
    },
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    // Hydrate user data from login response
    hydrateUserFromLogin: (
      state,
      action: PayloadAction<{
        userId: string;
        hash?: string;
        projectId?: string | null;
        decodedToken?: {
          email?: string;
          name?: string;
          role?: string | string[];
          username?: string;
        };
      }>
    ) => {
      const { userId, hash, projectId, decodedToken } = action.payload;

      state.user = {
        id: userId,
        email: decodedToken?.email || "",
        name: decodedToken?.name || "",
        role: Array.isArray(decodedToken?.role)
          ? decodedToken.role[0]
          : decodedToken?.role || "",
        username: decodedToken?.username,
        hash,
        projectId,
      };
    },
  },
});

export const {
  setUser,
  updateUser,
  clearUser,
  setUserLoading,
  hydrateUserFromLogin,
} = userSlice.actions;

export default userSlice.reducer;
