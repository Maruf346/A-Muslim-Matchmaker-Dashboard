import { useState } from "react";
import { CheckCircle, XCircle, Clock, Search, Filter, Check, X } from "lucide-react";
import { TablePagination } from "./ui/TablePagination";

interface Request {
  id: number;
  from: string;
  to: string;
  type: string;
  date: string;
  status: string;
}

const mockRequests: Request[] = [
  { id: 1,  from: "Mohammed Ali",      to: "Sarah Ahmed",     type: "Contact Request",  date: "2026-05-15", status: "Pending"  },
  { id: 2,  from: "Ahmed Hassan",      to: "Fatima Khan",     type: "Photo Request",    date: "2026-04-29", status: "Approved" },
  { id: 3,  from: "Omar Farooq",       to: "Aisha Rahman",    type: "Contact Request",  date: "2026-05-02", status: "Pending"  },
  { id: 4,  from: "Ibrahim Yusuf",     to: "Zainab Malik",    type: "Contact Request",  date: "2026-04-28", status: "Rejected" },
  { id: 5,  from: "Tariq Siddiqui",   to: "Maryam Chaudhry", type: "Photo Request",    date: "2026-05-10", status: "Pending"  },
  { id: 6,  from: "Khalid Al-Rashid", to: "Nadia Hussain",   type: "Contact Request",  date: "2026-04-22", status: "Approved" },
  { id: 7,  from: "Yusuf Osman",       to: "Hina Baig",       type: "Match Suggestion", date: "2026-05-08", status: "Pending"  },
  { id: 8,  from: "Bilal Mahmoud",     to: "Ruqayyah Patel",  type: "Contact Request",  date: "2026-04-18", status: "Rejected" },
  { id: 9,  from: "Hamid Qureshi",     to: "Safia Jama",      type: "Photo Request",    date: "2026-05-12", status: "Pending"  },
  { id: 10, from: "Dawud Thompson",    to: "Leila Benali",    type: "Contact Request",  date: "2026-04-25", status: "Approved" },
  { id: 11, from: "Rashid Al-Amin",   to: "Amina Diallo",    type: "Match Suggestion", date: "2026-05-06", status: "Pending"  },
  { id: 12, from: "Kareem Washington", to: "Sumaiya Islam",   type: "Contact Request",  date: "2026-05-14", status: "Pending"  },
  { id: 13, from: "Mohammed Ali",      to: "Fatima Khan",     type: "Photo Request",    date: "2026-04-20", status: "Approved" },
  { id: 14, from: "Ahmed Hassan",      to: "Zainab Malik",    type: "Match Suggestion", date: "2026-05-01", status: "Pending"  },
  { id: 15, from: "Omar Farooq",       to: "Maryam Chaudhry", type: "Contact Request",  date: "2026-04-15", status: "Rejected" },
  { id: 16, from: "Ibrahim Yusuf",     to: "Nadia Hussain",   type: "Photo Request",    date: "2026-05-09", status: "Pending"  },
  { id: 17, from: "Tariq Siddiqui",   to: "Hina Baig",       type: "Contact Request",  date: "2026-04-12", status: "Approved" },
  { id: 18, from: "Khalid Al-Rashid", to: "Ruqayyah Patel",  type: "Match Suggestion", date: "2026-05-11", status: "Pending"  },
  { id: 19, from: "Yusuf Osman",       to: "Safia Jama",      type: "Photo Request",    date: "2026-04-27", status: "Approved" },
  { id: 20, from: "Bilal Mahmoud",     to: "Leila Benali",    type: "Contact Request",  date: "2026-05-04", status: "Pending"  },
  { id: 21, from: "Hamid Qureshi",     to: "Amina Diallo",    type: "Match Suggestion", date: "2026-04-10", status: "Rejected" },
  { id: 22, from: "Dawud Thompson",    to: "Sumaiya Islam",   type: "Contact Request",  date: "2026-05-13", status: "Pending"  },
  { id: 23, from: "Rashid Al-Amin",   to: "Sarah Ahmed",     type: "Photo Request",    date: "2026-04-16", status: "Approved" },
  { id: 24, from: "Kareem Washington", to: "Fatima Khan",     type: "Match Suggestion", date: "2026-05-07", status: "Pending"  },
  { id: 25, from: "Mohammed Ali",      to: "Aisha Rahman",    type: "Contact Request",  date: "2026-04-14", status: "Rejected" },
  { id: 26, from: "Ahmed Hassan",      to: "Maryam Chaudhry", type: "Photo Request",    date: "2026-05-03", status: "Pending"  },
  { id: 27, from: "Omar Farooq",       to: "Safia Jama",      type: "Contact Request",  date: "2026-04-24", status: "Approved" },
  { id: 28, from: "Ibrahim Yusuf",     to: "Leila Benali",    type: "Match Suggestion", date: "2026-05-05", status: "Pending"  },
  { id: 29, from: "Tariq Siddiqui",   to: "Sumaiya Islam",   type: "Contact Request",  date: "2026-04-11", status: "Rejected" },
  { id: 30, from: "Khalid Al-Rashid", to: "Hina Baig",       type: "Photo Request",    date: "2026-05-16", status: "Pending"  },
];

