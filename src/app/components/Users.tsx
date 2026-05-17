import { Link } from "react-router";
import { Search, Filter, Eye, Ban, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { TablePagination } from "./ui/TablePagination";
import { mockUsers } from "../data/mockUsers";

export function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [religionFilter, setReligionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Block states
  const [blockedUsers, setBlockedUsers] = useState<Set<number>>(new Set());
  const [blockConfirmUserId, setBlockConfirmUserId] = useState<number | null>(null);
  const [unblockConfirmUserId, setUnblockConfirmUserId] = useState<number | null>(null);

  const resetPage = () => setCurrentPage(1);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    resetPage();
  };

  const handleFilterSelect = (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value);
      resetPage();
    };

  const handleFilterInput = (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      resetPage();
    };

  // Apply search + filters
  const filteredUsers = mockUsers.filter((user) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (
        !user.name.toLowerCase().includes(term) &&
        !user.location.toLowerCase().includes(term) &&
        !user.profession.toLowerCase().includes(term)
      ) {
        return false;
      }
    }
    if (ageMin && user.age < Number(ageMin)) return false;
    if (ageMax && user.age > Number(ageMax)) return false;
    if (locationFilter && !user.location.includes(locationFilter)) return false;
    if (religionFilter && user.religion !== religionFilter) return false;

    if (statusFilter) {
      if (statusFilter === "Blocked") {
        if (!blockedUsers.has(user.id)) return false;
      } else {
        if (blockedUsers.has(user.id)) return false;
        if (user.status !== statusFilter) return false;
      }
    }

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

      {/* Search & Filters */}
      <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, location, profession..."
              value={searchTerm}
              onChange={handleSearchChange}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={ageMin}
                  onChange={handleFilterInput(setAgeMin)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={ageMax}
                  onChange={handleFilterInput(setAgeMax)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={locationFilter}
                onChange={handleFilterSelect(setLocationFilter)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
              >
                <option value="">All Locations</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="UAE">UAE</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="Singapore">Singapore</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Pakistan">Pakistan</option>
                <option value="France">France</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
              <select
                value={religionFilter}
                onChange={handleFilterSelect(setReligionFilter)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
              >
                <option value="">All Religions</option>
                <option value="Muslim">Muslim</option>
                <option value="Christian">Christian</option>
                <option value="Hindu">Hindu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={handleFilterSelect(setStatusFilter)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
              >
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>
        )}
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
                          {/* <button title="Edit user" className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button> */}
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
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          itemLabel="users"
        />
      </div>

      {/* Unblock Confirmation Modal */}
      {unblockConfirmUserId !== null && unblockConfirmTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Unblock User
            </h3>
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

      {/* Block Confirmation Modal */}
      {blockConfirmUserId !== null && blockConfirmTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Ban className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Block User
            </h3>
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
