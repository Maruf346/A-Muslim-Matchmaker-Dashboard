import { useEffect, useMemo, useState } from "react";
import { CheckCircle, XCircle, Clock, Search, Filter, Check, X, Loader2 } from "lucide-react";
import { TablePagination } from "./ui/TablePagination";
import {
  listMatchmakingRequests,
  type MatchmakingRequestListApiResponse,
  reviewMatchmakingRequest,
  type MatchmakingRequest,
  type MatchmakingRequestStatus,
} from "../api/requests";
import { ApiError } from "../api/errors";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatStatusLabel(status: MatchmakingRequestStatus) {
  const labels: Record<MatchmakingRequestStatus, string> = {
    pending: "Pending",
    approved: "Approved",
    declined: "Declined",
  };
  return labels[status];
}

function formatUserName(request: MatchmakingRequest) {
  const fullName = `${request.user.first_name ?? ""} ${request.user.last_name ?? ""}`.trim();
  return fullName || request.user.codename || request.request_id;
}

function formatLocation(request: MatchmakingRequest) {
  const parts = [request.user.city, request.user.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}

function initialsFor(request: MatchmakingRequest) {
  const first = request.user.first_name?.charAt(0) ?? "";
  const last = request.user.last_name?.charAt(0) ?? "";
  const initials = `${first}${last}`.trim();
  if (initials) return initials.toUpperCase();
  if (request.user.codename) return request.user.codename.charAt(0).toUpperCase();
  return request.request_id.charAt(0).toUpperCase();
}

function StatusBadge({ status }: { status: MatchmakingRequestStatus }) {
  const styles: Record<MatchmakingRequestStatus, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-[#ACB5DA]/50 text-[#415192]",
    declined: "bg-red-100 text-red-600",
  };
  return (
    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {formatStatusLabel(status)}
    </span>
  );
}

function isValidRequestListResponse(
  response: unknown,
): response is { count?: number | null; results?: MatchmakingRequest[] | null } {
  return Boolean(response) && typeof response === "object";
}

function normalizeRequestListResponse(response: MatchmakingRequestListApiResponse | null) {
  if (Array.isArray(response)) {
    return {
      results: response,
      count: response.length,
    };
  }

  if (isValidRequestListResponse(response)) {
    return {
      results: Array.isArray(response.results) ? response.results : [],
      count: typeof response.count === "number" ? response.count : 0,
    };
  }

  return {
    results: [] as MatchmakingRequest[],
    count: 0,
  };
}

export function Requests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"" | MatchmakingRequestStatus>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [requests, setRequests] = useState<MatchmakingRequest[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    declined: 0,
  });

  const [approveSuccessReq, setApproveSuccessReq] = useState<MatchmakingRequest | null>(null);
  const [declineConfirmReq, setDeclineConfirmReq] = useState<MatchmakingRequest | null>(null);

  const resetPage = () => setCurrentPage(1);

  const activeCount = useMemo(() => {
    return [searchTerm.trim(), statusFilter, dateFrom, dateTo].filter(Boolean).length;
  }, [dateFrom, dateTo, searchTerm, statusFilter]);

  const showFullErrorState = Boolean(error && requests.length === 0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          page: currentPage,
          page_size: pageSize,
          search: debouncedSearch || undefined,
          start_date: dateFrom || undefined,
          end_date: dateTo || undefined,
          status: statusFilter || undefined,
        };

        let response = await listMatchmakingRequests(params);

        if (response === null) {
          response = await listMatchmakingRequests(params);
        }

        if (cancelled) return;

        const { results: normalizedResults, count: normalizedCount } = normalizeRequestListResponse(response);

        if (normalizedResults.length === 0 && normalizedCount > 0 && currentPage > 1) {
          setCurrentPage((prev) => Math.max(1, prev - 1));
          return;
        }

        setRequests(normalizedResults);
        setTotalCount(normalizedCount);

        if (normalizedResults.length > 0) {
          const [first] = normalizedResults;
          setStats({
            pending: first.pending_count ?? 0,
            approved: first.approved_count ?? 0,
            declined: first.declined_count ?? 0,
          });
        } else {
          setStats({
            pending: 0,
            approved: 0,
            declined: 0,
          });
        }
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof ApiError ? err.message : "Unable to load requests.";
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
  }, [currentPage, dateFrom, dateTo, debouncedSearch, pageSize, reloadIndex, statusFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const applyOptimisticStatus = (target: MatchmakingRequest, nextStatus: MatchmakingRequestStatus) => {
    const previousStats = { ...stats };

    setRequests((prev) =>
      prev.map((request) =>
        request.id === target.id
          ? {
              ...request,
              status: nextStatus,
            }
          : request,
      ),
    );

    setStats((prev) => ({
      pending: prev.pending - (target.status === "pending" ? 1 : 0) + (nextStatus === "pending" ? 1 : 0),
      approved: prev.approved - (target.status === "approved" ? 1 : 0) + (nextStatus === "approved" ? 1 : 0),
      declined: prev.declined - (target.status === "declined" ? 1 : 0) + (nextStatus === "declined" ? 1 : 0),
    }));

    return previousStats;
  };

  const restoreOptimisticState = (target: MatchmakingRequest, previousStats: typeof stats) => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === target.id
          ? {
              ...request,
              status: target.status,
            }
          : request,
      ),
    );
    setStats(previousStats);
  };

  const handleReview = async (target: MatchmakingRequest, action: "approve" | "decline") => {
    if (reviewingId) return;

    const nextStatus: MatchmakingRequestStatus = action === "approve" ? "approved" : "declined";
    const previousStats = applyOptimisticStatus(target, nextStatus);
    setReviewingId(target.id);
    setError(null);

    try {
      const updated = await reviewMatchmakingRequest(target.id, { action });

      setRequests((prev) =>
        prev.map((request) => (request.id === updated.id ? updated : request)),
      );
      setStats({
        pending: updated.pending_count ?? 0,
        approved: updated.approved_count ?? 0,
        declined: updated.declined_count ?? 0,
      });

      if (action === "approve") {
        setApproveSuccessReq(updated);
      }

      setReloadIndex((prev) => prev + 1);
    } catch (err) {
      restoreOptimisticState(target, previousStats);
      const message = err instanceof ApiError ? err.message : "Unable to update request status.";
      setError(message);
    } finally {
      setReviewingId(null);
      if (action === "decline") {
        setDeclineConfirmReq(null);
      }
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Private Matchmaking Requests</h1>
        <p className="text-gray-500 mt-1">View and manage all private matchmaking requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.pending}</p>
            </div>
            <Clock className="w-10 h-10 text-amber-400" />
          </div>
        </div>
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.approved}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-[#415192]" />
          </div>
        </div>
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Declined</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.declined}</p>
            </div>
            <XCircle className="w-10 h-10 text-[#D07C84]" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex flex-col gap-4 xl:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by codename or email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); resetPage(); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            {activeCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Clear filters
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 border rounded-lg flex items-center gap-2 transition-colors ${
                showFilters
                  ? "border-[#415192] bg-[#415192]/5 text-[#415192]"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 gap-4 mt-4 pt-4 border-t border-gray-200 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); resetPage(); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); resetPage(); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as "" | MatchmakingRequestStatus); resetPage(); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Requests Table */}
      <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-sm text-gray-500 flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-[#415192]" />
            Loading requests...
          </div>
        ) : showFullErrorState ? (
          <div className="p-8 text-sm text-red-700 flex items-start gap-3 bg-red-50">
            <X className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Could not load requests</p>
              <p className="mt-1">{error}</p>
              <button
                onClick={() => setReloadIndex((prev) => prev + 1)}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#415192] shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <>
            {error ? (
              <div className="mx-6 mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
                <X className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Request action failed</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            ) : null}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Codename</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                        No requests found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => {
                      const isReviewing = reviewingId === req.id;
                      return (
                        <tr key={req.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {req.request_id}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3 min-w-[220px]">
                              <div className="w-9 h-9 rounded-full bg-[#415192] overflow-hidden flex items-center justify-center text-white text-xs font-semibold shrink-0">
                                {req.user.profile_picture ? (
                                  <img
                                    src={req.user.profile_picture}
                                    alt={formatUserName(req)}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  initialsFor(req)
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{formatUserName(req)}</p>
                                {/* <p className="text-xs text-gray-500 truncate">{req.user.email || "No email available"}</p> */}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {req.user.codename || "—"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatLocation(req)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(req.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={req.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {req.status === "pending" ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => void handleReview(req, "approve")}
                                  disabled={isReviewing}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#415192] text-white text-xs rounded-sm hover:bg-[#354177] transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  {isReviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                  Approve
                                </button>
                                <button
                                  onClick={() => setDeclineConfirmReq(req)}
                                  disabled={isReviewing}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D07C84] text-[#D07C84] text-xs rounded-sm hover:bg-[#ECCBCE]/20 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Decline
                                </button>
                              </div>
                            ) : req.status === "approved" ? (
                              <div className="flex items-center gap-1.5 text-[#415192]">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs font-medium">Approved</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-red-500">
                                <XCircle className="w-4 h-4" />
                                <span className="text-xs font-medium">Declined</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              totalItems={totalCount}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
              itemLabel="requests"
            />
          </>
        )}
      </div>

      {/* Approve Success Modal */}
      {approveSuccessReq && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-7 max-w-sm w-full mx-4 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Approved!</h3>
            <p className="text-sm text-gray-500 mb-6">
              <span className="font-medium text-gray-700">{formatUserName(approveSuccessReq)}</span>
              {" "}has been approved successfully.
            </p>
            <button
              onClick={() => setApproveSuccessReq(null)}
              className="w-full py-2.5 bg-[#415192] text-white rounded-xl font-medium hover:bg-[#354177] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Decline Confirmation Modal */}
      {declineConfirmReq && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-7 max-w-sm w-full mx-4 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-9 h-9 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Decline this Request?</h3>
            <p className="text-sm text-gray-500 mb-6">
              <span className="font-medium text-gray-700">{formatUserName(declineConfirmReq)}</span>
              {" "}will be marked as declined.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeclineConfirmReq(null)}
                disabled={reviewingId === declineConfirmReq.id}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleReview(declineConfirmReq, "decline")}
                disabled={reviewingId === declineConfirmReq.id}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {reviewingId === declineConfirmReq.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
