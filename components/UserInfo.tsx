"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TokenManager } from "@/lib/api/auth/token-manager";
import { useEffect, useState } from "react";

/**
 * Example component demonstrating how to use JWT decode functionality
 * This component displays user information extracted from the JWT token
 */
export function UserInfo() {
  const {
    isAuthenticated,
    userId,
    userEmail,
    userName,
    userRoles,
    decodedToken,
    isTokenExpired,
  } = useAuth();

  const [tokenExpiration, setTokenExpiration] = useState<Date | null>(null);

  useEffect(() => {
    // Get token expiration date
    const expDate = TokenManager.getTokenExpiration();
    setTokenExpiration(expDate);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Card className="p-4">
        <p className="text-muted-foreground">Not authenticated</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">User Information from JWT</h3>
      </div>

      <div className="space-y-3">
        {/* User ID */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">User ID:</span>
          <span className="font-mono text-sm">{userId || "Not available"}</span>
        </div>

        {/* Email */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Email:</span>
          <span className="text-sm">{userEmail || "Not available"}</span>
        </div>

        {/* Name */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Name:</span>
          <span className="text-sm">{userName || "Not available"}</span>
        </div>

        {/* Roles */}
        <div className="flex items-start justify-between">
          <span className="text-sm text-muted-foreground">Roles:</span>
          <div className="flex flex-wrap gap-1 max-w-[60%]">
            {userRoles.length > 0 ? (
              userRoles.map((role, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {role}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No roles</span>
            )}
          </div>
        </div>

        {/* Token Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Token Status:</span>
          <Badge variant={isTokenExpired ? "destructive" : "default"}>
            {isTokenExpired ? "Expired" : "Valid"}
          </Badge>
        </div>

        {/* Token Expiration */}
        {tokenExpiration && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Expires:</span>
            <span className="text-sm">
              {tokenExpiration.toLocaleString()}
            </span>
          </div>
        )}

        {/* Additional Claims */}
        {decodedToken && (
          <details className="mt-4">
            <summary className="text-sm text-muted-foreground cursor-pointer">
              View All Token Claims
            </summary>
            <div className="mt-2 p-3 bg-muted rounded-md">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(decodedToken, null, 2)}
              </pre>
            </div>
          </details>
        )}
      </div>
    </Card>
  );
}

/**
 * Example usage in your components:
 *
 * 1. Import and use the useAuth hook to access user information:
 * ```tsx
 * import { useAuth } from "@/hooks/useAuth";
 *
 * function MyComponent() {
 *   const { userEmail, userName, userRoles } = useAuth();
 *
 *   return (
 *     <div>
 *       <p>Welcome, {userName || userEmail}!</p>
 *       {userRoles.includes("admin") && <AdminPanel />}
 *     </div>
 *   );
 * }
 * ```
 *
 * 2. Use TokenManager directly for token operations:
 * ```tsx
 * import { TokenManager } from "@/lib/api/auth/token-manager";
 *
 * // Check if token is expired
 * if (TokenManager.isTokenExpired()) {
 *   console.log("Token has expired!");
 * }
 *
 * // Get specific user information
 * const userId = TokenManager.getUserId();
 * const email = TokenManager.getUserEmail();
 * const roles = TokenManager.getUserRoles();
 *
 * // Get full decoded token
 * const decodedToken = TokenManager.getDecodedToken();
 * console.log("All token claims:", decodedToken);
 * ```
 *
 * 3. Handle role-based authorization:
 * ```tsx
 * function ProtectedContent() {
 *   const { userRoles } = useAuth();
 *
 *   const hasAdminAccess = userRoles.includes("admin");
 *   const hasEditAccess = userRoles.includes("editor") || hasAdminAccess;
 *
 *   if (!hasEditAccess) {
 *     return <p>You don't have permission to view this content.</p>;
 *   }
 *
 *   return <EditableContent />;
 * }
 * ```
 */