/**
 * Login Request
 */
export interface LoginRequest {
  email: string;
  password: string;
  tenantId: string;
}

/**
 * Login Response
 */
export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * Register Request
 */
export interface RegisterRequest {
  email: string;
  password: string;
  tenantId: string;
  roleIds?: string[];
}

/**
 * First Login (Legacy) Request
 */
export interface FirstLoginRequest {
  login: string;
  senha: string;
  newPassword: string;
  tenantId: string;
}

/**
 * First Login Response
 */
export interface FirstLoginResponse {
  message: string;
  token: string;
  user: User;
  expiresAt: string;
}

/**
 * User
 * Represents an authenticated user
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  permissions: string[];
  createdAt?: string;
  tenantId?: string;
  tenantName?: string;
  profilePhotoUrl?: string | null;
  isActive?: boolean;
}

/**
 * Password Reset Request
 */
export interface PasswordResetRequestRequest {
  email: string;
  phone: string;
  tenantId: string;
}

/**
 * Password Reset Confirm
 */
export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}
