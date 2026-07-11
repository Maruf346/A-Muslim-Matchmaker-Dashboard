import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Ban, CheckCircle2, Eye, Filter, Loader2, Search, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { TablePagination } from "./ui/TablePagination";
import {
  blockUser,
  listUsers,
  type AdminUserAccount,
} from "../api/adminUsers";
import { ApiError } from "../api/errors";
import {
  CHILDREN_COUNT_OPTIONS,
  EDUCATION_OPTIONS,
  ETHNICITY_OPTIONS,
  FRAME_OPTIONS,
  HOW_FOUND_OPTIONS,
  INCOME_OPTIONS,
  LANGUAGE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  NATIONALITY_OPTIONS,
  PRAY_OPTIONS,
  RELOCATION_OPTIONS,
  SECT_OPTIONS,
} from "../data/filterChoices";

type TriState = "" | "true" | "false";

type UserFilters = {
  about_yourself: string;
  age: string;
  children_count: string;
  city: string;
  country: string;
  date_of_birth: string;
  education: string;
  employment: string;
  envision_marriage: string;
  envision_spouse: string;
  ethnicity: string;
  frame: string;
  gender: string;
  has_children: TriState;
  health_concerns: string;
  height: string;
  how_found: string;
  income: string;
  is_active: TriState;
  is_verified: TriState;
  languages_spoken: string;
  marital_status: string;
  nationality: string;
  open_to_relocate: string;
  open_to_relocate_details: string;
  ordering: string;
  other_preferences: string;
  pray_5x: string;
  pref_age_max: string;
  pref_age_min: string;
  pref_country_of_residence: string;
  pref_ethnicity: string;
  pref_marital_status: string;
  relationship_with_islam: string;
  role: string;
  role_as_spouse: string;
  sect: string;
  spouse_religious_status_pref: string;
  subscription_plan: string;
  wali_profile_gender: string;
  wali_profile_how_found: string;
  wali_profile_phone: string;
  wali_profile_relation_to_sister: string;
  weight: string;
};

const EMPTY_FILTERS: UserFilters = {
  about_yourself: "",
  age: "",
  children_count: "",
  city: "",
  country: "",
  date_of_birth: "",
  education: "",
  employment: "",
  envision_marriage: "",
  envision_spouse: "",
  ethnicity: "",
  frame: "",
  gender: "",
  has_children: "",
  health_concerns: "",
  height: "",
  how_found: "",
  income: "",
  is_active: "",
  is_verified: "",
  languages_spoken: "",
  marital_status: "",
  nationality: "",
  open_to_relocate: "",
  open_to_relocate_details: "",
  ordering: "",
  other_preferences: "",
  pray_5x: "",
  pref_age_max: "",
  pref_age_min: "",
  pref_country_of_residence: "",
  pref_ethnicity: "",
  pref_marital_status: "",
  relationship_with_islam: "",
  role: "",
  role_as_spouse: "",
  sect: "",
  spouse_religious_status_pref: "",
  subscription_plan: "",
  wali_profile_gender: "",
  wali_profile_how_found: "",
  wali_profile_phone: "",
  wali_profile_relation_to_sister: "",
  weight: "",
};

