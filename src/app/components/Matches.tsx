import { useEffect, useState, type CSSProperties } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Filter,
  Heart,
  Loader2,
  Phone,
  PhoneCall,
  Search,
  Star,
  X,
} from "lucide-react";
import { TablePagination } from "./ui/TablePagination";
import {
  getMatchDetail,
  listMatches,
  overrideMatchStatus,
  type AdminMatchDetail,
  type AdminMatchListItem,
  type AdminMatchPersonSummary,
  type AdminMatchStatus,
} from "../api/matches";
import { ApiError } from "../api/errors";

const STATUS_LABELS: Record<AdminMatchStatus, string> = {
  pending: "Pending",
  declined: "Declined",
  accepted: "Accepted",
  cancelled: "Cancelled",
  wali_requested: "Wali Requested",
  wali_accepted: "Wali Accepted",
  in_discussion: "In Discussion",
  married: "Married",
  dropped: "Dropped",
};

const STATUS_STYLES: Record<AdminMatchStatus, string> = {
  pending: "bg-blue-100 text-blue-800",
  declined: "bg-rose-100 text-rose-800",
  accepted: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-200 text-slate-700",
  wali_requested: "bg-violet-100 text-violet-800",
  wali_accepted: "bg-indigo-100 text-indigo-800",
  in_discussion: "bg-amber-100 text-amber-800",
  married: "bg-green-100 text-green-800",
  dropped: "bg-orange-100 text-orange-800",
};

