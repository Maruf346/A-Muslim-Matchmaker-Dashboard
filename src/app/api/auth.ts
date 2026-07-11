import type { AdminRole, AuthUser } from "../lib/authStorage";
import { apiRequest } from "./client";

export interface AdminLoginStep1Request {
  email: string;
  password: string;
}

export interface AdminLoginStep1Response {
  message: string;
  email: string;
  expires_in_seconds: number;
}

export interface AdminLoginVerifyRequest {
  email: string;
  otp: string;
}

export interface AdminLoginVerifyResponse {
  message: string;
  admin_type: AdminRole;
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export function adminLoginStep1(payload: AdminLoginStep1Request) {
  return apiRequest<AdminLoginStep1Response>("user/admin/login/", {
    method: "POST",
    body: payload,
  });
}

export function adminLoginVerify(payload: AdminLoginVerifyRequest) {
  return apiRequest<AdminLoginVerifyResponse>("user/admin/login/verify/", {
    method: "POST",
    body: payload,
  });
}

export function logoutUser(refresh: string) {
  return apiRequest<void>("user/logout/", {
    method: "POST",
    auth: true,
    body: { refresh },
  });
}
