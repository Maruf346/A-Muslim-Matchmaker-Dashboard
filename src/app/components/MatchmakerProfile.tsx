import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ChevronLeft, Edit, Save, X, CheckCircle2, Trash2, User, Mail, Shield, Calendar } from "lucide-react";
import { Matchmaker, findMatchmakerById, loadMatchmakers, saveMatchmakers } from "../data/mockMatchmakers";

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MatchmakerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const matchmakerId = Number(id);

  const [matchmaker, setMatchmaker] = useState<Matchmaker | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [previewAvatar, setPreviewAvatar] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate" | "role" | "delete" | null>(null);

  useEffect(() => {
    const item = findMatchmakerById(matchmakerId);
    if (!item) {
      setMatchmaker(null);
      return;
    }
    setMatchmaker(item);
    setFirstName(item.firstName);
    setLastName(item.lastName);
    setPreviewAvatar(item.avatar);
  }, [matchmakerId]);

  const updateMatchmaker = (updated: Matchmaker) => {
    const list = loadMatchmakers().map((item) => (item.id === updated.id ? updated : item));
    saveMatchmakers(list);
    setMatchmaker(updated);
  };

  const handleSave = () => {
    if (!matchmaker) return;
    const nextAvatar = avatarFile ? previewAvatar : matchmaker.avatar;
    const updated = {
      ...matchmaker,
      firstName: firstName.trim() || matchmaker.firstName,
      lastName: lastName.trim() || matchmaker.lastName,
      avatar: nextAvatar,
    };
    updateMatchmaker(updated);
    setAvatarFile(null);
    alert("Matchmaker profile saved.");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setAvatarFile(file);
    setPreviewAvatar(URL.createObjectURL(file));
  };

  const handleToggleActive = () => {
    if (!matchmaker) return;
    const updated = { ...matchmaker, isActive: !matchmaker.isActive };
    updateMatchmaker(updated);
    setConfirmAction(null);
  };

  const handleToggleRole = () => {
    if (!matchmaker) return;
    const updated = {
      ...matchmaker,
      role: matchmaker.role === "Superadmin" ? "Admin" : "Superadmin",
    };
    updateMatchmaker(updated);
    setConfirmAction(null);
  };

  const handleDelete = () => {
    const list = loadMatchmakers().filter((item) => item.id !== matchmakerId);
    saveMatchmakers(list);
    navigate("/profile");
  };

  if (!id || Number.isNaN(matchmakerId) || !matchmaker) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-lg font-semibold text-gray-900">Matchmaker not found</p>
          <p className="text-sm text-gray-500 mt-2">Try selecting a different matchmaker from the list.</p>
          <Link
            to="/profile"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Matchmakers
          </Link>
        </div>
      </div>
    );
  }

  const roleSwitchLabel = matchmaker.role === "Superadmin" ? "Change to Admin" : "Change to Superadmin";
  const activeLabel = matchmaker.isActive ? "Deactivate" : "Activate";
  const activeMessage = matchmaker.isActive ? "deactivate" : "activate";

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-sm text-[#415192] hover:text-[#354177] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Matchmakers
          </Link>
          <h1 className="text-3xl font-semibold text-gray-900 mt-4">Matchmaker Profile</h1>
          <p className="text-gray-500 mt-1">Review and edit matchmaker account details</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#F9FAFB] rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-28 h-28 rounded-full bg-[#415192] flex items-center justify-center text-white text-4xl font-semibold overflow-hidden">
              {previewAvatar ? (
                <img src={previewAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{matchmaker.firstName.charAt(0)}</span>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xl font-semibold text-gray-900">{matchmaker.firstName} {matchmaker.lastName}</p>
              <p className="text-sm text-gray-500">{matchmaker.email}</p>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${matchmaker.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {matchmaker.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <div>
                <p className="text-gray-500">Role</p>
                <p className="text-gray-900 font-medium">{matchmaker.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <div>
                <p className="text-gray-500">Joined</p>
                <p className="text-gray-900 font-medium">{formatDate(matchmaker.joinedAt)}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => setConfirmAction(matchmaker.isActive ? "deactivate" : "activate")}
              className="w-full px-4 py-3 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors"
            >
              {activeLabel}
            </button>
            <button
              onClick={() => setConfirmAction("role")}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {roleSwitchLabel}
            </button>
            <button
              onClick={() => setConfirmAction("delete")}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Matchmaker
            </button>
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="bg-[#F9FAFB] rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-semibold text-gray-900">Edit Basic Info</p>
                <p className="text-sm text-gray-500">Only first name, last name and profile picture are editable.</p>
              </div>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-[#E5E7EB] overflow-hidden flex items-center justify-center text-2xl text-gray-700">
                    {previewAvatar ? (
                      <img src={previewAvatar} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span>{matchmaker.firstName.charAt(0)}</span>
                    )}
                  </div>
                  <label className="cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Change Picture
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F9FAFB] rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Matchmaker Details</h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-gray-500">Email</p>
                <p className="text-gray-900 mt-2 font-medium">{matchmaker.email}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-gray-500">Role</p>
                <p className="text-gray-900 mt-2 font-medium">{matchmaker.role}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-gray-500">Joined</p>
                <p className="text-gray-900 mt-2 font-medium">{formatDate(matchmaker.joinedAt)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 col-span-3">
                <p className="text-gray-500">Status</p>
                <p className="text-gray-900 mt-2 font-medium">{matchmaker.isActive ? "Active" : "Inactive"}</p>
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
                    ? "This action will permanently delete this matchmaker."
                    : confirmAction === "role"
                    ? `This will change the role of ${matchmaker.firstName} ${matchmaker.lastName}.`
                    : `Are you sure you want to ${activeMessage} this matchmaker?`}
                </p>
              </div>
              <button onClick={() => setConfirmAction(null)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
                className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors"
              >
                {confirmAction === "delete"
                  ? "Delete"
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