const STATUS_OPTIONS: Array<{ label: string; value: AdminMatchStatus }> = [
  { label: "Pending", value: "pending" },
  { label: "Declined", value: "declined" },
  { label: "Accepted", value: "accepted" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Wali Requested", value: "wali_requested" },
  { label: "Wali Accepted", value: "wali_accepted" },
  { label: "In Discussion", value: "in_discussion" },
  { label: "Married", value: "married" },
  { label: "Dropped", value: "dropped" },
];

const FLOATING_STARS = [
  { left: "6%", dur: "1.7s", delay: "0s" },
  { left: "18%", dur: "2.0s", delay: "0.3s" },
  { left: "30%", dur: "1.5s", delay: "0.1s" },
  { left: "44%", dur: "2.2s", delay: "0.5s" },
  { left: "57%", dur: "1.8s", delay: "0.2s" },
  { left: "70%", dur: "1.6s", delay: "0.4s" },
  { left: "82%", dur: "2.1s", delay: "0.6s" },
  { left: "93%", dur: "1.9s", delay: "0.1s" },
];

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

function formatStatusLabel(status: string | null | undefined) {
  if (!status) return "-";
  return STATUS_LABELS[status as AdminMatchStatus] ?? status.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
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

function MatchStatusBadge({ status }: { status: AdminMatchStatus }) {
  return (
    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}>
      {formatStatusLabel(status)}
    </span>
  );
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

function PersonSummaryCard({
  label,
  accentClass,
  avatarClass,
  person,
}: {
  label: string;
  accentClass: string;
  avatarClass: string;
  person: AdminMatchPersonSummary;
}) {
  return (
    <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-5">
      <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${accentClass}`}>{label}</p>
      <div className="flex items-center gap-3 mb-4">
        <PersonAvatar person={person} bgClass={avatarClass} sizeClass="w-14 h-14" textClass="text-white text-xl font-semibold" />
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{getPersonName(person)}</p>
          <p className="text-sm text-gray-500">{formatValue(person.codename)}</p>
        </div>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <p><span className="text-gray-400">Gender:</span> {formatValue(person.gender)}</p>
        <p><span className="text-gray-400">Phone:</span> {formatValue(person.phone)}</p>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  return (
    <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 px-4 py-3">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-700 break-all">{formatValue(value)}</p>
    </div>
  );
}

function ViewDetailsModal({ match, onClose }: { match: AdminMatchDetail; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Match Details</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {match.match_id} | Created {formatDate(match.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <MatchStatusBadge status={match.status} />
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonSummaryCard label="Groom" accentClass="text-[#415192]" avatarClass="bg-[#415192]" person={match.groom} />
            <PersonSummaryCard label="Bride" accentClass="text-[#D07C84]" avatarClass="bg-[#D07C84]" person={match.bride} />
          </div>

          <div className="mt-4 bg-[#F9FAFB] rounded-xl border border-gray-100 px-5 py-3 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Photos</p>
              <p className={`text-sm font-medium ${match.photos_revealed ? "text-green-600" : "text-gray-400"}`}>
                {match.photos_revealed ? "Revealed" : "Hidden"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Wali Request</p>
              <p className="text-sm font-medium text-gray-700">{formatStatusLabel(match.wali_request_status)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Photo Request</p>
              <p className="text-sm font-medium text-gray-700">{formatStatusLabel(match.photo_request_status)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Created</p>
              <p className="text-sm font-medium text-gray-700">{formatDate(match.created_at, true)}</p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Match Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DetailItem label="Match UUID" value={match.id} />
              <DetailItem label="Match ID" value={match.match_id} />
              <DetailItem label="Status" value={formatStatusLabel(match.status)} />
              <DetailItem label="Photos Revealed Count" value={match.photos_revealed_count} />
              <DetailItem label="Requested At" value={formatDate(match.requested_at, true)} />
              <DetailItem label="Accepted At" value={formatDate(match.accepted_at, true)} />
              <DetailItem label="Married At" value={formatDate(match.married_at, true)} />
              <DetailItem label="Dropped At" value={formatDate(match.dropped_at, true)} />
              <DetailItem label="Cancelled At" value={formatDate(match.cancelled_at, true)} />
              <DetailItem label="Updated At" value={formatDate(match.updated_at, true)} />
              <DetailItem label="First Photos Revealed At" value={formatDate(match.first_photos_revealed_at, true)} />
              <DetailItem label="Last Photos Revealed At" value={formatDate(match.last_photos_revealed_at, true)} />
              <DetailItem label="Wali Requested At" value={formatDate(match.wali_requested_at, true)} />
              <DetailItem label="Wali Responded At" value={formatDate(match.wali_responded_at, true)} />
              <DetailItem label="In Discussion At" value={formatDate(match.in_discussion_at, true)} />
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Admin Audit</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <DetailItem label="Cancelled By" value={match.cancelled_by} />
              <DetailItem label="Dropped By" value={match.dropped_by} />
              <DetailItem label="Last Status Changed By Admin" value={match.last_status_changed_by_admin} />
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 pt-2 shrink-0">
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

function CallModal({ match, onClose }: { match: AdminMatchListItem; onClose: () => void }) {
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
              <PersonAvatar person={match.groom} bgClass="bg-[#415192]" sizeClass="w-11 h-11" textClass="text-white text-base font-semibold" />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{getPersonName(match.groom)}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-600 font-mono break-all">{formatValue(match.groom.phone)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-[#D07C84] uppercase tracking-wider mb-3">Bride</p>
            <div className="flex items-center gap-3">
              <PersonAvatar person={match.bride} bgClass="bg-[#D07C84]" sizeClass="w-11 h-11" textClass="text-white text-base font-semibold" />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{getPersonName(match.bride)}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-600 font-mono break-all">{formatValue(match.bride.phone)}</span>
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

function MarkSuccessModal({ match, onClose }: { match: AdminMatchListItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <style>{`
        @keyframes msFadeBackdrop {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes msSlideUp {
          from { transform: translateY(40px) scale(0.95); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes msStarPulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(10deg); }
        }
        @keyframes msStarFloat {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0.9; }
          100% { transform: translateY(-130px) scale(0.2) rotate(45deg); opacity: 0; }
        }
        .ms-backdrop { animation: msFadeBackdrop 0.3s ease forwards; }
        .ms-modal { animation: msSlideUp 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .ms-star-pulse { animation: msStarPulse 1.4s ease-in-out infinite; }
        .ms-star-float { animation: msStarFloat var(--dur) ease-out var(--delay) forwards; }
      `}</style>

      <div className="ms-backdrop absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="ms-modal relative bg-white rounded-3xl px-8 pt-8 pb-7 max-w-sm w-full mx-4 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {FLOATING_STARS.map((star, index) => (
            <span
              key={index}
              className="ms-star-float absolute bottom-4 text-lg text-amber-400"
              style={{ left: star.left, "--dur": star.dur, "--delay": star.delay } as CSSProperties}
            >
              {"\u2605"}
            </span>
          ))}
        </div>

        <div className="ms-star-pulse w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Star className="w-10 h-10 text-white fill-white" />
        </div>

        <div className="flex items-center justify-center gap-5 mb-5">
          <div className="text-center">
            <div className="mx-auto mb-1.5 ring-2 ring-[#ACB5DA] rounded-full inline-flex">
              <PersonAvatar person={match.groom} bgClass="bg-[#415192]" sizeClass="w-14 h-14" textClass="text-white text-lg font-semibold" />
            </div>
            <p className="text-xs font-medium text-gray-600">{getPersonName(match.groom).split(" ")[0]}</p>
          </div>
          <div className="flex flex-col items-center gap-1 pb-5">
            <Heart className="w-5 h-5 text-[#D07C84] fill-[#D07C84]" />
            <Heart className="w-3 h-3 text-[#ECCBCE] fill-[#ECCBCE]" />
          </div>
          <div className="text-center">
            <div className="mx-auto mb-1.5 ring-2 ring-[#ECCBCE] rounded-full inline-flex">
              <PersonAvatar person={match.bride} bgClass="bg-[#D07C84]" sizeClass="w-14 h-14" textClass="text-white text-lg font-semibold" />
            </div>
            <p className="text-xs font-medium text-gray-600">{getPersonName(match.bride).split(" ")[0]}</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Match Marked Successful!</h3>
        <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
          <span className="font-medium text-gray-700">{getPersonName(match.groom)}</span>
          {" & "}
          <span className="font-medium text-gray-700">{getPersonName(match.bride)}</span>
          {" "}have been marked as a successful match. May Allah bless their union.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-amber-400 to-[#D07C84] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          Wonderful!
        </button>
      </div>
    </div>
  );
}

export function Matches() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"" | AdminMatchStatus>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [matches, setMatches] = useState<AdminMatchListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total_matches: 0,
    in_discussion_count: 0,
    dropped_count: 0,
    married_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  const [viewMatch, setViewMatch] = useState<AdminMatchDetail | null>(null);
  const [callMatch, setCallMatch] = useState<AdminMatchListItem | null>(null);
  const [successMatch, setSuccessMatch] = useState<AdminMatchListItem | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const [statusSavingId, setStatusSavingId] = useState<string | null>(null);

  const resetPage = () => setCurrentPage(1);
  const activeFilterCount =
    Number(Boolean(searchTerm.trim())) +
    Number(Boolean(statusFilter)) +
    Number(Boolean(dateFrom)) +
    Number(Boolean(dateTo));

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      setListError(null);

      try {
        const response = await listMatches({
          page: currentPage,
          page_size: pageSize,
          search: debouncedSearch || undefined,
          start_date: dateFrom || undefined,
          end_date: dateTo || undefined,
          status: statusFilter || undefined,
        });

        const results = response.results ?? [];
        const summary = results[0];

        setMatches(results);
        setTotalCount(response.count ?? 0);
        setStats({
          total_matches: summary?.total_matches ?? response.count ?? 0,
          in_discussion_count: summary?.in_discussion_count ?? 0,
          dropped_count: summary?.dropped_count ?? 0,
          married_count: summary?.married_count ?? 0,
        });
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Unable to load matches.";
        setListError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadMatches();
  }, [currentPage, dateFrom, dateTo, debouncedSearch, pageSize, reloadIndex, statusFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const handleViewMatch = async (matchId: string) => {
    setDetailLoadingId(matchId);
    setActionError(null);

    try {
      const detail = await getMatchDetail(matchId);
      setViewMatch(detail);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to load match details.";
      setActionError(message);
    } finally {
      setDetailLoadingId(null);
    }
  };

  const handleMarkSuccess = async (match: AdminMatchListItem) => {
    if (match.status === "married" || match.status === "dropped") return;

    setStatusSavingId(match.id);
    setActionError(null);

    try {
      const updated = await overrideMatchStatus(match.id, "married");

      setMatches((prev) =>
        prev.map((item) =>
          item.id === match.id
            ? {
                ...item,
                status: updated.status,
                married_at: updated.married_at,
                dropped_at: updated.dropped_at,
              }
            : item,
        ),
      );

      setStats({
        total_matches: updated.total_matches,
        in_discussion_count: updated.in_discussion_count,
        dropped_count: updated.dropped_count,
        married_count: updated.married_count,
      });

      if (viewMatch?.id === match.id) {
        setViewMatch(updated);
      }

      setSuccessMatch({
        ...match,
        status: "married",
      });
      setReloadIndex((prev) => prev + 1);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to mark this match as married.";
      setActionError(message);
    } finally {
      setStatusSavingId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Matches</h1>
        <p className="text-gray-500 mt-1">View and track all matched profiles</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Total Matches</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.total_matches}</p>
        </div>
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">In Discussion</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.in_discussion_count}</p>
        </div>
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Dropped</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.dropped_count}</p>
        </div>
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Married</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.married_count}</p>
        </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as "" | AdminMatchStatus);
                  resetPage();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-sm text-gray-500 flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-[#415192]" />
            Loading matches...
          </div>
        ) : listError ? (
          <div className="p-8 text-sm text-red-700 flex items-start gap-3 bg-red-50">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Could not load matches</p>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {matches.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                        No matches found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    matches.map((match) => (
                      <tr key={match.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {match.match_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <PersonAvatar person={match.groom} bgClass="bg-[#415192]" sizeClass="w-8 h-8" textClass="text-white text-sm font-semibold" />
                            <span className="text-sm text-gray-900">{getPersonName(match.groom)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <PersonAvatar person={match.bride} bgClass="bg-[#D07C84]" sizeClass="w-8 h-8" textClass="text-white text-sm font-semibold" />
                            <span className="text-sm text-gray-900">{getPersonName(match.bride)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(match.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {match.photos_revealed ? (
                            <span className="flex items-center gap-1 text-sm text-green-600">
                              <Eye className="w-3.5 h-3.5" /> Revealed
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">Hidden</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <MatchStatusBadge status={match.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => void handleViewMatch(match.id)}
                              title="View Details"
                              disabled={detailLoadingId === match.id}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {detailLoadingId === match.id ? (
                                <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                              ) : (
                                <Eye className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                            <button
                              onClick={() => setCallMatch(match)}
                              title="Contact Info"
                              className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Phone className="w-4 h-4 text-gray-600" />
                            </button>
                            {match.status !== "married" && match.status !== "dropped" && (
                              <button
                                onClick={() => void handleMarkSuccess(match)}
                                title="Mark as Successful"
                                disabled={statusSavingId === match.id}
                                className="p-1.5 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {statusSavingId === match.id ? (
                                  <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4 text-gray-600" />
                                )}
                              </button>
                            )}
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
              itemLabel="matches"
            />
          </>
        )}
      </div>

      {viewMatch && <ViewDetailsModal match={viewMatch} onClose={() => setViewMatch(null)} />}
      {callMatch && <CallModal match={callMatch} onClose={() => setCallMatch(null)} />}
      {successMatch && <MarkSuccessModal match={successMatch} onClose={() => setSuccessMatch(null)} />}
    </div>
  );
}
