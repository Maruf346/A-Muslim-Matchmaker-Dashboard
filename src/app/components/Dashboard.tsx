import { useEffect, useMemo, useState } from "react";
import { Users, UserCheck, Heart, MessageSquare, Phone, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  getDashboardStats,
  listDashboardActivities,
  type DashboardActivity,
  type DashboardActivitiesResponse,
  type DashboardActivityType,
} from "../api/dashboard";
import { ApiError } from "../api/errors";

const DEFAULT_CHART_DATA = [
  { month: "Jan", matches: 0 },
  { month: "Feb", matches: 0 },
  { month: "Mar", matches: 0 },
  { month: "Apr", matches: 0 },
  { month: "May", matches: 0 },
  { month: "Jun", matches: 0 },
];

const ACTIVITY_PAGE_SIZE = 5;

function getUserLabel(user: DashboardActivity["primary_user"]) {
  if (!user) return "";
  return user.full_name?.trim() || user.codename || "";
}

function getActivityDisplay(activity: DashboardActivity) {
  const primary = getUserLabel(activity.primary_user);
  const secondary = getUserLabel(activity.secondary_user);

  switch (activity.activity_type) {
    case "match_created":
    case "user_married":
      return {
        type: "match",
        name: [primary, secondary].filter(Boolean).join(" & ") || "Match update",
        action: activity.title || activity.description,
      };
    case "matchmaking_request_created":
    case "matchmaking_request_approved":
    case "matchmaking_request_declined":
      return {
        type: "request",
        name: primary || "Matchmaking request",
        action: activity.title || activity.description,
      };
    case "user_registered":
    case "user_verified":
    default:
      return {
        type: "user",
        name: primary || "User activity",
        action: activity.title || activity.description,
      };
  }
}

function isDashboardStatsResponse(
  value: unknown,
): value is {
  total_users?: number | null;
  active_users?: number | null;
  total_matches?: number | null;
  pending_matchmaking_requests?: number | null;
  total_married_count?: number | null;
  matches_over_time?: Array<{ month?: string | null; matches?: number | null }> | null;
} {
  return Boolean(value) && typeof value === "object";
}

function isDashboardActivitiesResponse(value: unknown): value is DashboardActivity[] {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    "results" in value &&
    Array.isArray((value as DashboardActivitiesResponse).results)
  );
}

