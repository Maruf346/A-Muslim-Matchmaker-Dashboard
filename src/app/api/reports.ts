import { apiRequest } from "./client";

export interface ReportsAnalyticsResponse {
  total_users: number;
  total_matches: number;
  success_rate: number;
  conversion_rate: number;
}

export interface ReportsUserGrowthPoint {
  month: string;
  users: number;
}

export interface ReportsUserGrowthResponse {
  user_over_time: ReportsUserGrowthPoint[];
}

export interface ReportsOutcomesResponse {
  successful: number;
  in_progress: number;
  dropped: number;
  cancelled: number;
}

export interface ReportsFunnelPoint {
  status: string;
  count: number;
}

export interface ReportsFunnelResponse {
  funnel: ReportsFunnelPoint[];
}

export interface ReportsSummaryResponse {
  active_matches: number;
  avg_time_to_match: string;
  avg_time_to_marriage: string;
  most_successful_month: string;
}

export function getReportsAnalytics() {
  return apiRequest<ReportsAnalyticsResponse | null>("dashboard/analytics/", {
    method: "GET",
    auth: true,
  });
}

export function getReportsUserGrowth() {
  return apiRequest<ReportsUserGrowthResponse | null>("dashboard/usergrowth/", {
    method: "GET",
    auth: true,
  });
}

export function getReportsOutcomes() {
  return apiRequest<ReportsOutcomesResponse | null>("dashboard/outcomes/", {
    method: "GET",
    auth: true,
  });
}

export function getReportsFunnel() {
  return apiRequest<ReportsFunnelResponse | null>("dashboard/funnel/", {
    method: "GET",
    auth: true,
  });
}

export function getReportsSummary() {
  return apiRequest<ReportsSummaryResponse | null>("dashboard/summary/", {
    method: "GET",
    auth: true,
  });
}