const REQUEST_TYPES = ["Contact Request", "Photo Request", "Match Suggestion"];

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending:  "bg-amber-100 text-amber-700",
    Approved: "bg-[#ACB5DA]/50 text-[#415192]",
    Rejected: "bg-red-100 text-red-600",
  };
  return (
    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

export function Requests() {
  const [requestStatuses, setRequestStatuses] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [approveSuccessReq, setApproveSuccessReq] = useState<Request | null>(null);
  const [rejectConfirmReq, setRejectConfirmReq] = useState<Request | null>(null);

  const resetPage = () => setCurrentPage(1);

  const getEffectiveStatus = (req: Request) => requestStatuses[req.id] ?? req.status;

  const handleApprove = (req: Request) => {
    setRequestStatuses((prev) => ({ ...prev, [req.id]: "Approved" }));
    setApproveSuccessReq(req);
  };

  const handleConfirmReject = () => {
    if (!rejectConfirmReq) return;
    setRequestStatuses((prev) => ({ ...prev, [rejectConfirmReq.id]: "Rejected" }));
    setRejectConfirmReq(null);
  };

  // Dynamic stats
  const pendingCount  = mockRequests.filter((r) => getEffectiveStatus(r) === "Pending").length;
  const approvedCount = mockRequests.filter((r) => getEffectiveStatus(r) === "Approved").length;
  const rejectedCount = mockRequests.filter((r) => getEffectiveStatus(r) === "Rejected").length;

  // Filtering
  const filtered = mockRequests.filter((req) => {
    const effectiveStatus = getEffectiveStatus(req);
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      if (!req.from.toLowerCase().includes(t) && !req.to.toLowerCase().includes(t)) return false;
    }
    if (typeFilter   && req.type !== typeFilter)         return false;
    if (statusFilter && effectiveStatus !== statusFilter) return false;
    if (dateFrom     && req.date < dateFrom)              return false;
    if (dateTo       && req.date > dateTo)                return false;
    return true;
  });

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Requests Management</h1>
        <p className="text-gray-500 mt-1">View and manage all connection requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{pendingCount}</p>
            </div>
            <Clock className="w-10 h-10 text-amber-400" />
          </div>
        </div>
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{approvedCount}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-[#415192]" />
          </div>
        </div>
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{rejectedCount}</p>
            </div>
            <XCircle className="w-10 h-10 text-[#D07C84]" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by sender or recipient name..."
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
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); resetPage(); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
              >
                <option value="">All Types</option>
                {REQUEST_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
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
                onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Requests Table */}
      <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    No requests found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((req) => {
                  const effectiveStatus = getEffectiveStatus(req);
                  return (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{req.id.toString().padStart(4, "0")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#415192] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {req.from.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-900">{req.from}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#D07C84] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {req.to.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-900">{req.to}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{req.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(req.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={effectiveStatus} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {effectiveStatus === "Pending" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(req)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#415192] text-white text-xs rounded-sm hover:bg-[#354177] transition-colors font-medium"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectConfirmReq(req)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D07C84] text-[#D07C84] text-xs rounded-sm hover:bg-[#ECCBCE]/20 transition-colors font-medium"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : effectiveStatus === "Approved" ? (
                          <div className="flex items-center gap-1.5 text-[#415192]">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">Approved</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-500">
                            <XCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">Rejected</span>
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
          totalItems={filtered.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          itemLabel="requests"
        />
      </div>

      {/* Approve Success Modal */}
      {approveSuccessReq && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-7 max-w-sm w-full mx-4 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Approved!</h3>
            <p className="text-sm text-gray-500 mb-1">
              The{" "}
              <span className="font-medium text-gray-700 lowercase">{approveSuccessReq.type}</span>{" "}
              from{" "}
              <span className="font-medium text-gray-700">{approveSuccessReq.from}</span>
              {" "}to{" "}
              <span className="font-medium text-gray-700">{approveSuccessReq.to}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">has been approved successfully.</p>
            <button
              onClick={() => setApproveSuccessReq(null)}
              className="w-full py-2.5 bg-[#415192] text-white rounded-xl font-medium hover:bg-[#354177] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectConfirmReq && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-7 max-w-sm w-full mx-4 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-9 h-9 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject this Request?</h3>
            <p className="text-sm text-gray-500 mb-1">
              The{" "}
              <span className="font-medium text-gray-700 lowercase">{rejectConfirmReq.type}</span>{" "}
              from{" "}
              <span className="font-medium text-gray-700">{rejectConfirmReq.from}</span>
              {" "}to{" "}
              <span className="font-medium text-gray-700">{rejectConfirmReq.to}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">will be marked as rejected.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setRejectConfirmReq(null)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