export function Dashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    total_matches: 0,
    pending_matchmaking_requests: 0,
    total_married_count: 0,
  });
  const [chartData, setChartData] = useState(DEFAULT_CHART_DATA);
  const [recentActivity, setRecentActivity] = useState<DashboardActivity[]>([]);
  const [activityCount, setActivityCount] = useState(0);
  const [activityPage, setActivityPage] = useState(1);
  const [activityHasNextPage, setActivityHasNextPage] = useState(false);
  const [activityHasPreviousPage, setActivityHasPreviousPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        let statsResponse = await getDashboardStats();
        if (statsResponse === null) {
          statsResponse = await getDashboardStats();
        }

        let activitiesResponse = await listDashboardActivities({
          page: activityPage,
          pageSize: ACTIVITY_PAGE_SIZE,
        });
        if (activitiesResponse === null) {
          activitiesResponse = await listDashboardActivities({
            page: activityPage,
            pageSize: ACTIVITY_PAGE_SIZE,
          });
        }

        if (cancelled) return;

        const normalizedStats = isDashboardStatsResponse(statsResponse)
          ? {
              total_users: typeof statsResponse.total_users === "number" ? statsResponse.total_users : 0,
              active_users: typeof statsResponse.active_users === "number" ? statsResponse.active_users : 0,
              total_matches: typeof statsResponse.total_matches === "number" ? statsResponse.total_matches : 0,
              pending_matchmaking_requests:
                typeof statsResponse.pending_matchmaking_requests === "number"
                  ? statsResponse.pending_matchmaking_requests
                  : 0,
              total_married_count:
                typeof statsResponse.total_married_count === "number" ? statsResponse.total_married_count : 0,
            }
          : {
              total_users: 0,
              active_users: 0,
              total_matches: 0,
              pending_matchmaking_requests: 0,
              total_married_count: 0,
            };

        const normalizedChartData =
          isDashboardStatsResponse(statsResponse) && Array.isArray(statsResponse.matches_over_time)
            ? statsResponse.matches_over_time.map((item) => ({
                month: item.month || "",
                matches: typeof item.matches === "number" ? item.matches : 0,
              }))
            : DEFAULT_CHART_DATA;

        setStats(normalizedStats);
        setChartData(normalizedChartData.length > 0 ? normalizedChartData : DEFAULT_CHART_DATA);
        if (isDashboardActivitiesResponse(activitiesResponse)) {
          setRecentActivity(activitiesResponse.results);
          setActivityCount(typeof activitiesResponse.count === "number" ? activitiesResponse.count : 0);
          setActivityHasNextPage(Boolean(activitiesResponse.next));
          setActivityHasPreviousPage(Boolean(activitiesResponse.previous));
        } else {
          setRecentActivity([]);
          setActivityCount(0);
          setActivityHasNextPage(false);
          setActivityHasPreviousPage(false);
        }
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof ApiError ? err.message : "Unable to load dashboard.";
        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [activityPage, reloadIndex]);

  const statsCards = useMemo(
    () => [
      { label: "Total Users", value: stats.total_users.toLocaleString(), icon: Users, color: "bg-[#ACB5DA]" },
      { label: "Active Users", value: stats.active_users.toLocaleString(), icon: UserCheck, color: "bg-[#415192]" },
      { label: "Total Matches", value: stats.total_matches.toLocaleString(), icon: Heart, color: "bg-[#D07C84]" },
      {
        label: "Pending Requests",
        value: stats.pending_matchmaking_requests.toLocaleString(),
        icon: MessageSquare,
        color: "bg-[#ECCBCE]",
      },
      { label: "Married", value: stats.total_married_count.toLocaleString(), icon: Phone, color: "bg-[#415192]" },
    ],
    [stats],
  );

  const totalActivityPages = Math.max(1, Math.ceil(activityCount / ACTIVITY_PAGE_SIZE));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your overview</p>
      </div>

      {error && !loading ? (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
          <X className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Could not load dashboard</p>
            <p className="mt-1">{error}</p>
            <button
              onClick={() => setReloadIndex((prev) => prev + 1)}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#415192] shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
            >
              Try again
            </button>
          </div>
        </div>
      ) : null}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? <span className="inline-flex items-center"><Loader2 className="w-5 h-5 animate-spin text-[#415192]" /></span> : stat.value}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Chart & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Matches Chart */}
        <div className="lg:col-span-2 bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Matches Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Line type="monotone" dataKey="matches" stroke="#415192" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            {!loading && activityCount > 0 ? (
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-500 ring-1 ring-gray-200">
                Page {activityPage} / {totalActivityPages}
              </span>
            ) : null}
          </div>
          {loading ? (
            <div className="py-8 text-sm text-gray-500 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-[#415192]" />
              Loading activity...
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="py-8 text-sm text-gray-500">No recent activity available.</div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const display = getActivityDisplay(activity);
                return (
                  <div key={activity.id} className="flex items-start">
                    <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                      display.type === "user" ? "bg-[#ACB5DA]" :
                      display.type === "match" ? "bg-[#D07C84]" : "bg-[#ECCBCE]"
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{display.name}</p>
                      <p className="text-xs text-gray-500">{display.action}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.activity_time_display}</p>
                    </div>
                  </div>
                );
              })}
              {activityCount > ACTIVITY_PAGE_SIZE ? (
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-500">
                    Showing {(activityPage - 1) * ACTIVITY_PAGE_SIZE + 1}
                    {" - "}
                    {Math.min(activityPage * ACTIVITY_PAGE_SIZE, activityCount)} of {activityCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActivityPage((prev) => Math.max(1, prev - 1))}
                      disabled={!activityHasPreviousPage || loading}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivityPage((prev) => prev + 1)}
                      disabled={!activityHasNextPage || loading}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
