import { Link } from "react-router";
import { Search, Filter, Eye, Edit, Ban } from "lucide-react";
import { useState } from "react";

const mockUsers = [
  { id: 1, name: "Sarah Ahmed", gender: "Female", age: 28, location: "New York, USA", religion: "Muslim", status: "Active", completion: 95 },
  { id: 2, name: "Mohammed Ali", gender: "Male", age: 32, location: "London, UK", religion: "Muslim", status: "Active", completion: 90 },
  { id: 3, name: "Fatima Khan", gender: "Female", age: 25, location: "Dubai, UAE", religion: "Muslim", status: "Active", completion: 85 },
  { id: 4, name: "Ahmed Hassan", gender: "Male", age: 30, location: "Toronto, Canada", religion: "Muslim", status: "Inactive", completion: 75 },
  { id: 5, name: "Aisha Rahman", gender: "Female", age: 27, location: "Sydney, Australia", religion: "Muslim", status: "Active", completion: 100 },
  { id: 6, name: "Omar Farooq", gender: "Male", age: 35, location: "Riyadh, Saudi Arabia", religion: "Muslim", status: "Active", completion: 88 },
  { id: 7, name: "Zainab Malik", gender: "Female", age: 26, location: "Singapore", religion: "Muslim", status: "Active", completion: 92 },
  { id: 8, name: "Ibrahim Yusuf", gender: "Male", age: 29, location: "Kuala Lumpur, Malaysia", religion: "Muslim", status: "Active", completion: 80 },
];

export function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
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
                <input type="number" placeholder="Min" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                <input type="number" placeholder="Max" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>All Locations</option>
                <option>USA</option>
                <option>UK</option>
                <option>UAE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>All Religions</option>
                <option>Muslim</option>
                <option>Christian</option>
                <option>Hindu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>All</option>
                <option>Active</option>
                <option>Inactive</option>
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
              {mockUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#415192] flex items-center justify-center text-white">
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
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
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
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </Link>
                      <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                        <Ban className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
