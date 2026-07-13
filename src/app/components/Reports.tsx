import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Users, Heart, CheckCircle, Loader2, X } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  getReportsAnalytics,
  getReportsFunnel,
  getReportsOutcomes,
  getReportsSummary,
  getReportsUserGrowth,
} from "../api/reports";
import { ApiError } from "../api/errors";

const DEFAULT_USER_GROWTH_DATA = [
  { month: "Jan", users: 0 },
  { month: "Feb", users: 0 },
  { month: "Mar", users: 0 },
  { month: "Apr", users: 0 },
  { month: "May", users: 0 },
  { month: "Jun", users: 0 },
];

const DEFAULT_MATCH_SUCCESS_DATA = [
  { stage: "New", count: 0 },
  { stage: "Accepted", count: 0 },
  { stage: "In Discussion", count: 0 },
  { stage: "Dropped", count: 0 },
  { stage: "Married", count: 0 },
];

const DEFAULT_CONVERSION_DATA = [
  { name: "Successful", value: 0, color: "#415192" },
  { name: "In Progress", value: 0, color: "#ACB5DA" },
  { name: "Dropped", value: 0, color: "#D07C84" },
  { name: "Cancelled", value: 0, color: "#DC2626" },
];

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function formatPercent(value: number) {
  return `${value}%`;
}

function formatSummaryValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

const FUNNEL_LABELS: Record<string, string> = {
  new: "New",
  accepted: "Accepted",
  in_discussion: "In Discussion",
  dropped: "Dropped",
  married: "Married",
};

