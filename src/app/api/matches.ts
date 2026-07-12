import { apiRequest } from "./client";

export type AdminMatchStatus =
  | "pending"
  | "declined"
  | "accepted"
  | "cancelled"
  | "wali_requested"
  | "wali_accepted"
  | "in_discussion"
  | "married"
  | "dropped";

export interface AdminMatchPersonSummary {
  id: string;
  codename: string | null;
  full_name: string | null;
  gender: string | null;
  phone: string | null;
  profile_picture: string | null;
}

export interface AdminMatchListItem {
  id: string;
  match_id: string;
  status: AdminMatchStatus;
  groom: AdminMatchPersonSummary;
  bride: AdminMatchPersonSummary;
  photos_revealed: boolean;
  photos_revealed_count: number;
  total_matches: number;
  in_discussion_count: number;
  married_count: number;
  dropped_count: number;
  wali_request_status: string | null;
  requested_at: string | null;
  accepted_at: string | null;
  married_at: string | null;
  dropped_at: string | null;
  created_at: string;
}

export interface AdminMatchDetail extends AdminMatchListItem {
  cancelled_by: string | null;
  cancelled_at: string | null;
  dropped_by: string | null;
  photo_request_status: string | null;
  first_photos_revealed_at: string | null;
  last_photos_revealed_at: string | null;
  wali_requested_at: string | null;
  wali_responded_at: string | null;
  in_discussion_at: string | null;
  last_status_changed_by_admin: string | null;
  updated_at: string | null;
}

export interface AdminMatchesListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminMatchListItem[];
}

export interface AdminMatchesListParams {
  end_date?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  photos_revealed?: boolean;
  recent?: boolean;
  search?: string;
  start_date?: string;
  status?: AdminMatchStatus;
}

export function listMatches(params: AdminMatchesListParams = {}) {
  const searchParams = new URLSearchParams();

  const append = (key: string, value: string | number | boolean | null | undefined) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  };

  append("end_date", params.end_date);
  append("ordering", params.ordering);
  append("page", params.page);
  append("page_size", params.page_size);
  append("photos_revealed", params.photos_revealed);
  append("recent", params.recent);
  append("search", params.search);
  append("start_date", params.start_date);
  append("status", params.status);

  const query = searchParams.toString();

  return apiRequest<AdminMatchesListResponse>(`matches/admin/matches/${query ? `?${query}` : ""}`, {
    method: "GET",
    auth: true,
  });
}

export function getMatchDetail(id: string) {
  return apiRequest<AdminMatchDetail>(`matches/admin/matches/${id}/`, {
    method: "GET",
    auth: true,
  });
}

export function overrideMatchStatus(id: string, status: AdminMatchStatus) {
  return apiRequest<AdminMatchDetail>(`matches/admin/matches/${id}/override-status/`, {
    method: "PATCH",
    auth: true,
    body: { status },
  });
}
