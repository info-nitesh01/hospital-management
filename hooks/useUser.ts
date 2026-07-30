import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  setUser,
  updateUser,
  clearUser,
  hydrateUserFromLogin,
  type UserData,
} from "@/store/slices/userSlice";

export function useUser() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.user);

  const setUserData = (userData: UserData) => {
    dispatch(setUser(userData));
  };

  const updateUserData = (userData: Partial<UserData>) => {
    dispatch(updateUser(userData));
  };

  const clearUserData = () => {
    dispatch(clearUser());
  };

  const hydrateUser = (data: {
    userId: string;
    hash?: string;
    projectId?: string | null;
    decodedToken?: {
      email?: string;
      name?: string;
      role?: string | string[];
      username?: string;
    };
  }) => {
    dispatch(hydrateUserFromLogin(data));
  };

  return {
    user,
    isLoading,
    setUserData,
    updateUserData,
    clearUserData,
    hydrateUser,
  };
}
