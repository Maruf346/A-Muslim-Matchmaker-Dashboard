import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  Loader2,
  Mail,
  Save,
  Shield,
  Upload,
  X,
} from "lucide-react";
import {
  changeMatchmakerRole,
  deleteMatchmaker,
  getMatchmaker,
  setMatchmakerActive,
  updateMatchmakerInfo,
  type MatchmakerAccountDetail,
} from "../api/adminUsers";
import { ApiError } from "../api/errors";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

function roleLabel(role: string) {
  return role === "superadmin" ? "Superadmin" : "Matchmaker";
}

export function MatchmakerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [matchmaker, setMatchmaker] = useState<MatchmakerAccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate" | "role" | "delete" | null>(null);

  const loadMatchmaker = async () => {
    if (!id) {
      setMatchmaker(null);
      setError("Matchmaker id is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getMatchmaker(id);
      setMatchmaker(response);
      setFirstName(response.first_name ?? "");
      setLastName(response.last_name ?? "");
      setPreviewAvatar(response.profile_picture ?? null);
      setAvatarFile(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to load matchmaker details.";
      setError(message);
      setMatchmaker(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMatchmaker();
  }, [id]);

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    const preview = await readFileAsDataUrl(file);
    setAvatarFile(file);
    setPreviewAvatar(preview);
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!matchmaker) return;

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const hasNameChanges =
      trimmedFirstName !== matchmaker.first_name || trimmedLastName !== matchmaker.last_name;
    const hasPictureChanges = avatarFile !== null;

    if (!hasNameChanges && !hasPictureChanges) return;

    setSaving(true);
    setError(null);

    try {
      const updated = await updateMatchmakerInfo(matchmaker.id, {
        first_name: hasNameChanges ? trimmedFirstName : undefined,
        last_name: hasNameChanges ? trimmedLastName : undefined,
        profile_picture: avatarFile ?? undefined,
      });

      setMatchmaker(updated);
      setFirstName(updated.first_name ?? "");
      setLastName(updated.last_name ?? "");
      setPreviewAvatar(updated.profile_picture ?? null);
      setAvatarFile(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to save matchmaker profile.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRole = async () => {
    if (!matchmaker) return;

    setActionLoading(true);
    setError(null);

    try {
      const nextRole = matchmaker.role === "superadmin" ? "matchmaker" : "superadmin";
      const updated = await changeMatchmakerRole(matchmaker.id, nextRole);
      setMatchmaker(updated);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to change matchmaker role.";
      setError(message);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleToggleActive = async () => {
    if (!matchmaker) return;

    setActionLoading(true);
    setError(null);

    try {
      const nextIsActive = !matchmaker.is_active;
      await setMatchmakerActive(matchmaker.id, nextIsActive);
      const refreshed = await getMatchmaker(matchmaker.id);
      setMatchmaker(refreshed);
      setFirstName(refreshed.first_name ?? "");
      setLastName(refreshed.last_name ?? "");
      setPreviewAvatar(refreshed.profile_picture ?? null);
      setAvatarFile(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to update matchmaker status.";
      setError(message);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleDelete = async () => {
    if (!matchmaker) return;

    setActionLoading(true);
    setError(null);

    try {
      await deleteMatchmaker(matchmaker.id);
      navigate("/profile");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to delete matchmaker.";
      setError(message);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-sm text-gray-500 flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-[#415192]" />
          Loading matchmaker profile...
        </div>
      </div>
    );
  }

  if (!id || !matchmaker) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-lg font-semibold text-gray-900">Matchmaker not found</p>
          <p className="text-sm text-gray-500 mt-2">{error ?? "Try selecting a different matchmaker from the list."}</p>
          <Link
            to="/profile"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Matchmakers
          </Link>
        </div>
      </div>
    );
  }

  const roleSwitchLabel =
    matchmaker.role === "superadmin" ? "Change to Matchmaker" : "Change to Superadmin";
  const activeLabel = matchmaker.is_active ? "Deactivate" : "Activate";
  const deleteLabel = `Delete ${roleLabel(matchmaker.role)}`;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-sm text-[#415192] hover:text-[#354177] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Matchmakers
          </Link>
          <h1 className="text-3xl font-semibold text-gray-900 mt-4">Matchmaker Profile</h1>
          <p className="text-gray-500 mt-1">Review and manage this account.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <div className="bg-[#F9FAFB] rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-28 h-28 rounded-full bg-[#415192] flex items-center justify-center text-white text-4xl font-semibold overflow-hidden">
              {previewAvatar ? (
                <img src={previewAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{(matchmaker.first_name?.charAt(0) ?? matchmaker.email.charAt(0)).toUpperCase()}</span>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xl font-semibold text-gray-900">
                {matchmaker.first_name} {matchmaker.last_name}
              </p>
              <p className="text-sm text-gray-500">{matchmaker.email}</p>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  matchmaker.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {matchmaker.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <div>
                <p className="text-gray-500">Role</p>
                <p className="text-gray-900 font-medium">{roleLabel(matchmaker.role)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <div>
                <p className="text-gray-500">Created</p>
                <p className="text-gray-900 font-medium">{formatDate(matchmaker.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <div>
                <p className="text-gray-500">Email</p>
                <p className="text-gray-900 font-medium break-all">{matchmaker.email}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => setConfirmAction(matchmaker.is_active ? "deactivate" : "activate")}
              disabled={actionLoading || saving}
              className="w-full px-4 py-3 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {activeLabel}
            </button>
            <button
              onClick={() => setConfirmAction("role")}
              disabled={actionLoading || saving}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {roleSwitchLabel}
            </button>
            <button
              onClick={() => setConfirmAction("delete")}
              disabled={actionLoading || saving}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {deleteLabel}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#F9FAFB] rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-semibold text-gray-900">Edit Basic Info</p>
                <p className="text-sm text-gray-500">Only the name and profile picture are editable here.</p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="w-20 h-20 rounded-full bg-[#E5E7EB] overflow-hidden flex items-center justify-center text-2xl text-gray-700 shrink-0">
                    {previewAvatar ? (
                      <img src={previewAvatar} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span>{(firstName.charAt(0) || matchmaker.email.charAt(0) || "M").toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Change Picture
                    </button>
                    {avatarFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewAvatar(matchmaker.profile_picture ?? null);
                          setAvatarFile(null);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Reset Picture
                      </button>
                    )}
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F9FAFB] rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Matchmaker Details</h2>
            <div className="grid gap-4 text-sm md:grid-cols-2">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-gray-500">Email</p>
                <p className="text-gray-900 mt-2 font-medium break-all">{matchmaker.email}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-gray-500">Role</p>
                <p className="text-gray-900 mt-2 font-medium">{roleLabel(matchmaker.role)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-gray-500">Created</p>
                <p className="text-gray-900 mt-2 font-medium">{formatDate(matchmaker.created_at)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-gray-500">Status</p>
                <p className="text-gray-900 mt-2 font-medium">{matchmaker.is_active ? "Active" : "Inactive"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 capitalize">Confirm {confirmAction}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {confirmAction === "delete"
                    ? `This will permanently delete this ${roleLabel(matchmaker.role).toLowerCase()} account.`
                    : confirmAction === "role"
                      ? `This will change the role of ${matchmaker.first_name} ${matchmaker.last_name}.`
                      : `Are you sure you want to ${matchmaker.is_active ? "deactivate" : "activate"} this matchmaker?`}
                </p>
              </div>
              <button
                onClick={() => setConfirmAction(null)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={
                  confirmAction === "delete"
                    ? handleDelete
                    : confirmAction === "role"
                      ? handleToggleRole
                      : handleToggleActive
                }
                disabled={actionLoading}
                className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {confirmAction === "delete"
                  ? deleteLabel
                  : confirmAction === "role"
                    ? roleSwitchLabel
                    : activeLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
