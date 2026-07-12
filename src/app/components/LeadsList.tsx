import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import {
  AlertCircle,
  ChevronLeft,
  Eye,
  Filter,
  Loader2,
  Phone,
  PhoneCall,
  Search,
  X,
} from "lucide-react";
import { TablePagination } from "./ui/TablePagination";
import {
  getMatchDetail,
  listMatches,
  type AdminMatchDetail,
  type AdminMatchListItem,
  type AdminMatchPersonSummary,
} from "../api/matches";
import { ApiError } from "../api/errors";
import { LEAD_STAGE_BY_KEY, type LeadStageKey } from "../data/leadStages";

const WALI_STATUS_STYLES: Record<string, string> = {
  none: "bg-gray-100 text-gray-600",
  requested: "bg-violet-100 text-violet-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-rose-100 text-rose-800",
};

function formatDate(value: string | null | undefined, withTime = false) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime
      ? {
          hour: "numeric",
          minute: "2-digit",
        }
      : {}),
  });
}

function formatValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function formatWaliStatus(status: string | null | undefined) {
  if (!status) return "-";
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getPersonName(person: AdminMatchPersonSummary) {
  return person.full_name?.trim() || person.codename?.trim() || "Unknown";
}

function getPersonInitials(person: AdminMatchPersonSummary) {
  const name = getPersonName(person);
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function PersonAvatar({
  person,
  bgClass,
  sizeClass,
  textClass,
}: {
  person: AdminMatchPersonSummary;
  bgClass: string;
  sizeClass: string;
  textClass: string;
}) {
  const name = getPersonName(person);

  return (
    <div className={`${sizeClass} rounded-full ${bgClass} flex items-center justify-center overflow-hidden shrink-0 ${textClass}`}>
      {person.profile_picture ? (
        <img src={person.profile_picture} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{getPersonInitials(person)}</span>
      )}
    </div>
  );
}

function WaliStatusBadge({ status }: { status: string | null | undefined }) {
  const normalized = status || "none";

  return (
    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${WALI_STATUS_STYLES[normalized] ?? "bg-gray-100 text-gray-600"}`}>
      {formatWaliStatus(normalized)}
    </span>
  );
}

function ViewDetailsModal({ lead, onClose }: { lead: AdminMatchDetail; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Lead Details</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {lead.match_id} | Created {formatDate(lead.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WaliStatusBadge status={lead.wali_request_status} />
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-[#415192] uppercase tracking-wider mb-3">Groom</p>
              <div className="flex items-center gap-3 mb-4">
                <PersonAvatar person={lead.groom} bgClass="bg-[#415192]" sizeClass="w-14 h-14" textClass="text-white text-xl font-semibold" />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{getPersonName(lead.groom)}</p>
                  <p className="text-sm text-gray-500">{formatValue(lead.groom.codename)}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="text-gray-400">Gender:</span> {formatValue(lead.groom.gender)}</p>
                <p><span className="text-gray-400">Phone:</span> {formatValue(lead.groom.phone)}</p>
              </div>
            </div>

            <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-[#D07C84] uppercase tracking-wider mb-3">Bride</p>
              <div className="flex items-center gap-3 mb-4">
                <PersonAvatar person={lead.bride} bgClass="bg-[#D07C84]" sizeClass="w-14 h-14" textClass="text-white text-xl font-semibold" />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{getPersonName(lead.bride)}</p>
                  <p className="text-sm text-gray-500">{formatValue(lead.bride.codename)}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="text-gray-400">Gender:</span> {formatValue(lead.bride.gender)}</p>
                <p><span className="text-gray-400">Phone:</span> {formatValue(lead.bride.phone)}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-[#F9FAFB] rounded-xl border border-gray-100 px-5 py-3 flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Photos</p>
              <p className={`text-sm font-medium ${lead.photos_revealed ? "text-green-600" : "text-gray-400"}`}>
                {lead.photos_revealed ? "Revealed" : "Hidden"}
              </p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Wali Status</p>
              <p className="text-sm font-medium text-gray-700">{formatWaliStatus(lead.wali_request_status)}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Created</p>
              <p className="text-sm font-medium text-gray-700">{formatDate(lead.created_at, true)}</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#415192] text-white rounded-xl font-medium hover:bg-[#354177] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function CallModal({ lead, onClose }: { lead: AdminMatchListItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-[#415192]" />
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-[#415192] uppercase tracking-wider mb-3">Groom</p>
            <div className="flex items-center gap-3">
              <PersonAvatar person={lead.groom} bgClass="bg-[#415192]" sizeClass="w-11 h-11" textClass="text-white text-base font-semibold" />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{getPersonName(lead.groom)}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-600 font-mono break-all">{formatValue(lead.groom.phone)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-[#D07C84] uppercase tracking-wider mb-3">Bride</p>
            <div className="flex items-center gap-3">
              <PersonAvatar person={lead.bride} bgClass="bg-[#D07C84]" sizeClass="w-11 h-11" textClass="text-white text-base font-semibold" />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{getPersonName(lead.bride)}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-600 font-mono break-all">{formatValue(lead.bride.phone)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function LeadsList() {
  const { stage } = useParams<{ stage: string }>();
  const stageKey = (stage && stage in LEAD_STAGE_BY_KEY ? stage : "new-match") as LeadStageKey;
  const currentStage = LEAD_STAGE_BY_KEY[stageKey];

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [leads, setLeads] = useState<AdminMatchListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  const [viewLead, setViewLead] = useState<AdminMatchDetail | null>(null);
  const [callLead, setCallLead] = useState<AdminMatchListItem | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);

  const resetPage = () => setCurrentPage(1);
  const activeFilterCount =
    Number(Boolean(searchTerm.trim())) +
    Number(Boolean(dateFrom)) +
    Number(Boolean(dateTo));

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const loadLeads = async () => {
      setLoading(true);
      setListError(null);

      try {
        const response = await listMatches({
          ...currentStage.filters,
          page: currentPage,
          page_size: pageSize,
          search: debouncedSearch || undefined,
          start_date: dateFrom || undefined,
          end_date: dateTo || undefined,
        });

        setLeads(response.results ?? []);
        setTotalCount(response.count ?? 0);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Unable to load leads.";
        setListError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadLeads();
  }, [currentPage, currentStage.filters, dateFrom, dateTo, debouncedSearch, pageSize, reloadIndex]);

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const handleViewLead = async (leadId: string) => {
    setDetailLoadingId(leadId);
    setActionError(null);

    try {
      const detail = await getMatchDetail(leadId);
      setViewLead(detail);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to load lead details.";
      setActionError(message);
    } finally {
      setDetailLoadingId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Link
            to="/leads"
            className="flex items-center gap-1 hover:text-[#415192] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Leads Pipeline
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{currentStage.label}</span>
        </div>
        <h1 className="text-3xl font-semibold text-gray-900">{currentStage.label}</h1>
        <p className="text-gray-500 mt-1">
          {totalCount} lead{totalCount !== 1 ? "s" : ""} in this stage
        </p>
      </div>

      <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by match ID, status, name, email, or codename..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                resetPage();
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
            />
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 border border-gray-300 rounded-lg flex items-center gap-2 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5" />
              Clear
            </button>
          )}
          <button
            onClick={() => setShowFilters((prev) => !prev)}
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

        {showFilters && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  resetPage();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  resetPage();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
              />
            </div>
            {/*
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Matched By</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent">
                <option value="">All</option>
              </select>
            </div>
            */}
          </div>
        )}
      </div>

      <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-sm text-gray-500 flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-[#415192]" />
            Loading leads...
          </div>
        ) : listError ? (
          <div className="p-8 text-sm text-red-700 flex items-start gap-3 bg-red-50">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Could not load leads</p>
              <p className="mt-1">{listError}</p>
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
            {actionError && (
              <div className="mx-6 mt-6 mb-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Groom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bride</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wali Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                        No leads found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {lead.match_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <PersonAvatar person={lead.groom} bgClass="bg-[#415192]" sizeClass="w-8 h-8" textClass="text-white text-sm font-semibold" />
                            <span className="text-sm text-gray-900">{getPersonName(lead.groom)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <PersonAvatar person={lead.bride} bgClass="bg-[#D07C84]" sizeClass="w-8 h-8" textClass="text-white text-sm font-semibold" />
                            <span className="text-sm text-gray-900">{getPersonName(lead.bride)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(lead.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lead.photos_revealed ? (
                            <span className="flex items-center gap-1 text-sm text-green-600">
                              <Eye className="w-3.5 h-3.5" /> Revealed
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">Hidden</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <WaliStatusBadge status={lead.wali_request_status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => void handleViewLead(lead.id)}
                              title="View Details"
                              disabled={detailLoadingId === lead.id}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {detailLoadingId === lead.id ? (
                                <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                              ) : (
                                <Eye className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                            <button
                              onClick={() => setCallLead(lead)}
                              title="Contact Info"
                              className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Phone className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              totalItems={totalCount}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemLabel="leads"
            />
          </>
        )}
      </div>

      {viewLead && <ViewDetailsModal lead={viewLead} onClose={() => setViewLead(null)} />}
      {callLead && <CallModal lead={callLead} onClose={() => setCallLead(null)} />}
    </div>
  );
}