export function Reports() {
  const [analytics, setAnalytics] = useState({
    total_users: 0,
    total_matches: 0,
    success_rate: 0,
    conversion_rate: 0,
  });
  const [userGrowthData, setUserGrowthData] = useState(DEFAULT_USER_GROWTH_DATA);
  const [matchSuccessData, setMatchSuccessData] = useState(DEFAULT_MATCH_SUCCESS_DATA);
  const [conversionData, setConversionData] = useState(DEFAULT_CONVERSION_DATA);
  const [summary, setSummary] = useState({
    active_matches: 0,
    avg_time_to_match: "-",
    avg_time_to_marriage: "-",
    most_successful_month: "-",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchWithRetry = async <T,>(request: () => Promise<T | null>) => {
      let response = await request();
      if (response === null) {
        response = await request();
      }
      return response;
    };

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [analyticsResponse, userGrowthResponse, outcomesResponse, funnelResponse, summaryResponse] = await Promise.all([
          fetchWithRetry(getReportsAnalytics),
          fetchWithRetry(getReportsUserGrowth),
          fetchWithRetry(getReportsOutcomes),
          fetchWithRetry(getReportsFunnel),
          fetchWithRetry(getReportsSummary),
        ]);

        if (cancelled) return;

        if (isObject(analyticsResponse)) {
          setAnalytics({
            total_users: typeof analyticsResponse.total_users === "number" ? analyticsResponse.total_users : 0,
            total_matches: typeof analyticsResponse.total_matches === "number" ? analyticsResponse.total_matches : 0,
            success_rate: typeof analyticsResponse.success_rate === "number" ? analyticsResponse.success_rate : 0,
            conversion_rate: typeof analyticsResponse.conversion_rate === "number" ? analyticsResponse.conversion_rate : 0,
          });
        } else {
          setAnalytics({
            total_users: 0,
            total_matches: 0,
            success_rate: 0,
            conversion_rate: 0,
          });
        }

        if (isObject(userGrowthResponse) && Array.isArray(userGrowthResponse.user_over_time)) {
          const normalizedUserGrowth = userGrowthResponse.user_over_time.map((item) => ({
            month: typeof item?.month === "string" ? item.month : "",
            users: typeof item?.users === "number" ? item.users : 0,
          }));
          setUserGrowthData(normalizedUserGrowth.length > 0 ? normalizedUserGrowth : DEFAULT_USER_GROWTH_DATA);
        } else {
          setUserGrowthData(DEFAULT_USER_GROWTH_DATA);
        }

        if (isObject(outcomesResponse)) {
          setConversionData([
            {
              name: "Successful",
              value: typeof outcomesResponse.successful === "number" ? outcomesResponse.successful : 0,
              color: "#415192",
            },
            {
              name: "In Progress",
              value: typeof outcomesResponse.in_progress === "number" ? outcomesResponse.in_progress : 0,
              color: "#ACB5DA",
            },
            {
              name: "Dropped",
              value: typeof outcomesResponse.dropped === "number" ? outcomesResponse.dropped : 0,
              color: "#D07C84",
            },
            {
              name: "Cancelled",
              value: typeof outcomesResponse.cancelled === "number" ? outcomesResponse.cancelled : 0,
              color: "#DC2626",
            },
          ]);
        } else {
          setConversionData(DEFAULT_CONVERSION_DATA);
        }

        if (isObject(funnelResponse) && Array.isArray(funnelResponse.funnel)) {
          const funnelOrder = ["new", "accepted", "in_discussion", "dropped", "married"];
          const funnelMap = new Map(
            funnelResponse.funnel.map((item) => [
              item?.status,
              typeof item?.count === "number" ? item.count : 0,
            ]),
          );

          setMatchSuccessData(
            funnelOrder.map((status) => ({
              stage: FUNNEL_LABELS[status],
              count: funnelMap.get(status) ?? 0,
            })),
          );
        } else {
          setMatchSuccessData(DEFAULT_MATCH_SUCCESS_DATA);
        }

        if (isObject(summaryResponse)) {
          setSummary({
            active_matches: typeof summaryResponse.active_matches === "number" ? summaryResponse.active_matches : 0,
            avg_time_to_match: formatSummaryValue(summaryResponse.avg_time_to_match),
            avg_time_to_marriage: formatSummaryValue(summaryResponse.avg_time_to_marriage),
            most_successful_month: formatSummaryValue(summaryResponse.most_successful_month),
          });
        } else {
          setSummary({
            active_matches: 0,
            avg_time_to_match: "-",
            avg_time_to_marriage: "-",
            most_successful_month: "-",
          });
        }
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof ApiError ? err.message : "Unable to load reports.";
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
  }, [reloadIndex]);

  const statsCards = useMemo(
    () => [
      { label: "Total Users", value: analytics.total_users.toLocaleString(), icon: Users, color: "text-[#ACB5DA]" },
      { label: "Total Matches", value: analytics.total_matches.toLocaleString(), icon: Heart, color: "text-[#D07C84]" },
      { label: "Success Rate", value: formatPercent(analytics.success_rate), icon: CheckCircle, color: "text-[#415192]" },
      { label: "Conversion Rate", value: formatPercent(analytics.conversion_rate), icon: TrendingUp, color: "text-[#ACB5DA]" },
    ],
    [analytics],
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">View performance metrics and insights</p>
      </div>

      {error && !loading ? (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
          <X className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Could not load reports</p>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label} className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#415192]" /> : stat.value}
              </p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* User Growth */}
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">User Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#415192" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Match Success Funnel */}
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Match Success Funnel</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={matchSuccessData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="stage" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="count" fill="#415192" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Match Outcomes</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={conversionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {conversionData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="col-span-2 bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Summary Statistics</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Average Time to Match</p>
              <p className="text-2xl font-semibold text-gray-900">{loading ? "-" : summary.avg_time_to_match}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Average Time to Marriage</p>
              <p className="text-2xl font-semibold text-gray-900">{loading ? "-" : summary.avg_time_to_marriage}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Active Matches</p>
              <p className="text-2xl font-semibold text-gray-900">{loading ? "-" : summary.active_matches.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Most Successful Month</p>
              <p className="text-2xl font-semibold text-gray-900">{loading ? "-" : summary.most_successful_month}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
