import { apiRequest } from "./client";

export interface RichContentResponse {
  content: string;
  updated_at: string;
}

export interface PrivacyHeaderResponse {
  title: string;
  subtitle: string;
  updated_at?: string;
}

export function getTerms() {
  return apiRequest<RichContentResponse>("supports/terms/", {
    method: "GET",
    auth: true,
  });
}

export function updateTerms(content: string) {
  return apiRequest<RichContentResponse>("supports/admin/terms/", {
    method: "PATCH",
    auth: true,
    body: { content },
  });
}

export function getPrivacy() {
  return apiRequest<RichContentResponse>("supports/privacy/", {
    method: "GET",
    auth: true,
  });
}

export function updatePrivacy(content: string) {
  return apiRequest<RichContentResponse>("supports/admin/privacy/", {
    method: "PATCH",
    auth: true,
    body: { content },
  });
}

export function getPrivacyHeader() {
  return apiRequest<PrivacyHeaderResponse>("supports/privacy-header/", {
    method: "GET",
    auth: true,
  });
}

export function updatePrivacyHeader(payload: { title: string; subtitle: string }) {
  return apiRequest<PrivacyHeaderResponse>("supports/admin/privacy-header/", {
    method: "PATCH",
    auth: true,
    body: payload,
  });
}
