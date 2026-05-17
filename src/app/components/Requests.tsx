import { CheckCircle, XCircle, Clock } from "lucide-react";

const mockRequests = [
  { id: 1, from: "Mohammed Ali", to: "Sarah Ahmed", status: "Pending", date: "2026-05-01", type: "Contact Request" },
  { id: 2, from: "Ahmed Hassan", to: "Fatima Khan", status: "Accepted", date: "2026-04-29", type: "Photo Request" },
  { id: 3, from: "Omar Farooq", to: "Aisha Rahman", status: "Pending", date: "2026-05-02", type: "Contact Request" },
  { id: 4, from: "Ibrahim Yusuf", to: "Zainab Malik", status: "Rejected", date: "2026-04-28", type: "Contact Request" },
  { id: 5, from: "Ali Khan", to: "Maryam Ali", status: "Accepted", date: "2026-04-30", type: "Photo Request" },
  { id: 6, from: "Hassan Ahmed", to: "Layla Hassan", status: "Pending", date: "2026-05-03", type: "Contact Request" },
];

export function Requests() {
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
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {mockRequests.filter(r => r.status === "Pending").length}
              </p>
            </div>
            <Clock className="w-10 h-10 text-[#ECCBCE]" />
          </div>
        </div>

        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Accepted</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {mockRequests.filter(r => r.status === "Accepted").length}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-[#415192]" />
          </div>
        </div>

        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {mockRequests.filter(r => r.status === "Rejected").length}
              </p>
            </div>
            <XCircle className="w-10 h-10 text-[#D07C84]" />
          </div>
        </div>
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
              {mockRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{request.id.toString().padStart(4, '0')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.from}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.to}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      request.status === "Pending"
                        ? "bg-[#ECCBCE]/50 text-[#D07C84]"
                        : request.status === "Accepted"
                        ? "bg-[#ACB5DA]/50 text-[#415192]"
                        : "bg-[#D07C84]/30 text-[#D07C84]"
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {request.status === "Pending" && (
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 bg-[#415192] text-white rounded hover:bg-[#354177] transition-colors">
                          Approve
                        </button>
                        <button className="px-3 py-1 bg-white border border-[#D07C84] text-[#D07C84] rounded hover:bg-[#ECCBCE]/20 transition-colors">
                          Reject
                        </button>
                      </div>
                    )}
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
