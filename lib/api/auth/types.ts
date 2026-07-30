/**
 * Authentication Types
 *
 * Type definitions for authentication and user management
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  token: string;
  refreshToken: string;
  hash: string;
  message: string;
  status: number;
  projectId: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  username?: string;
  showworkspace?: string;
  showvendor?: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface DecodedToken {
  sub?: string;           // Subject (usually user ID)
  email?: string;         // User email
  name?: string;          // User name
  role?: string | string[]; // User roles
  permissions?: string[]; // User permissions
  iat?: number;          // Issued at
  exp?: number;          // Expiration time
  nbf?: number;          // Not before
  iss?: string;          // Issuer
  aud?: string | string[]; // Audience
  userId?: string | number; // Alternative user ID field
  user_id?: string | number; // Alternative user ID field
  uid?: string;          // User ID (custom field)
  id?: string | number;     // Alternative user ID field
  username?: string;     // Username
  urole?: string;        // User role (custom field)
  vid?: string;          // Vendor ID
  vlogo?: string;        // Vendor logo URL
  cid?: string;          // Client ID
  clogo?: string;        // Client logo URL
  showworkspace?: string; // Show workspace flag
  showvendor?: string;    // Show vendor flag
  [key: string]: unknown; // Allow additional claims
}