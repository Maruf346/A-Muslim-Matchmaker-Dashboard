import { Link } from "react-router";
import { Search, Filter, Eye, Ban, ShieldCheck, X, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { TablePagination } from "./ui/TablePagination";
import { mockUsers } from "../data/mockUsers";
import {
  GENDER_OPTIONS, VERIFICATION_OPTIONS, MARITAL_STATUS_OPTIONS, ETHNICITY_OPTIONS,
  NATIONALITY_OPTIONS, EMPLOYMENT_OPTIONS, HOW_FOUND_OPTIONS, DRESS_OPTIONS,
  PRAY_OPTIONS, CHILDREN_OPTIONS, SUBSCRIPTION_OPTIONS,
} from "../data/filterChoices";

// ── Types ────────────────────────────────────────────────────────────────────

type FilterValues = {
  name: string; code: string; gender: string;
  ageMin: string; ageMax: string; verification: string;
  maritalStatus: string; location: string; ethnicity: string;
  nationality: string; employment: string; height: string;
  weight: string; howFound: string; dress: string;
  pray: string; children: string; subscription: string;
  prefAgeRange: string; prefEthnicity: string; prefMaritalStatus: string;
};

const EMPTY_FILTERS: FilterValues = {
  name: "", code: "", gender: "", ageMin: "", ageMax: "", verification: "",
  maritalStatus: "", location: "", ethnicity: "", nationality: "",
  employment: "", height: "", weight: "", howFound: "", dress: "",
  pray: "", children: "", subscription: "", prefAgeRange: "",
  prefEthnicity: "", prefMaritalStatus: "",
};

// ── Shared field styles ───────────────────────────────────────────────────────

const fieldClass =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#415192]/30 bg-white";

// ── Small reusable field wrappers ─────────────────────────────────────────────

function FL({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function FSel({
  label, value, onChange, options, placeholder = "All",
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string;
}) {
  return (
    <FL label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </FL>
  );
}

function FIn({
  label, value, onChange, placeholder = "", type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <FL label={label}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={fieldClass}
      />
    </FL>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 mt-1">
      {children}
    </p>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function Users() {
  const [searchTerm, setSearchTerm] = useState("");

  // Applied filters (used for actual table filtering)
  const [applied, setApplied] = useState<FilterValues>(EMPTY_FILTERS);
  // Draft filters (shown in the popup before Apply is clicked)
  const [draft, setDraft] = useState<FilterValues>(EMPTY_FILTERS);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Block states
  const [blockedUsers, setBlockedUsers] = useState<Set<number>>(new Set());
  const [blockConfirmUserId, setBlockConfirmUserId] = useState<number | null>(null);
  const [unblockConfirmUserId, setUnblockConfirmUserId] = useState<number | null>(null);

  const resetPage = () => setCurrentPage(1);

  // Count of active applied filters
  const activeCount = Object.values(applied).filter((v) => v !== "").length;

  const setDraftField = (field: keyof FilterValues, value: string) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

  const openModal = () => {
    setDraft({ ...applied });
    setShowFilterModal(true);
  };

  const applyFilters = () => {
    setApplied({ ...draft });
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const clearDraft = () => setDraft({ ...EMPTY_FILTERS });

  const clearApplied = () => {
    setApplied({ ...EMPTY_FILTERS });
    setDraft({ ...EMPTY_FILTERS });
    resetPage();
  };

  // ── Filter logic ──────────────────────────────────────────────────────────

  const filteredUsers = mockUsers.filter((user) => {
    // Main quick search (name / location / profession)
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      if (
        !user.name.toLowerCase().includes(t) &&
        !user.location.toLowerCase().includes(t) &&
        !user.profession.toLowerCase().includes(t)
      ) return false;
    }

    const f = applied;

    // Name
    if (f.name && !user.name.toLowerCase().includes(f.name.toLowerCase())) return false;

    // Code (mapped to user id in mock data)
    if (f.code && !String(user.id).includes(f.code)) return false;

    // Gender
    if (f.gender && user.gender !== f.gender) return false;

    // Age range
    if (f.ageMin && user.age < Number(f.ageMin)) return false;
    if (f.ageMax && user.age > Number(f.ageMax)) return false;

    // Marital status (direct label match against mock data values)
    if (f.maritalStatus && user.maritalStatus !== f.maritalStatus) return false;

    // Location (partial match)
    if (f.location && !user.location.toLowerCase().includes(f.location.toLowerCase())) return false;

    // Ethnicity (partial match — mock data uses broad categories; real data will match granular choices)
    if (f.ethnicity && !user.ethnicity.toLowerCase().includes(f.ethnicity.toLowerCase())) return false;

    // Height (partial text match on stored string, e.g. "5'6"")
    if (f.height && !user.height.toLowerCase().includes(f.height.toLowerCase())) return false;

    // Preferred age range (partial match on preferences string)
    if (f.prefAgeRange && !user.preferences.ageRange.toLowerCase().includes(f.prefAgeRange.toLowerCase())) return false;

    // Fields without mock data (nationality, employment, weight, howFound,
    // dress, pray, children, subscription, verification, prefEthnicity,
    // prefMaritalStatus) — UI-ready for real backend, no-op on mock data.

    return true;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const confirmBlockUser = (userId: number) => {
    setBlockedUsers((prev) => new Set([...prev, userId]));
    setBlockConfirmUserId(null);
  };

  const confirmUnblockUser = (userId: number) => {
    setBlockedUsers((prev) => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
    setUnblockConfirmUserId(null);
  };

  const blockConfirmTarget = blockConfirmUserId !== null
    ? mockUsers.find((u) => u.id === blockConfirmUserId)
    : null;

  const unblockConfirmTarget = unblockConfirmUserId !== null
    ? mockUsers.find((u) => u.id === unblockConfirmUserId)
    : null;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Users Management</h1>
        <p className="text-gray-500 mt-1">Manage and view all registered users</p>
      </div>

      {/* Search & Filter bar */}
      <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Quick search by name, location, profession..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); resetPage(); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
            />
          </div>

          {/* Clear applied filters badge */}
          {activeCount > 0 && (
            <button
              onClick={clearApplied}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          )}

          <button
            onClick={openModal}
            className={`px-4 py-2.5 border rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
              activeCount > 0
                ? "border-[#415192] bg-[#415192]/5 text-[#415192]"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeCount > 0 && (
              <span className="bg-[#415192] text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Religion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const isBlocked = blockedUsers.has(user.id);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-[#415192] flex items-center justify-center text-white shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.gender}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.age}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.religion}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            isBlocked
                              ? "bg-red-100 text-red-700"
                              : user.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {isBlocked ? "Blocked" : user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                            <div
                              className="bg-[#415192] h-2 rounded-full"
                              style={{ width: `${user.completion}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{user.completion}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/users/${user.id}`}
                            title="View user"
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </Link>
                          {isBlocked ? (
                            <button
                              title="Unblock user"
                              onClick={() => setUnblockConfirmUserId(user.id)}
                              className="p-1.5 hover:bg-green-50 rounded transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4 text-green-600" />
                            </button>
                          ) : (
                            <button
                              title="Block user"
                              onClick={() => setBlockConfirmUserId(user.id)}
                              className="p-1.5 hover:bg-red-50 rounded transition-colors"
                            >
                              <Ban className="w-4 h-4 text-gray-600 hover:text-red-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          totalItems={filteredUsers.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          itemLabel="users"
        />
      </div>

      {/* ── Advanced Filter Modal ──────────────────────────────────────────── */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#415192]/10 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5 text-[#415192]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Advanced Filters</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Narrow down users by specific criteria</p>
                </div>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 flex-1 space-y-6">

              {/* Section: Search */}
              <div>
                <SectionLabel>Search</SectionLabel>
                <div className="grid grid-cols-3 gap-4">
                  <FIn
                    label="Name"
                    value={draft.name}
                    onChange={(v) => setDraftField("name", v)}
                    placeholder="Search by name"
                  />
                  <FIn
                    label="Code"
                    value={draft.code}
                    onChange={(v) => setDraftField("code", v)}
                    placeholder="Search by code"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Section: Demographics */}
              <div>
                <SectionLabel>Demographics</SectionLabel>
                <div className="grid grid-cols-3 gap-4">
                  <FSel
                    label="Gender"
                    value={draft.gender}
                    onChange={(v) => setDraftField("gender", v)}
                    options={GENDER_OPTIONS}
                  />
                  {/* Age range — two inputs within one cell */}
                  <FL label="Age Range">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={draft.ageMin}
                        onChange={(e) => setDraftField("ageMin", e.target.value)}
                        className={fieldClass}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={draft.ageMax}
                        onChange={(e) => setDraftField("ageMax", e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                  </FL>
                  <FSel
                    label="Verification"
                    value={draft.verification}
                    onChange={(v) => setDraftField("verification", v)}
                    options={VERIFICATION_OPTIONS}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <FSel
                    label="Marital Status"
                    value={draft.maritalStatus}
                    onChange={(v) => setDraftField("maritalStatus", v)}
                    options={MARITAL_STATUS_OPTIONS}
                  />
                  <FIn
                    label="Location"
                    value={draft.location}
                    onChange={(v) => setDraftField("location", v)}
                    placeholder="e.g. London, UK"
                  />
                  <FSel
                    label="Ethnicity"
                    value={draft.ethnicity}
                    onChange={(v) => setDraftField("ethnicity", v)}
                    options={ETHNICITY_OPTIONS}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Section: Personal */}
              <div>
                <SectionLabel>Personal</SectionLabel>
                <div className="grid grid-cols-3 gap-4">
                  <FSel
                    label="Nationality"
                    value={draft.nationality}
                    onChange={(v) => setDraftField("nationality", v)}
                    options={NATIONALITY_OPTIONS}
                  />
                  <FSel
                    label="Employment"
                    value={draft.employment}
                    onChange={(v) => setDraftField("employment", v)}
                    options={EMPLOYMENT_OPTIONS}
                  />
                  <FIn
                    label="Height"
                    value={draft.height}
                    onChange={(v) => setDraftField("height", v)}
                    placeholder={`e.g. 5'6"`}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <FIn
                    label="Weight"
                    value={draft.weight}
                    onChange={(v) => setDraftField("weight", v)}
                    placeholder="e.g. 70kg"
                  />
                  <FSel
                    label="How do you dress?"
                    value={draft.dress}
                    onChange={(v) => setDraftField("dress", v)}
                    options={DRESS_OPTIONS}
                  />
                  <FSel
                    label="Pray 5x a day?"
                    value={draft.pray}
                    onChange={(v) => setDraftField("pray", v)}
                    options={PRAY_OPTIONS}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Section: Account */}
              <div>
                <SectionLabel>Account</SectionLabel>
                <div className="grid grid-cols-3 gap-4">
                  <FSel
                    label="Do you have children?"
                    value={draft.children}
                    onChange={(v) => setDraftField("children", v)}
                    options={CHILDREN_OPTIONS}
                  />
                  <FSel
                    label="How did you find us?"
                    value={draft.howFound}
                    onChange={(v) => setDraftField("howFound", v)}
                    options={HOW_FOUND_OPTIONS}
                  />
                  <FSel
                    label="Subscription type"
                    value={draft.subscription}
                    onChange={(v) => setDraftField("subscription", v)}
                    options={SUBSCRIPTION_OPTIONS}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Section: Partner Preferences */}
              <div>
                <SectionLabel>Partner Preferences</SectionLabel>
                <div className="grid grid-cols-3 gap-4">
                  <FIn
                    label="Preferred age range"
                    value={draft.prefAgeRange}
                    onChange={(v) => setDraftField("prefAgeRange", v)}
                    placeholder="e.g. 28 - 35"
                  />
                  <FSel
                    label="Preferred ethnicity"
                    value={draft.prefEthnicity}
                    onChange={(v) => setDraftField("prefEthnicity", v)}
                    options={ETHNICITY_OPTIONS}
                  />
                  <FSel
                    label="Preferred marital status"
                    value={draft.prefMaritalStatus}
                    onChange={(v) => setDraftField("prefMaritalStatus", v)}
                    options={MARITAL_STATUS_OPTIONS}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={clearDraft}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                Clear all
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilters}
                  className="px-5 py-2 bg-[#415192] text-white rounded-lg text-sm font-medium hover:bg-[#354177] transition-colors"
                >
                  Apply Filters
                  {Object.values(draft).filter((v) => v !== "").length > 0 && (
                    <span className="ml-2 bg-white/20 text-white text-[11px] font-bold rounded-full px-1.5 py-0.5">
                      {Object.values(draft).filter((v) => v !== "").length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Unblock Confirmation Modal ─────────────────────────────────────── */}
      {unblockConfirmUserId !== null && unblockConfirmTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Unblock User</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              <span className="font-medium text-gray-700">{unblockConfirmTarget.name}</span> will
              regain full access to the platform.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setUnblockConfirmUserId(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmUnblockUser(unblockConfirmUserId)}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Unblock User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Block Confirmation Modal ───────────────────────────────────────── */}
      {blockConfirmUserId !== null && blockConfirmTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Ban className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Block User</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              <span className="font-medium text-gray-700">{blockConfirmTarget.name}</span> will be
              temporarily blocked from using the platform. You can unblock them at any time.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setBlockConfirmUserId(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmBlockUser(blockConfirmUserId)}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Block User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
