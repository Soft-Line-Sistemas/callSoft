export interface User {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  roles?: string[];
  permissions: string[];
  profilePhotoUrl?: string | null;
  createdAt?: string;
}

export function getUserFromToken(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return null;
    }

    // Decode JWT token (simple base64 decode of payload)
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const decoded = JSON.parse(atob(payload));
    return {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      roles: decoded.roles,
      permissions: decoded.permissions || [],
      createdAt: decoded.createdAt,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("token");
}
