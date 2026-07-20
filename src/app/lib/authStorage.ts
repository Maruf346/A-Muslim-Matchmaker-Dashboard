export type AdminRole = "superadmin" | "matchmaker";

export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: AdminRole;
  profile_picture: string | null;
  member_since: string;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  adminType: AdminRole;
  user: AuthUser;
}

const ACCESS_TOKEN_KEY = "amm_access_token";
const REFRESH_TOKEN_KEY = "amm_refresh_token";
const ADMIN_TYPE_KEY = "amm_admin_type";
const USER_KEY = "amm_user";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const segments = token.split(".");
  if (segments.length < 2) return null;

  try {
    const base64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const decoded = atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") {
    return true;
  }

  const currentUnixTime = Math.floor(Date.now() / 1000);
  return payload.exp <= currentUnixTime;
}

export function saveAuthSession(session: AuthSession): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  localStorage.setItem(ADMIN_TYPE_KEY, session.adminType);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getAdminType(): AdminRole | null {
  const value = localStorage.getItem(ADMIN_TYPE_KEY);
  if (value === "superadmin" || value === "matchmaker") return value;
  return null;
}

export function getAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getAuthSession(): AuthSession | null {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const adminType = getAdminType();
  const user = getAuthUser();

  if (!accessToken || !refreshToken || !adminType || !user) return null;

  return { accessToken, refreshToken, adminType, user };
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;

  if (isTokenExpired(token)) {
    clearAuthSession();
    return false;
  }

  return true;
}

export function isSuperAdmin(): boolean {
  return getAdminType() === "superadmin";
}

export function clearAuthSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TYPE_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("amm_auth");
}

export function getUserDisplayName(user: AuthUser | null): string {
  if (!user) return "Admin User";
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return name || user.email || "Admin User";
}

export function getUserInitials(user: AuthUser | null): string {
  if (!user) return "A";
  const first = user.first_name?.charAt(0) ?? "";
  const last = user.last_name?.charAt(0) ?? "";
  const initials = `${first}${last}`.trim();
  return initials.toUpperCase() || user.email?.charAt(0).toUpperCase() || "A";
}
