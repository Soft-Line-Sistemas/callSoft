export interface User {
  id: string;
  email: string;
  nome: string;
  role?: string;
}

export function getUserFromToken(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const token = localStorage.getItem("authToken");
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
      id: decoded.userId || decoded.id,
      email: decoded.email,
      nome: decoded.nome || decoded.name,
      role: decoded.role,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("authToken");
}
