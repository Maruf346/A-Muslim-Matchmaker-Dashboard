import { useState } from "react";
import { useParams, Link } from "react-router";
import {
  Search, Filter, Eye, Phone, X, MapPin, Briefcase, PhoneCall, ChevronLeft,
} from "lucide-react";
import { TablePagination } from "./ui/TablePagination";
import { mockLeads, Lead, LeadStatus } from "../data/mockLeads";

const STAGE_MAP: Record<string, LeadStatus> = {
  "new-match":       "New Match",
  "photos-revealed": "Photos Revealed",
  "contact-shared":  "In Discussion",
  "in-discussion":   "In Discussion",
  "married":         "Married",
  "dropped":         "Dropped",
};

const STATUS_STYLES: Record<LeadStatus, string> = {
  "New Match":       "bg-blue-100 text-blue-800",
  "Photos Revealed": "bg-purple-100 text-purple-800",
  "In Discussion":   "bg-amber-100 text-amber-800",
  "Married":         "bg-green-100 text-green-800",
  "Dropped":         "bg-gray-100 text-gray-600",
};

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

/* ── View Details Modal ──────────────────────────────────────────────── */
function ViewDetailsModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Lead Details</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              #LEAD{lead.id.toString().padStart(4, "0")} &nbsp;·&nbsp; Created {formatDate(lead.createdDate)} &nbsp;·&nbsp; Matched by {lead.matchedBy}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${STATUS_STYLES[lead.status]}`}>
              {lead.status}
            </span>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Profiles */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Groom */}
            <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-[#415192] uppercase tracking-wider mb-3">Groom</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-[#415192] flex items-center justify-center text-white text-xl font-semibold shrink-0">
                  {lead.groom.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{lead.groom}</p>
                  <p className="text-sm text-gray-500">{lead.groomAge} years old</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {lead.groomLocation}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {lead.groomProfession}
                </div>
              </div>
            </div>

            {/* Bride */}
            <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-[#D07C84] uppercase tracking-wider mb-3">Bride</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-[#D07C84] flex items-center justify-center text-white text-xl font-semibold shrink-0">
                  {lead.bride.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{lead.bride}</p>
                  <p className="text-sm text-gray-500">{lead.brideAge} years old</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {lead.brideLocation}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {lead.brideProfession}
                </div>
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-4 bg-[#F9FAFB] rounded-xl border border-gray-100 px-5 py-3 flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Photos</p>
              <p className={`text-sm font-medium ${lead.photosRevealed ? "text-green-600" : "text-gray-400"}`}>
                {lead.photosRevealed ? "Revealed" : "Hidden"}
              </p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Matched By</p>
              <p className="text-sm font-medium text-gray-700">{lead.matchedBy}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Created</p>
              <p className="text-sm font-medium text-gray-700">{formatDate(lead.createdDate)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
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

/* ── Call / Contact Modal ────────────────────────────────────────────── */
function CallModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
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
          {/* Groom */}
          <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-[#415192] uppercase tracking-wider mb-3">Groom</p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#415192] flex items-center justify-center text-white text-base font-semibold shrink-0">
                {lead.groom.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{lead.groom}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-600 font-mono">{lead.groomPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bride */}
          <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-[#D07C84] uppercase tracking-wider mb-3">Bride</p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#D07C84] flex items-center justify-center text-white text-base font-semibold shrink-0">
                {lead.bride.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{lead.bride}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-600 font-mono">{lead.bridePhone}</span>
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

/* ── Main Component ──────────────────────────────────────────────────── */
export function LeadsList() {
  const { stage } = useParams<{ stage: string }>();
  const currentStage: LeadStatus = STAGE_MAP[stage ?? ""] ?? "New Match";

  const [searchTerm, setSearchTerm]         = useState("");
  const [showFilters, setShowFilters]       = useState(false);
  const [dateFrom, setDateFrom]             = useState("");
  const [dateTo, setDateTo]                 = useState("");
  const [matchedByFilter, setMatchedByFilter] = useState("");
  const [currentPage, setCurrentPage]       = useState(1);
  const [pageSize, setPageSize]             = useState(8);

  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [callLead, setCallLead] = useState<Lead | null>(null);

  const resetPage = () => setCurrentPage(1);

  const filtered = mockLeads
    .filter((l) => l.status === currentStage)
    .filter((l) => {
      if (searchTerm) {
        const t = searchTerm.toLowerCase();
        if (!l.groom.toLowerCase().includes(t) && !l.bride.toLowerCase().includes(t)) return false;
      }
      if (dateFrom && l.createdDate < dateFrom) return false;
      if (dateTo   && l.createdDate > dateTo)   return false;
      if (matchedByFilter && l.matchedBy !== matchedByFilter) return false;
      return true;
    });

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-8">
      {/* Header with breadcrumb */}
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
          <span className="text-gray-900 font-medium">{currentStage}</span>
        </div>
        <h1 className="text-3xl font-semibold text-gray-900">{currentStage}</h1>
        <p className="text-gray-500 mt-1">
          {filtered.length} lead{filtered.length !== 1 ? "s" : ""} in this stage
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by groom or bride name..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); resetPage(); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
            />
          </div>
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

        {showFilters && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Matched By</label>
              <select
                value={matchedByFilter}
                onChange={(e) => { setMatchedByFilter(e.target.value); resetPage(); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
              >
                <option value="">All</option>
                <option value="Admin">Admin</option>
                <option value="Algorithm">Algorithm</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Leads Table */}
      <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Groom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bride</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matched By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #LEAD{lead.id.toString().padStart(4, "0")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#415192] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                          {lead.groom.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-900">{lead.groom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#D07C84] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                          {lead.bride.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-900">{lead.bride}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(lead.createdDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.photosRevealed ? (
                        <span className="flex items-center gap-1 text-sm text-green-600">
                          <Eye className="w-3.5 h-3.5" /> Revealed
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Hidden</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.matchedBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewLead(lead)}
                          title="View Details"
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
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
          totalItems={filtered.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          itemLabel="leads"
        />
      </div>

      {/* Modals */}
      {viewLead && <ViewDetailsModal lead={viewLead} onClose={() => setViewLead(null)} />}
      {callLead && <CallModal        lead={callLead} onClose={() => setCallLead(null)} />}
    </div>
  );
}
