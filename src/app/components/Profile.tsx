import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit,
  Save,
  X,
  Search,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Matchmaker,
  loadMatchmakers,
  saveMatchmakers,
} from "../data/mockMatchmakers";

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState("admin@matchmaker.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savedName, setSavedName] = useState("Admin User");
  const [savedEmail, setSavedEmail] = useState("admin@matchmaker.com");

  const [matchmakers, setMatchmakers] = useState<Matchmaker[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFirstName, setCreateFirstName] = useState("");
  const [createLastName, setCreateLastName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");

  useEffect(() => {
    setMatchmakers(loadMatchmakers());
  }, []);

  useEffect(() => {
    const stored = loadMatchmakers();
    if (stored.length !== matchmakers.length) {
      setMatchmakers(stored);
    }
  }, [matchmakers.length]);

  const handleSave = () => {
    if (newPassword && newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    setSavedName(name);
    setSavedEmail(email);
    setIsEditing(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    alert("Profile updated successfully!");
  };

  const handleCancel = () => {
    setName(savedName);
    setEmail(savedEmail);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditing(false);
  };

  const filteredMatchmakers = matchmakers.filter((matchmaker) => {
    const search = searchTerm.toLowerCase();
    if (search) {
      const fullName = `${matchmaker.firstName} ${matchmaker.lastName}`.toLowerCase();
      if (!fullName.includes(search) && !matchmaker.email.toLowerCase().includes(search)) {
        return false;
      }
    }
    if (roleFilter && matchmaker.role !== roleFilter) return false;
    if (activeFilter) {
      const activeValue = activeFilter === "Active";
      if (matchmaker.isActive !== activeValue) return false;
    }
    return true;
  });

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredMatchmakers.length / pageSize));
  const paginatedMatchmakers = filteredMatchmakers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetPage = () => setCurrentPage(1);

  const handleCreateMatchmaker = () => {
    if (!createFirstName.trim() || !createLastName.trim() || !createEmail.trim() || !createPassword.trim()) {
      alert("Please fill in all fields to create a matchmaker.");
      return;
    }

    const nextId = Math.max(0, ...matchmakers.map((item) => item.id)) + 1;
    const joinedAt = new Date().toISOString().slice(0, 10);

    const newMatchmaker: Matchmaker = {
      id: nextId,
      firstName: createFirstName.trim(),
      lastName: createLastName.trim(),
      email: createEmail.trim(),
      role: "Matchmaker",
      avatar: "",
      isActive: true,
      joinedAt,
    };

    const nextMatchmakers: Matchmaker[] = [newMatchmaker, ...matchmakers];
    setMatchmakers(nextMatchmakers);
    saveMatchmakers(nextMatchmakers);
    setCreateFirstName("");
    setCreateLastName("");
    setCreateEmail("");
    setCreatePassword("");
    setShowCreateModal(false);
    resetPage();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleToggleStatus = (id: number) => {
    const next: Matchmaker[] = matchmakers.map((item) =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    );
    setMatchmakers(next);
    saveMatchmakers(next);
  };

  const handleRoleChange = (id: number) => {
    const next: Matchmaker[] = matchmakers.map((item) =>
      item.id === id
        ? { ...item, role: item.role === "Superadmin" ? "Matchmaker" : "Superadmin" }
        : item
    );
    setMatchmakers(next);
    saveMatchmakers(next);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Profile Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account information and matchmaker operations</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Profile Picture</h3>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#415192] to-[#ACB5DA] flex items-center justify-center text-white text-5xl mb-4">
                A
              </div>
              {isEditing && (
                <button className="text-sm text-[#415192] hover:underline">Change Photo</button>
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
                  <p className="text-gray-900 font-medium">Super Admin</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">Member Since</p>
                  <p className="text-gray-900 font-medium">January 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192]"
                  />
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{savedName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192]"
                  />
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{savedEmail}</span>
                  </div>
                )}
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
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
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
                <p className="text-xs text-gray-500">Leave password fields empty if you don't want to change your password</p>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Matchmakers</h2>
            <p className="text-gray-500 mt-1">Search, filter, and manage matchmaker accounts.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Matchmaker
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_auto] mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); resetPage(); }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#415192]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); resetPage(); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#415192]"
            >
              <option value="">All Roles</option>
              <option value="Matchmaker">Matchmaker</option>
              <option value="Superadmin">Superadmin</option>
            </select>
            <select
              value={activeFilter}
              onChange={(e) => { setActiveFilter(e.target.value); resetPage(); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#415192]"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedMatchmakers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                    No matchmakers found.
                  </td>
                </tr>
              ) : (
                paginatedMatchmakers.map((matchmaker) => (
                  <tr key={matchmaker.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#415192] text-white flex items-center justify-center text-sm font-semibold">
                          {matchmaker.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{matchmaker.firstName} {matchmaker.lastName}</p>
                          <p className="text-xs text-gray-500">{matchmaker.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{matchmaker.email}</td>
                    <td className="px-4 py-4">{matchmaker.role}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${matchmaker.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                        {matchmaker.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4">{formatDate(matchmaker.joinedAt)}</td>
                    <td className="px-4 py-4 space-x-2">
                      <Link
                        to={`/matchmakers/${matchmaker.id}`}
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

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <p>
            Showing {paginatedMatchmakers.length} of {filteredMatchmakers.length} matchmakers
          </p>
          <div className="inline-flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page <span className="font-semibold text-gray-900">{currentPage}</span> of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {showCreateModal && (
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
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMatchmaker}
                className="px-5 py-3 rounded-xl bg-[#415192] text-white hover:bg-[#354177] transition-colors"
              >
                Create Matchmaker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
