import { Heart, Eye, Phone, CheckCircle2 } from "lucide-react";

const mockMatches = [
  { id: 1, groom: "Mohammed Ali", bride: "Sarah Ahmed", status: "Contact Shared", createdDate: "2026-04-15", photosRevealed: true },
  { id: 2, groom: "Ahmed Hassan", bride: "Fatima Khan", status: "Photos Revealed", createdDate: "2026-04-20", photosRevealed: true },
  { id: 3, groom: "Omar Farooq", bride: "Aisha Rahman", status: "New Match", createdDate: "2026-04-28", photosRevealed: false },
  { id: 4, groom: "Ibrahim Yusuf", bride: "Zainab Malik", status: "In Discussion", createdDate: "2026-04-10", photosRevealed: true },
  { id: 5, groom: "Ali Khan", bride: "Maryam Ali", status: "Contact Shared", createdDate: "2026-04-25", photosRevealed: true },
  { id: 6, groom: "Hassan Ahmed", bride: "Layla Hassan", status: "Married", createdDate: "2026-03-05", photosRevealed: true },
];

export function Matches() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Matches</h1>
        <p className="text-gray-500 mt-1">View and track all matched profiles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Total Matches</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{mockMatches.length}</p>
        </div>
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Photos Revealed</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {mockMatches.filter(m => m.photosRevealed).length}
          </p>
        </div>
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Contact Shared</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {mockMatches.filter(m => m.status === "Contact Shared" || m.status === "In Discussion" || m.status === "Married").length}
          </p>
        </div>
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Successful</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {mockMatches.filter(m => m.status === "Married").length}
          </p>
        </div>
      </div>

      {/* Matches Table */}
      <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Groom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bride</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockMatches.map((match) => (
                <tr key={match.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{match.id.toString().padStart(4, '0')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[#415192] flex items-center justify-center text-white text-sm mr-2">
                        {match.groom.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-900">{match.groom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[#D07C84] flex items-center justify-center text-white text-sm mr-2">
                        {match.bride.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-900">{match.bride}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {match.createdDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {match.photosRevealed ? (
                      <span className="flex items-center text-sm text-green-600">
                        <Eye className="w-4 h-4 mr-1" />
                        Revealed
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Hidden</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      match.status === "New Match"
                        ? "bg-blue-100 text-blue-800"
                        : match.status === "Photos Revealed"
                        ? "bg-purple-100 text-purple-800"
                        : match.status === "Contact Shared"
                        ? "bg-orange-100 text-orange-800"
                        : match.status === "In Discussion"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {match.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="View Details">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Share Contact">
                        <Phone className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Mark Success">
                        <CheckCircle2 className="w-4 h-4 text-gray-600" />
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
