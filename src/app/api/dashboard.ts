import { apiRequest } from "./client";

export interface DashboardMatchOverTimePoint {
  month: string;
  matches: number;
}

export interface DashboardStatsResponse {
  total_users: number;
  active_users: number;
  total_matches: number;
  pending_matchmaking_requests: number;
  total_married_count: number;
  matches_over_time: DashboardMatchOverTimePoint[];
}

export type DashboardActivityType =
  | "user_registered"
  | "match_created"
  | "matchmaking_request_created"
  | "matchmaking_request_approved"
  | "matchmaking_request_declined"
  | "user_married"
  | "user_verified";

export interface DashboardActivityUser {
  id: string;
  codename: string | null;
  full_name: string | null;
}

export interface DashboardActivity {
  id: number;
  activity_type: DashboardActivityType;
  title: string;
  description: string;
  primary_user: DashboardActivityUser | null;
  secondary_user: DashboardActivityUser | null;
  actor_user: DashboardActivityUser | null;
  metadata: string | Record<string, unknown> | null;
  created_at: string;
  activity_time_display: string;
}

export function getDashboardStats() {
  return apiRequest<DashboardStatsResponse | null>("dashboard/stats/", {
    method: "GET",
    auth: true,
  });
}

export function listDashboardActivities() {
  return apiRequest<DashboardActivity[] | null>("dashboard/activities/", {
    method: "GET",
    auth: true,
  });
}
