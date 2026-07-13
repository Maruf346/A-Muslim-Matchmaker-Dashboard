import { apiRequest } from "./client";

export type PrivateMatchmakingGenderFilter = "male" | "female";

export interface PrivateMatchmakingClient {
  id: string;
  codename: string | null;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  gender: string | null;
  subscription_plan: string | null;
  is_verified: boolean;
  date_of_birth: string | null;
  age: number | string | null;
  sect: string | null;
  city: string | null;
  country: string | null;
  profile_completion_percentage: number | string | null;
  is_active: boolean;
  deactivated_by_user?: boolean;
  is_private_matchmaking_client?: boolean;
  last_active: string | null;
  last_active_display: string | null;
  created_at: string;
}

export interface PrivateMatchmakingProspect {
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
  age: number | string | null;
  is_private_matchmaking_client: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PrivateMatchSuggestionParty {
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
  age: number | string | null;
}

export interface PrivateMatchSuggestion {
  id: string;
  private_client: PrivateMatchSuggestionParty;
  prospect: PrivateMatchSuggestionParty;
  status: string;
  client_feedback: string | null;
  client_responded_at: string | null;
  prospect_responded_at: string | null;
  created_at: string;
  updated_at: string;
}

function appendParams(searchParams: URLSearchParams, params: Record<string, string | number | undefined>) {
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    searchParams.set(key, String(value));
  });
}

export function listPrivateMatchmakingClients(params: {
  gender?: PrivateMatchmakingGenderFilter;
  page?: number;
  page_size?: number;
  search?: string;
} = {}) {
  const searchParams = new URLSearchParams();
  appendParams(searchParams, params);
  const query = searchParams.toString();

  return apiRequest<PaginatedResponse<PrivateMatchmakingClient> | PrivateMatchmakingClient[] | null>(
    `matchmaking/admin/clients/${query ? `?${query}` : ""}`,
    {
      method: "GET",
      auth: true,
    },
  );
}

export function listPrivateMatchmakingProspects(params: {
  private_client_id: string;
  page?: number;
  page_size?: number;
  search?: string;
}) {
  const searchParams = new URLSearchParams();
  appendParams(searchParams, params);
  const query = searchParams.toString();

  return apiRequest<PaginatedResponse<PrivateMatchmakingProspect> | PrivateMatchmakingProspect[] | null>(
    `private-matches/admin/prospects/${query ? `?${query}` : ""}`,
    {
      method: "GET",
      auth: true,
    },
  );
}

export function createPrivateMatchSuggestion(payload: {
  private_client_id: string;
  prospect_id: string;
}) {
  return apiRequest<PrivateMatchSuggestion>("private-matches/admin/suggestions/create/", {
    method: "POST",
    auth: true,
    body: payload,
  });
}
