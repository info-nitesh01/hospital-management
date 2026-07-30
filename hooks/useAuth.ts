import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { login as loginAction, logout as logoutAction } from "@/store/slices/authSlice";
import { clearUser, hydrateUserFromLogin } from "@/store/slices/userSlice";
import { TokenManager } from "@/lib/api/auth/token-manager";
import { useRouter } from "next/navigation";

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const auth = useAppSelector((state) => state.auth);

  const login = (token: string, refreshToken: string, userId?: string, hash?: string, projectId?: string | null) => {
    // Dispatch auth login
    dispatch(loginAction({ token, refreshToken, userId, hash }));

    // Store projectId in localStorage
    if (typeof window !== "undefined" && projectId) {
      localStorage.setItem("projectId", projectId);
    }

    // Hydrate user data from token
    const decodedToken = TokenManager.getDecodedToken();
    const finalUserId = userId || TokenManager.getUserId();

    if (finalUserId) {
      dispatch(hydrateUserFromLogin({
        userId: finalUserId,
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
  };

  const logout = () => {
    dispatch(logoutAction());
    dispatch(clearUser());

    // Clear projectId from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("projectId");
    }

    router.push("/login");
  };

  return {
    ...auth,
    login,
    logout,
  };
}

// Note: Route protection is now handled by middleware.ts
// The useAuthProtection hook has been removed as it's no longer needed
