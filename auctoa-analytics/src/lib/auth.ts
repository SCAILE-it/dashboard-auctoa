// Simple client-side authentication
export const AUTH_PASSWORD = process.env.NEXT_PUBLIC_AUTH_PASSWORD || "auctoa2025";
export const AUTH_STORAGE_KEY = "auctoa-auth";

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_STORAGE_KEY) === 'authenticated';
}

export function login(password: string): boolean {
  if (password === AUTH_PASSWORD) {
    localStorage.setItem(AUTH_STORAGE_KEY, 'authenticated');
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}