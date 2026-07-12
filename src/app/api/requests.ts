import { apiRequest } from "./client";

export type MatchmakingRequestStatus = "pending" | "approved" | "declined";
export type MatchmakingRequestReviewAction = "approve" | "decline";

export interface MatchmakingRequestUser {
  id: string;
  codename: string | null;
  first_name: string;
  last_name: string;
  role: string;
  gender: string | null;
  profile_picture: string | null;
  city: string | null;
  country: string | null;
  sect: string | null;
  marital_status: string | null;
  email?: string | null;
}

export interface MatchmakingRequestReviewer {
  id: string;
  codename: string | null;
}

export interface MatchmakingRequest {
  id: string;
  request_id: string;
  user: MatchmakingRequestUser;
  status: MatchmakingRequestStatus;
  pending_count: number;
  approved_count: number;
  declined_count: number;
  reviewed_at: string | null;
  created_at: string;
  admin_notes?: string | null;
  reviewed_by?: MatchmakingRequestReviewer | null;
  updated_at?: string;
}

export interface MatchmakingRequestListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MatchmakingRequest[];
}

export interface MatchmakingRequestListParams {
  end_date?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  search?: string;
  start_date?: string;
  status?: MatchmakingRequestStatus;
}

export function listMatchmakingRequests(params: MatchmakingRequestListParams = {}) {
  const searchParams = new URLSearchParams();

  const append = (key: string, value: string | number | null | undefined) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  };

  append("end_date", params.end_date);
  append("ordering", params.ordering);
  append("page", params.page);
  append("page_size", params.page_size);
  append("search", params.search);
  append("start_date", params.start_date);
  append("status", params.status);

  const query = searchParams.toString();

  return apiRequest<MatchmakingRequestListResponse | null>(
    `matchmaking/admin/requests/${query ? `?${query}` : ""}`,
    {
      method: "GET",
      auth: true,
    },
  );
}

export function reviewMatchmakingRequest(
  id: string,
  payload: {
    action: MatchmakingRequestReviewAction;
    admin_notes?: string;
  },
) {
  return apiRequest<MatchmakingRequest>(`matchmaking/admin/requests/${id}/review/`, {
    method: "PATCH",
    auth: true,
    body: payload,
  });
}
