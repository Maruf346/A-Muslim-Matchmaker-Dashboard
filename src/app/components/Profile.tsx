import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Filter,
  Loader2,
  Lock,
  Mail,
  Plus,
  Save,
  Search,
  Shield,
  Upload,
  User,
  X,
} from "lucide-react";
import {
  AdminProfile,
  MatchmakerAccount,
  changePassword,
  createMatchmaker,
  getAdminProfile,
  listMatchmakers,
  updateAdminProfile,
} from "../api/adminUsers";
import { ApiError } from "../api/errors";
import {
  getAuthSession,
  getAdminType,
  getUserDisplayName,
  getUserInitials,
  isSuperAdmin,
  saveAuthSession,
} from "../lib/authStorage";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMemberSince(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function roleLabel(role: string) {
  return role === "superadmin" ? "Super Admin" : "Matchmaker";
}

function roleValue(role: string) {
  return role === "superadmin" ? "superadmin" : "matchmaker";
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

export function Profile() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const profilePictureInputRef = useRef<HTMLInputElement | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [matchmakers, setMatchmakers] = useState<MatchmakerAccount[]>([]);
  const [matchmakerCount, setMatchmakerCount] = useState(0);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | "matchmaker" | "superadmin">("matchmaker");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFirstName, setCreateFirstName] = useState("");
  const [createLastName, setCreateLastName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createPicturePreview, setCreatePicturePreview] = useState<string | null>(null);
  const [createPictureFile, setCreatePictureFile] = useState<File | null>(null);
  const createPictureInputRef = useRef<HTMLInputElement | null>(null);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast(message);
    toastTimeout.current = setTimeout(() => setToast(null), 2800);
  };

  const currentAdminType = getAdminType();
  const currentSession = getAuthSession();
  const isSuperAdminUser = isSuperAdmin();

  const populateProfileForm = (value: AdminProfile) => {
    setFirstName(value.first_name ?? "");
    setLastName(value.last_name ?? "");
    setEmail(value.email ?? "");
    setProfilePicturePreview(value.profile_picture ?? null);
    setProfilePictureFile(null);
  };

  const loadProfile = async () => {
    setLoadingProfile(true);
    setProfileError(null);

    try {
      const response = await getAdminProfile();
      setProfile(response);
      populateProfileForm(response);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to load your profile.";
      setProfileError(message);
      showToast(message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadMatchmakers = async () => {
    if (!isSuperAdminUser) return;

    setListLoading(true);
    setListError(null);

    try {
      const response = await listMatchmakers({
        page: currentPage,
        page_size: pageSize,
        role: roleFilter || undefined,
        is_active:
          activeFilter === ""
            ? undefined
            : activeFilter === "true",
        search: searchTerm.trim() || undefined,
      });

      setMatchmakers(response.results ?? []);
      setMatchmakerCount(response.count ?? 0);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to load matchmakers.";
      setListError(message);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  useEffect(() => {
    void loadMatchmakers();
  }, [currentPage, pageSize, roleFilter, activeFilter, searchTerm, isSuperAdminUser]);

  const resetMatchmakerPage = () => setCurrentPage(1);

  const activeFilterCount =
    Number(Boolean(searchTerm.trim())) +
    Number(Boolean(roleFilter)) +
    Number(Boolean(activeFilter));

  const startEditProfile = () => {
    if (profile) {
      populateProfileForm(profile);
    }
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditing(true);
  };

  const cancelEditProfile = () => {
    if (profile) {
      populateProfileForm(profile);
    }
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditing(false);
  };

  const handleProfilePictureSelected = async (file: File | null) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setProfilePicturePreview(dataUrl);
    setProfilePictureFile(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);

    try {
      const profilePayload: {
        first_name?: string;
        last_name?: string;
        profile_picture?: File | null;
      } = {};

      if (!profile) {
        throw new Error("Profile data is missing.");
      }

      if (firstName.trim() !== profile.first_name) profilePayload.first_name = firstName.trim();
      if (lastName.trim() !== profile.last_name) profilePayload.last_name = lastName.trim();
      if (profilePictureFile !== null) profilePayload.profile_picture = profilePictureFile;

      const hasProfileChanges = Object.keys(profilePayload).length > 0;
      const hasPasswordInput = oldPassword || newPassword || confirmPassword;

      if (hasPasswordInput) {
        if (!oldPassword || !newPassword || !confirmPassword) {
          throw new Error("Fill all password fields before saving a password change.");
        }

        if (newPassword !== confirmPassword) {
          throw new Error("New password and confirmation do not match.");
        }
      }

      let updatedProfile = profile;

      if (hasProfileChanges) {
        updatedProfile = await updateAdminProfile(profilePayload);
      }

      if (hasPasswordInput) {
        await changePassword({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_new_password: confirmPassword,
        });
      }

      setProfile(updatedProfile);
      populateProfileForm(updatedProfile);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsEditing(false);

      if (currentSession) {
        saveAuthSession({
          ...currentSession,
          user: updatedProfile,
        });
      }

      showToast("Profile updated successfully.");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : error instanceof Error ? error.message : "Unable to save profile.";
      showToast(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMatchmaker = async () => {
    setCreateError(null);

    if (!createFirstName.trim() || !createLastName.trim() || !createEmail.trim() || !createPassword.trim()) {
      setCreateError("Please fill in all required fields.");
      return;
    }

    setCreateSaving(true);

    try {
      await createMatchmaker({
        first_name: createFirstName.trim(),
        last_name: createLastName.trim(),
        email: createEmail.trim(),
        password: createPassword,
        profile_picture: createPictureFile ?? undefined,
      });

      setCreateFirstName("");
      setCreateLastName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreatePicturePreview(null);
      setCreatePictureFile(null);
      setShowCreateModal(false);
      showToast("Matchmaker created successfully.");
      resetMatchmakerPage();
      await loadMatchmakers();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to create matchmaker.";
      setCreateError(message);
    } finally {
      setCreateSaving(false);
    }
  };

  const roleText = profile ? roleLabel(roleValue(profile.role)) : "Admin";
  const memberSinceText = profile ? formatMemberSince(profile.member_since) : "—";
  const displayName = getUserDisplayName(profile);
  const initials = getUserInitials(profile);
  const canManageMatchmakers = isSuperAdminUser;
  const totalPages = Math.max(1, Math.ceil(matchmakerCount / pageSize));

  return (
    <div className="p-8 space-y-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Profile Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage your own profile and, if you are a superadmin, your matchmaker accounts.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={startEditProfile}
            className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {loadingProfile ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500 flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-[#415192]" />
          Loading your profile...
        </div>
      ) : profileError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 flex items-start gap-3">
          <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" />
          <div>
            <p className="font-medium">Could not load profile</p>
            <p className="mt-1">{profileError}</p>
            <button
              onClick={loadProfile}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#415192] shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
            >
              Try again
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
          <div className="space-y-6">
            <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Profile Picture</h3>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#415192] to-[#ACB5DA] flex items-center justify-center text-white text-5xl mb-4 overflow-hidden">
                  {profilePicturePreview ? (
                    <img src={profilePicturePreview} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                {isEditing && (
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => profilePictureInputRef.current?.click()}
                      className="inline-flex items-center gap-2 text-sm text-[#415192] hover:underline"
                    >
                      <Upload className="w-4 h-4" />
                      Change Photo
                    </button>
                    <input
                      ref={profilePictureInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0] ?? null;
                        await handleProfilePictureSelected(file);
                        e.target.value = "";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Account Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Role</p>
                    <p className="text-gray-900 font-medium">{roleText}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Member Since</p>
                    <p className="text-gray-900 font-medium">{memberSinceText}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] disabled:bg-gray-100 disabled:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] disabled:bg-gray-100 disabled:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
                    <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="email"
                      value={email}
                      disabled
                      readOnly
                      className="w-full bg-transparent text-gray-900 outline-none disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192]"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Leave password fields empty if you do not want to change your password.
                  </p>
                </div>
              </div>
            )}

            {isEditing && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-6 py-3 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={cancelEditProfile}
                  disabled={saving}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {canManageMatchmakers ? (
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Matchmakers</h2>
              <p className="text-gray-500 mt-1">Search, filter, and manage matchmaker accounts.</p>
            </div>
            <button
              onClick={() => {
                setCreateError(null);
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Matchmaker
            </button>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_repeat(2,minmax(0,200px))] mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  resetMatchmakerPage();
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#415192]"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as "" | "matchmaker" | "superadmin");
                resetMatchmakerPage();
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#415192]"
            >
              <option value="">All Roles</option>
              <option value="matchmaker">Matchmaker</option>
              <option value="superadmin">Superadmin</option>
            </select>
            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value as "" | "true" | "false");
                resetMatchmakerPage();
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#415192]"
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
            <p>
              {activeFilterCount > 0 ? `${activeFilterCount} filter(s) active` : "Showing all matchmakers"}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("matchmaker");
                  setActiveFilter("");
                  resetMatchmakerPage();
                }}
                className="inline-flex items-center gap-1.5 text-[#415192] hover:underline"
              >
                <X className="w-4 h-4" />
                Clear filters
              </button>
            )}
          </div>

          {listLoading ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 text-sm text-gray-500 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-[#415192]" />
              Loading matchmakers...
            </div>
          ) : listError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 flex items-start gap-3">
              <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" />
              <div>
                <p className="font-medium">Could not load matchmakers</p>
                <p className="mt-1">{listError}</p>
                <button
                  onClick={loadMatchmakers}
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
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {matchmakers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                          No matchmakers found.
                        </td>
                      </tr>
                    ) : (
                      matchmakers.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#415192] text-white flex items-center justify-center text-sm font-semibold overflow-hidden">
                                {item.profile_picture ? (
                                  <img src={item.profile_picture} alt={`${item.first_name} ${item.last_name}`} className="w-full h-full object-cover" />
                                ) : (
                                  <span>{(item.first_name?.charAt(0) ?? item.email.charAt(0)).toUpperCase()}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.first_name} {item.last_name}
                                </p>
                                <p className="text-xs text-gray-500">{item.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">{item.email}</td>
                          <td className="px-4 py-4">{roleLabel(item.role)}</td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                item.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {item.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-4">{formatDate(item.created_at)}</td>
                          <td className="px-4 py-4">
                            <Link
                              to={`/matchmakers/${item.id}`}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors text-xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
                <p>
                  Showing {matchmakers.length} of {matchmakerCount} matchmakers
                </p>
                <div className="inline-flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span>
                    Page <span className="font-semibold text-gray-900">{currentPage}</span> of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="rounded-3xl border border-gray-100 bg-white p-6 text-sm text-gray-600">
          Matchmaker management tools are available to superadmins only.
        </section>
      )}

      {showCreateModal && canManageMatchmakers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create Matchmaker</h2>
                <p className="text-sm text-gray-500">Add a new matchmaker account for the platform.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={createFirstName}
                  onChange={(e) => setCreateFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#415192]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={createLastName}
                  onChange={(e) => setCreateLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#415192]"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#415192]"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#415192]"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="w-20 h-20 rounded-full bg-[#E5E7EB] overflow-hidden flex items-center justify-center text-2xl text-gray-700 shrink-0">
                    {createPicturePreview ? (
                      <img src={createPicturePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span>{(createFirstName.charAt(0) || createEmail.charAt(0) || "M").toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => createPictureInputRef.current?.click()}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Choose Picture
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCreatePicturePreview(null);
                        setCreatePictureFile(null);
                      }}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Clear Picture
                    </button>
                    <input
                      ref={createPictureInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0] ?? null;
                        if (!file) return;
                        const dataUrl = await readFileAsDataUrl(file);
                        setCreatePicturePreview(dataUrl);
                        setCreatePictureFile(file);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {createError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={createSaving}
                className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMatchmaker}
                disabled={createSaving}
                className="px-5 py-3 rounded-xl bg-[#415192] text-white hover:bg-[#354177] transition-colors disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {createSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {createSaving ? "Creating..." : "Create Matchmaker"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <style>{`
            @keyframes toastSlide {
              0%   { transform: translateX(110%); opacity: 0; }
              10%  { transform: translateX(0);    opacity: 1; }
              78%  { transform: translateX(0);    opacity: 1; }
              100% { transform: translateX(0);    opacity: 0; }
            }
          `}</style>
          <div
            style={{ animation: "toastSlide 2.8s ease forwards" }}
            className="flex items-center gap-3 bg-white border border-gray-200 shadow-xl rounded-xl px-5 py-4 min-w-[280px]"
          >
            <div className="flex items-center justify-center w-9 h-9 bg-green-100 rounded-full shrink-0">
              <AlertCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Saved</p>
              <p className="text-xs text-gray-500 mt-0.5">{toast}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