const ROLE_OPTIONS = [
  { label: "All", value: "" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Wali", value: "wali" },
];

const GENDER_OPTIONS = [
  { label: "All", value: "" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const BOOLEAN_OPTIONS = [
  { label: "Any", value: "" },
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];

const SUBSCRIPTION_OPTIONS = [
  { label: "All", value: "" },
  { label: "Free", value: "free" },
  { label: "Monthly", value: "monthly" },
  { label: "Annual", value: "annual" },
];

const ORDERING_OPTIONS = [
  { label: "Newest first", value: "-created_at" },
  { label: "Oldest first", value: "created_at" },
  { label: "Last active", value: "-last_active" },
  { label: "Age ascending", value: "age" },
  { label: "Age descending", value: "-age" },
];

const fieldClass =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#415192]/30 bg-white";

function displayValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function formatBool(value: boolean | null | undefined) {
  if (value === null || value === undefined) return "—";
  return value ? "Yes" : "No";
}

function formatRole(role: string | null | undefined) {
  if (!role) return "—";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatName(user: AdminUserAccount) {
  return `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.email;
}

function initialsFor(user: AdminUserAccount) {
  const first = user.first_name?.charAt(0) ?? "";
  const last = user.last_name?.charAt(0) ?? "";
  const initials = `${first}${last}`.trim();
  return initials.toUpperCase() || user.email.charAt(0).toUpperCase();
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass}>
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={fieldClass}
      />
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 mt-1">
      {children}
    </p>
  );
}

function triStateToBoolean(value: TriState) {
  if (value === "") return undefined;
  return value === "true";
}

export function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [applied, setApplied] = useState<UserFilters>(EMPTY_FILTERS);
  const [draft, setDraft] = useState<UserFilters>(EMPTY_FILTERS);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [users, setUsers] = useState<AdminUserAccount[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  const [blockTarget, setBlockTarget] = useState<AdminUserAccount | null>(null);
  const [blockAction, setBlockAction] = useState<"block" | "unblock" | null>(null);
  const [blockSaving, setBlockSaving] = useState(false);

  const activeCount = useMemo(() => {
    const appliedCount = Object.values(applied).filter((value) => value !== "").length;
    return appliedCount + Number(Boolean(searchTerm.trim()));
  }, [applied, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await listUsers({
          page: currentPage,
          page_size: pageSize,
          search: debouncedSearch || undefined,
          about_yourself: applied.about_yourself || undefined,
          age: applied.age || undefined,
          children_count: applied.children_count || undefined,
          city: applied.city || undefined,
          country: applied.country || undefined,
          date_of_birth: applied.date_of_birth || undefined,
          education: applied.education || undefined,
          employment: applied.employment || undefined,
          envision_marriage: applied.envision_marriage || undefined,
          envision_spouse: applied.envision_spouse || undefined,
          ethnicity: applied.ethnicity || undefined,
          frame: applied.frame || undefined,
          gender: applied.gender || undefined,
          has_children: triStateToBoolean(applied.has_children),
          health_concerns: applied.health_concerns || undefined,
          height: applied.height || undefined,
          how_found: applied.how_found || undefined,
          income: applied.income || undefined,
          is_active: triStateToBoolean(applied.is_active),
          is_verified: triStateToBoolean(applied.is_verified),
          languages_spoken: applied.languages_spoken || undefined,
          marital_status: applied.marital_status || undefined,
          nationality: applied.nationality || undefined,
          open_to_relocate: applied.open_to_relocate || undefined,
          open_to_relocate_details: applied.open_to_relocate_details || undefined,
          ordering: applied.ordering || undefined,
          other_preferences: applied.other_preferences || undefined,
          pray_5x: applied.pray_5x || undefined,
          pref_age_max: applied.pref_age_max || undefined,
          pref_age_min: applied.pref_age_min || undefined,
          pref_country_of_residence: applied.pref_country_of_residence || undefined,
          pref_ethnicity: applied.pref_ethnicity || undefined,
          pref_marital_status: applied.pref_marital_status || undefined,
          relationship_with_islam: applied.relationship_with_islam || undefined,
          role: applied.role || undefined,
          role_as_spouse: applied.role_as_spouse || undefined,
          sect: applied.sect || undefined,
          spouse_religious_status_pref: applied.spouse_religious_status_pref || undefined,
          subscription_plan: applied.subscription_plan || undefined,
          wali_profile_gender: applied.wali_profile_gender || undefined,
          wali_profile_how_found: applied.wali_profile_how_found || undefined,
          wali_profile_phone: applied.wali_profile_phone || undefined,
          wali_profile_relation_to_sister: applied.wali_profile_relation_to_sister || undefined,
          weight: applied.weight || undefined,
        });

        setUsers(response.results ?? []);
        setTotalCount(response.count ?? 0);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Unable to load users.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [applied, currentPage, debouncedSearch, pageSize, reloadIndex]);

  const setDraftField = (field: keyof UserFilters, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

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
    setSearchTerm("");
    setDebouncedSearch("");
    setApplied({ ...EMPTY_FILTERS });
    setDraft({ ...EMPTY_FILTERS });
    setCurrentPage(1);
  };

  const handleBlockAction = async () => {
    if (!blockTarget || !blockAction) return;

    setBlockSaving(true);

    try {
      await blockUser(blockTarget.id, blockAction === "unblock");
      setBlockTarget(null);
      setBlockAction(null);
      const response = await listUsers({
        page: currentPage,
        page_size: pageSize,
        search: debouncedSearch || undefined,
        about_yourself: applied.about_yourself || undefined,
        age: applied.age || undefined,
        children_count: applied.children_count || undefined,
        city: applied.city || undefined,
        country: applied.country || undefined,
        date_of_birth: applied.date_of_birth || undefined,
        education: applied.education || undefined,
        employment: applied.employment || undefined,
        envision_marriage: applied.envision_marriage || undefined,
        envision_spouse: applied.envision_spouse || undefined,
        ethnicity: applied.ethnicity || undefined,
        frame: applied.frame || undefined,
        gender: applied.gender || undefined,
        has_children: triStateToBoolean(applied.has_children),
        health_concerns: applied.health_concerns || undefined,
        height: applied.height || undefined,
        how_found: applied.how_found || undefined,
        income: applied.income || undefined,
        is_active: triStateToBoolean(applied.is_active),
        is_verified: triStateToBoolean(applied.is_verified),
        languages_spoken: applied.languages_spoken || undefined,
        marital_status: applied.marital_status || undefined,
        nationality: applied.nationality || undefined,
        open_to_relocate: applied.open_to_relocate || undefined,
        open_to_relocate_details: applied.open_to_relocate_details || undefined,
        ordering: applied.ordering || undefined,
        other_preferences: applied.other_preferences || undefined,
        pray_5x: applied.pray_5x || undefined,
        pref_age_max: applied.pref_age_max || undefined,
        pref_age_min: applied.pref_age_min || undefined,
        pref_country_of_residence: applied.pref_country_of_residence || undefined,
        pref_ethnicity: applied.pref_ethnicity || undefined,
        pref_marital_status: applied.pref_marital_status || undefined,
        relationship_with_islam: applied.relationship_with_islam || undefined,
        role: applied.role || undefined,
        role_as_spouse: applied.role_as_spouse || undefined,
        sect: applied.sect || undefined,
        spouse_religious_status_pref: applied.spouse_religious_status_pref || undefined,
        subscription_plan: applied.subscription_plan || undefined,
        wali_profile_gender: applied.wali_profile_gender || undefined,
        wali_profile_how_found: applied.wali_profile_how_found || undefined,
        wali_profile_phone: applied.wali_profile_phone || undefined,
        wali_profile_relation_to_sister: applied.wali_profile_relation_to_sister || undefined,
        weight: applied.weight || undefined,
      });
      setUsers(response.results ?? []);
      setTotalCount(response.count ?? 0);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to update user status.";
      setError(message);
    } finally {
      setBlockSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Users Management</h1>
        <p className="text-gray-500 mt-1">Search, filter, and manage all registered users.</p>
      </div>

      <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex flex-col gap-4 xl:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Quick search by first name, last name, email, or codename..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
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
              Advanced Filters
              {activeCount > 0 && (
                <span className="bg-[#415192] text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-sm text-gray-500 flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-[#415192]" />
            Loading users...
          </div>
        ) : error ? (
          <div className="p-8 text-sm text-red-700 flex items-start gap-3 bg-red-50">
            <X className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Could not load users</p>
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
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Codename</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Age</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Sect</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Verified</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-10 text-center text-sm text-gray-400">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const isBlocked = !user.is_active;
                      const actionLabel = isBlocked ? "Unblock" : "Block";

                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#415192] text-white flex items-center justify-center text-sm font-semibold overflow-hidden shrink-0">
                                {user.profile_picture ? (
                                  <img
                                    src={user.profile_picture}
                                    alt={formatName(user)}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>{initialsFor(user)}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{formatName(user)}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-600">{user.codename ?? "—"}</td>
                          <td className="px-4 py-4 text-gray-600">{formatRole(user.role)}</td>
                          <td className="px-4 py-4 text-gray-600">{displayValue(user.age)}</td>
                          <td className="px-4 py-4 text-gray-600">
                            <div>
                              <p>{displayValue(user.city)}</p>
                              <p className="text-xs text-gray-400">{displayValue(user.country)}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-600">{displayValue(user.sect)}</td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                user.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 capitalize">
                              {displayValue(user.subscription_plan)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                                user.is_verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {user.is_verified ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <X className="w-3.5 h-3.5" />
                              )}
                              {formatBool(user.is_verified)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-4">
                              <Link
                                to={`/users/${user.id}`}
                                aria-label="View user"
                                title="View user"
                                className="inline-flex items-center justify-center text-gray-700 transition-colors hover:text-[#415192]"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button
                                aria-label={actionLabel}
                                title={actionLabel}
                                onClick={() => {
                                  setBlockTarget(user);
                                  setBlockAction(isBlocked ? "unblock" : "block");
                                }}
                                className={`inline-flex items-center justify-center transition-colors ${
                                  isBlocked
                                    ? "text-green-700 hover:text-green-800"
                                    : "text-red-600 hover:text-red-700"
                                }`}
                              >
                                {isBlocked ? (
                                  <ShieldCheck className="w-4 h-4" />
                                ) : (
                                  <Ban className="w-4 h-4" />
                                )}
                              </button>
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
              totalItems={totalCount}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemLabel="users"
            />
          </>
        )}
      </div>

      {showFilterModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#415192]/10 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5 text-[#415192]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Advanced Filters</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Apply backend filters from the admin users API.</p>
                </div>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 flex-1 space-y-6">
              <div>
                <SectionLabel>Core</SectionLabel>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <SelectField
                    label="Role"
                    value={draft.role}
                    onChange={(value) => setDraftField("role", value)}
                    options={ROLE_OPTIONS}
                  />
                  <SelectField
                    label="Gender"
                    value={draft.gender}
                    onChange={(value) => setDraftField("gender", value)}
                    options={GENDER_OPTIONS}
                  />
                  <SelectField
                    label="Subscription Plan"
                    value={draft.subscription_plan}
                    onChange={(value) => setDraftField("subscription_plan", value)}
                    options={SUBSCRIPTION_OPTIONS}
                  />
                  <SelectField
                    label="Active Status"
                    value={draft.is_active}
                    onChange={(value) => setDraftField("is_active", value as TriState)}
                    options={BOOLEAN_OPTIONS}
                  />
                  <SelectField
                    label="Verified"
                    value={draft.is_verified}
                    onChange={(value) => setDraftField("is_verified", value as TriState)}
                    options={BOOLEAN_OPTIONS}
                  />
                  <SelectField
                    label="Ordering"
                    value={draft.ordering}
                    onChange={(value) => setDraftField("ordering", value)}
                    options={[{ label: "Default", value: "" }, ...ORDERING_OPTIONS]}
                  />
                </div>
              </div>

              <div className="border-t border-gray-100" />

              <div>
                <SectionLabel>Identity</SectionLabel>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <TextField
                    label="Age"
                    value={draft.age}
                    onChange={(value) => setDraftField("age", value)}
                    type="number"
                  />
                  <TextField
                    label="Date of Birth"
                    value={draft.date_of_birth}
                    onChange={(value) => setDraftField("date_of_birth", value)}
                    type="date"
                  />
                  <TextField
                    label="City"
                    value={draft.city}
                    onChange={(value) => setDraftField("city", value)}
                    placeholder="City"
                  />
                  <TextField
                    label="Country"
                    value={draft.country}
                    onChange={(value) => setDraftField("country", value)}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100" />

              <div>
                <SectionLabel>Profile</SectionLabel>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <SelectField
                    label="Sect"
                    value={draft.sect}
                    onChange={(value) => setDraftField("sect", value)}
                    options={[{ label: "All", value: "" }, ...SECT_OPTIONS.map((value) => ({ label: value, value }))]}
                  />
                  <SelectField
                    label="Marital Status"
                    value={draft.marital_status}
                    onChange={(value) => setDraftField("marital_status", value)}
                    options={[{ label: "All", value: "" }, ...MARITAL_STATUS_OPTIONS.map((value) => ({ label: value, value }))]}
                  />
                  <SelectField
                    label="Children Count"
                    value={draft.children_count}
                    onChange={(value) => setDraftField("children_count", value)}
                    options={[
                      { label: "All", value: "" },
                      ...CHILDREN_COUNT_OPTIONS.map((value) => ({ label: value, value })),
                    ]}
                  />
                  <SelectField
                    label="Has Children"
                    value={draft.has_children}
                    onChange={(value) => setDraftField("has_children", value as TriState)}
                    options={BOOLEAN_OPTIONS}
                  />
                  <TextField
                    label="Height"
                    value={draft.height}
                    onChange={(value) => setDraftField("height", value)}
                    placeholder="e.g. 5'10 or 178 cm"
                  />
                  <TextField
                    label="Weight"
                    value={draft.weight}
                    onChange={(value) => setDraftField("weight", value)}
                    placeholder="e.g. 70kg"
                  />
                  <SelectField
                    label="Pray 5x"
                    value={draft.pray_5x}
                    onChange={(value) => setDraftField("pray_5x", value)}
                    options={[{ label: "All", value: "" }, ...PRAY_OPTIONS.map((value) => ({ label: value, value }))]}
                  />
                  <SelectField
                    label="Open to Relocate"
                    value={draft.open_to_relocate}
                    onChange={(value) => setDraftField("open_to_relocate", value)}
                    options={[{ label: "All", value: "" }, ...RELOCATION_OPTIONS.map((value) => ({ label: value, value }))]}
                  />
                  <TextField
                    label="Relocate Details"
                    value={draft.open_to_relocate_details}
                    onChange={(value) => setDraftField("open_to_relocate_details", value)}
                    placeholder="Details"
                  />
                  <TextField
                    label="Employment"
                    value={draft.employment}
                    onChange={(value) => setDraftField("employment", value)}
                    placeholder="Employment"
                  />
                  <SelectField
                    label="Education"
                    value={draft.education}
                    onChange={(value) => setDraftField("education", value)}
                    options={[{ label: "All", value: "" }, ...EDUCATION_OPTIONS.map((value) => ({ label: value, value }))]}
                  />
                  <SelectField
                    label="Income"
                    value={draft.income}
                    onChange={(value) => setDraftField("income", value)}
                    options={[{ label: "All", value: "" }, ...INCOME_OPTIONS.map((value) => ({ label: value, value }))]}
                  />
                  <SelectField
                    label="Frame"
                    value={draft.frame}
                    onChange={(value) => setDraftField("frame", value)}
                    options={[{ label: "All", value: "" }, ...FRAME_OPTIONS.map((value) => ({ label: value, value }))]}
                  />
                  <SelectField
                    label="Languages Spoken"
                    value={draft.languages_spoken}
                    onChange={(value) => setDraftField("languages_spoken", value)}
                    options={[{ label: "All", value: "" }, ...LANGUAGE_OPTIONS.map((value) => ({ label: value, value }))]}
                  />
                  <SelectField
                    label="How Found"
                    value={draft.how_found}
                    onChange={(value) => setDraftField("how_found", value)}
                    options={[{ label: "All", value: "" }, ...HOW_FOUND_OPTIONS.map((value) => ({ label: value, value }))]}
                  />
                  <SelectField
                    label="Nationality"
                    value={draft.nationality}
                    onChange={(value) => setDraftField("nationality", value)}
                    options={[{ label: "All", value: "" }, ...NATIONALITY_OPTIONS.map((value) => ({ label: value, value }))]}
                  />
                  <SelectField
                    label="Ethnicity"
                    value={draft.ethnicity}
                    onChange={(value) => setDraftField("ethnicity", value)}
                    options={[{ label: "All", value: "" }, ...ETHNICITY_OPTIONS.map((value) => ({ label: value, value }))]}
                  />
                  <TextField
                    label="Health Concerns"
                    value={draft.health_concerns}
                    onChange={(value) => setDraftField("health_concerns", value)}
                    placeholder="Health concerns"
                  />
                  <TextField
                    label="Other Preferences"
                    value={draft.other_preferences}
                    onChange={(value) => setDraftField("other_preferences", value)}
                    placeholder="Other preferences"
                  />
                  <TextField
                    label="Relationship With Islam"
                    value={draft.relationship_with_islam}
                    onChange={(value) => setDraftField("relationship_with_islam", value)}
                    placeholder="Relationship with Islam"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100" />

              <div>
                <SectionLabel>Preferences</SectionLabel>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <TextField
                    label="Preferred Age Min"
                    value={draft.pref_age_min}
                    onChange={(value) => setDraftField("pref_age_min", value)}
                    type="number"
                  />
                  <TextField
                    label="Preferred Age Max"
                    value={draft.pref_age_max}
                    onChange={(value) => setDraftField("pref_age_max", value)}
                    type="number"
                  />
                  <TextField
                    label="Preferred Country"
                    value={draft.pref_country_of_residence}
                    onChange={(value) => setDraftField("pref_country_of_residence", value)}
                    placeholder="Preferred country"
                  />
                  <SelectField
                    label="Preferred Ethnicity"
                    value={draft.pref_ethnicity}
                    onChange={(value) => setDraftField("pref_ethnicity", value)}
                    options={[{ label: "All", value: "" }, ...ETHNICITY_OPTIONS.map((value) => ({ label: value, value }))]}
                  />
                  <SelectField
                    label="Preferred Marital Status"
                    value={draft.pref_marital_status}
                    onChange={(value) => setDraftField("pref_marital_status", value)}
                    options={[{ label: "All", value: "" }, ...MARITAL_STATUS_OPTIONS.map((value) => ({ label: value, value }))]}
                  />
                  {/*
                  <TextField
                    label="Envision Marriage"
                    value={draft.envision_marriage}
                    onChange={(value) => setDraftField("envision_marriage", value)}
                    placeholder="Envision marriage"
                  />
                  <TextField
                    label="Envision Spouse"
                    value={draft.envision_spouse}
                    onChange={(value) => setDraftField("envision_spouse", value)}
                    placeholder="Envision spouse"
                  />
                  <TextField
                    label="Role As Spouse"
                    value={draft.role_as_spouse}
                    onChange={(value) => setDraftField("role_as_spouse", value)}
                    placeholder="Role as spouse"
                  />
                  <TextField
                    label="Spouse Religious Status"
                    value={draft.spouse_religious_status_pref}
                    onChange={(value) => setDraftField("spouse_religious_status_pref", value)}
                    placeholder="Spouse religious status"
                  />
                  */}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              <div>
                <SectionLabel>Wali</SectionLabel>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <SelectField
                    label="Wali Profile Gender"
                    value={draft.wali_profile_gender}
                    onChange={(value) => setDraftField("wali_profile_gender", value)}
                    options={GENDER_OPTIONS}
                  />
                  <SelectField
                    label="Wali Profile How Found"
                    value={draft.wali_profile_how_found}
                    onChange={(value) => setDraftField("wali_profile_how_found", value)}
                    options={[{ label: "All", value: "" }, ...HOW_FOUND_OPTIONS.map((value) => ({ label: value, value }))]}
                  />
                  <TextField
                    label="Wali Phone"
                    value={draft.wali_profile_phone}
                    onChange={(value) => setDraftField("wali_profile_phone", value)}
                    placeholder="Phone"
                  />
                  <TextField
                    label="Relation to Sister"
                    value={draft.wali_profile_relation_to_sister}
                    onChange={(value) => setDraftField("wali_profile_relation_to_sister", value)}
                    placeholder="Relation to sister"
                  />
                </div>
              </div>
            </div>

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
                  {Object.values(draft).filter((value) => value !== "").length > 0 && (
                    <span className="ml-2 bg-white/20 text-white text-[11px] font-bold rounded-full px-1.5 py-0.5">
                      {Object.values(draft).filter((value) => value !== "").length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {blockTarget && blockAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex flex-col items-center text-center mb-6">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                  blockAction === "block" ? "bg-red-100" : "bg-green-100"
                }`}
              >
                {blockAction === "block" ? (
                  <Ban className="w-7 h-7 text-red-600" />
                ) : (
                  <ShieldCheck className="w-7 h-7 text-green-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {blockAction === "block" ? "Block this user?" : "Unblock this user?"}
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                <span className="font-medium text-gray-700">{formatName(blockTarget)}</span>
                {blockAction === "block"
                  ? " will be temporarily blocked from using the platform."
                  : " will regain access to the platform."}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setBlockTarget(null);
                  setBlockAction(null);
                }}
                disabled={blockSaving}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockAction}
                disabled={blockSaving}
                className={`flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 ${
                  blockAction === "block" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {blockSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {blockAction === "block" ? "Block User" : "Unblock User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
