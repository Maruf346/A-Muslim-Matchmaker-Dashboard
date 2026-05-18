import { DollarSign, TrendingUp, Users, Download, Eye, CheckCircle, XCircle, Clock, X, CreditCard, Calendar, User, Mail, RefreshCw, FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { TablePagination } from "./ui/TablePagination";

const revenueStats = [
  { label: "Total Revenue", value: "$45,230", icon: DollarSign, color: "bg-[#415192]", change: "+12.5%" },
  { label: "This Month", value: "$8,450", icon: TrendingUp, color: "bg-[#ACB5DA]", change: "+8.2%" },
  { label: "Active Subscribers", value: "234", icon: Users, color: "bg-[#D07C84]", change: "+15" },
  { label: "Pending Payments", value: "12", icon: Clock, color: "bg-[#ECCBCE]", change: "-3" },
];

const revenueChartData = [
  { month: "Jan", revenue: 6200, subscriptions: 42 },
  { month: "Feb", revenue: 7100, subscriptions: 48 },
  { month: "Mar", revenue: 6800, subscriptions: 45 },
  { month: "Apr", revenue: 7900, subscriptions: 53 },
  { month: "May", revenue: 8450, subscriptions: 58 },
  { month: "Jun", revenue: 9200, subscriptions: 62 },
];

interface Transaction {
  id: string;
  user: string;
  email: string;
  plan: string;
  planDuration: "Monthly" | "Annual";
  amount: string;
  status: "Success" | "Failed" | "Pending";
  date: string;
  renewalDate: string;
  method: string;
  notes: string;
}

const recentTransactions: Transaction[] = [
  { id: "TXN001", user: "Sarah Ahmed",      email: "sarah.ahmed@email.com",      plan: "Premium", planDuration: "Monthly", amount: "$39.99", status: "Success", date: "2026-05-12", renewalDate: "2026-06-12", method: "Credit Card",   notes: "" },
  { id: "TXN002", user: "Mohammed Ali",     email: "mohammed.ali@email.com",     plan: "Basic",   planDuration: "Monthly", amount: "$19.99", status: "Success", date: "2026-05-12", renewalDate: "2026-06-12", method: "PayPal",        notes: "" },
  { id: "TXN003", user: "Fatima Khan",      email: "fatima.khan@email.com",      plan: "Pro",     planDuration: "Annual",  amount: "$59.99", status: "Success", date: "2026-05-11", renewalDate: "2027-05-11", method: "Credit Card",   notes: "" },
  { id: "TXN004", user: "Ahmed Hassan",     email: "ahmed.hassan@email.com",     plan: "Premium", planDuration: "Monthly", amount: "$39.99", status: "Failed",  date: "2026-05-11", renewalDate: "—",          method: "Credit Card",   notes: "Card declined — insufficient funds." },
  { id: "TXN005", user: "Aisha Rahman",     email: "aisha.rahman@email.com",     plan: "Basic",   planDuration: "Monthly", amount: "$19.99", status: "Success", date: "2026-05-11", renewalDate: "2026-06-11", method: "Debit Card",    notes: "" },
  { id: "TXN006", user: "Omar Farooq",      email: "omar.farooq@email.com",      plan: "Premium", planDuration: "Annual",  amount: "$39.99", status: "Pending", date: "2026-05-10", renewalDate: "—",          method: "Bank Transfer", notes: "Awaiting bank transfer confirmation." },
  { id: "TXN007", user: "Zainab Malik",     email: "zainab.malik@email.com",     plan: "Basic",   planDuration: "Monthly", amount: "$19.99", status: "Success", date: "2026-05-10", renewalDate: "2026-06-10", method: "Credit Card",   notes: "" },
  { id: "TXN008", user: "Yusuf Siddiqui",  email: "yusuf.siddiqui@email.com",   plan: "Pro",     planDuration: "Annual",  amount: "$59.99", status: "Success", date: "2026-05-09", renewalDate: "2027-05-09", method: "Apple Pay",     notes: "" },
  { id: "TXN009", user: "Maryam Hossain",  email: "maryam.hossain@email.com",   plan: "Premium", planDuration: "Monthly", amount: "$39.99", status: "Success", date: "2026-05-09", renewalDate: "2026-06-09", method: "PayPal",        notes: "" },
  { id: "TXN010", user: "Ibrahim Qureshi", email: "ibrahim.qureshi@email.com",  plan: "Basic",   planDuration: "Monthly", amount: "$19.99", status: "Failed",  date: "2026-05-08", renewalDate: "—",          method: "Debit Card",    notes: "Card expired." },
  { id: "TXN011", user: "Khadija Noor",    email: "khadija.noor@email.com",     plan: "Pro",     planDuration: "Monthly", amount: "$59.99", status: "Success", date: "2026-05-08", renewalDate: "2026-06-08", method: "Credit Card",   notes: "" },
  { id: "TXN012", user: "Tariq Hussain",   email: "tariq.hussain@email.com",    plan: "Basic",   planDuration: "Annual",  amount: "$19.99", status: "Success", date: "2026-05-07", renewalDate: "2027-05-07", method: "Bank Transfer", notes: "" },
  { id: "TXN013", user: "Nadia Islam",     email: "nadia.islam@email.com",      plan: "Premium", planDuration: "Monthly", amount: "$39.99", status: "Pending", date: "2026-05-07", renewalDate: "—",          method: "PayPal",        notes: "Payment under review." },
  { id: "TXN014", user: "Bilal Chaudhry",  email: "bilal.chaudhry@email.com",   plan: "Pro",     planDuration: "Annual",  amount: "$59.99", status: "Success", date: "2026-05-06", renewalDate: "2027-05-06", method: "Credit Card",   notes: "" },
  { id: "TXN015", user: "Sana Begum",      email: "sana.begum@email.com",       plan: "Basic",   planDuration: "Monthly", amount: "$19.99", status: "Success", date: "2026-05-06", renewalDate: "2026-06-06", method: "Apple Pay",     notes: "" },
  { id: "TXN016", user: "Hamza Sheikh",    email: "hamza.sheikh@email.com",     plan: "Premium", planDuration: "Monthly", amount: "$39.99", status: "Failed",  date: "2026-05-05", renewalDate: "—",          method: "Credit Card",   notes: "Payment gateway timeout." },
  { id: "TXN017", user: "Ruqayyah Amin",   email: "ruqayyah.amin@email.com",    plan: "Pro",     planDuration: "Annual",  amount: "$59.99", status: "Success", date: "2026-05-05", renewalDate: "2027-05-05", method: "PayPal",        notes: "" },
  { id: "TXN018", user: "Umar Butt",       email: "umar.butt@email.com",        plan: "Basic",   planDuration: "Monthly", amount: "$19.99", status: "Success", date: "2026-05-04", renewalDate: "2026-06-04", method: "Debit Card",    notes: "" },
  { id: "TXN019", user: "Hafsa Rizvi",     email: "hafsa.rizvi@email.com",      plan: "Premium", planDuration: "Annual",  amount: "$39.99", status: "Success", date: "2026-05-04", renewalDate: "2027-05-04", method: "Credit Card",   notes: "" },
  { id: "TXN020", user: "Saad Mahmood",    email: "saad.mahmood@email.com",     plan: "Pro",     planDuration: "Monthly", amount: "$59.99", status: "Pending", date: "2026-05-03", renewalDate: "—",          method: "Bank Transfer", notes: "Waiting for bank clearance." },
  { id: "TXN021", user: "Layla Karimi",    email: "layla.karimi@email.com",     plan: "Basic",   planDuration: "Monthly", amount: "$19.99", status: "Success", date: "2026-05-03", renewalDate: "2026-06-03", method: "Apple Pay",     notes: "" },
  { id: "TXN022", user: "Adnan Mirza",     email: "adnan.mirza@email.com",      plan: "Premium", planDuration: "Monthly", amount: "$39.99", status: "Success", date: "2026-05-02", renewalDate: "2026-06-02", method: "PayPal",        notes: "" },
  { id: "TXN023", user: "Sumayya Patel",   email: "sumayya.patel@email.com",    plan: "Pro",     planDuration: "Annual",  amount: "$59.99", status: "Failed",  date: "2026-05-02", renewalDate: "—",          method: "Debit Card",    notes: "Insufficient funds." },
  { id: "TXN024", user: "Khalid Nawaz",    email: "khalid.nawaz@email.com",     plan: "Basic",   planDuration: "Monthly", amount: "$19.99", status: "Success", date: "2026-05-01", renewalDate: "2026-06-01", method: "Credit Card",   notes: "" },
  { id: "TXN025", user: "Asma Javed",      email: "asma.javed@email.com",       plan: "Premium", planDuration: "Annual",  amount: "$39.99", status: "Success", date: "2026-04-30", renewalDate: "2027-04-30", method: "Bank Transfer", notes: "" },
  { id: "TXN026", user: "Faisal Usman",    email: "faisal.usman@email.com",     plan: "Pro",     planDuration: "Monthly", amount: "$59.99", status: "Success", date: "2026-04-30", renewalDate: "2026-05-30", method: "Credit Card",   notes: "" },
  { id: "TXN027", user: "Rabia Saleem",    email: "rabia.saleem@email.com",     plan: "Basic",   planDuration: "Monthly", amount: "$19.99", status: "Pending", date: "2026-04-29", renewalDate: "—",          method: "PayPal",        notes: "PayPal verification pending." },
  { id: "TXN028", user: "Imran Ansari",    email: "imran.ansari@email.com",     plan: "Premium", planDuration: "Monthly", amount: "$39.99", status: "Success", date: "2026-04-29", renewalDate: "2026-05-29", method: "Apple Pay",     notes: "" },
  { id: "TXN029", user: "Nusaybah Waqar",  email: "nusaybah.waqar@email.com",   plan: "Pro",     planDuration: "Annual",  amount: "$59.99", status: "Success", date: "2026-04-28", renewalDate: "2027-04-28", method: "Credit Card",   notes: "" },
  { id: "TXN030", user: "Zaid Rahman",     email: "zaid.rahman@email.com",      plan: "Basic",   planDuration: "Monthly", amount: "$19.99", status: "Failed",  date: "2026-04-28", renewalDate: "—",          method: "Debit Card",    notes: "Card details mismatch." },
];

const STATUS_STYLES: Record<string, string> = {
  Success: "bg-[#415192]/20 text-[#415192]",
  Failed:  "bg-[#D07C84]/30 text-[#D07C84]",
  Pending: "bg-[#ECCBCE]/70 text-[#D07C84]",
};

function StatusBadge({ status }: { status: Transaction["status"] }) {
  return (
    <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${STATUS_STYLES[status]}`}>
      {status === "Success" && <CheckCircle className="w-3 h-3" />}
      {status === "Failed"  && <XCircle    className="w-3 h-3" />}
      {status === "Pending" && <Clock      className="w-3 h-3" />}
      {status}
    </span>
  );
}

function TransactionDetailModal({ txn, onClose }: { txn: Transaction; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#F9FAFB]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#415192] flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 font-mono">{txn.id}</p>
              <p className="text-xs text-gray-500">{txn.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={txn.status} />
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* User section */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">User</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F9FAFB] rounded-xl p-3 flex items-start gap-2.5 border border-gray-100">
                <User className="w-4 h-4 text-[#415192] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="text-sm font-medium text-gray-900">{txn.user}</p>
                </div>
              </div>
              <div className="bg-[#F9FAFB] rounded-xl p-3 flex items-start gap-2.5 border border-gray-100">
                <Mail className="w-4 h-4 text-[#415192] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900 break-all">{txn.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Plan & Payment section */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Plan & Payment</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F9FAFB] rounded-xl p-3 flex items-start gap-2.5 border border-gray-100">
                <DollarSign className="w-4 h-4 text-[#415192] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Plan</p>
                  <p className="text-sm font-medium text-gray-900">{txn.plan} · {txn.planDuration}</p>
                </div>
              </div>
              <div className="bg-[#F9FAFB] rounded-xl p-3 flex items-start gap-2.5 border border-gray-100">
                <DollarSign className="w-4 h-4 text-[#415192] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Amount</p>
                  <p className="text-sm font-semibold text-gray-900">{txn.amount}</p>
                </div>
              </div>
              <div className="bg-[#F9FAFB] rounded-xl p-3 flex items-start gap-2.5 border border-gray-100">
                <CreditCard className="w-4 h-4 text-[#415192] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Method</p>
                  <p className="text-sm font-medium text-gray-900">{txn.method}</p>
                </div>
              </div>
              <div className="bg-[#F9FAFB] rounded-xl p-3 flex items-start gap-2.5 border border-gray-100">
                <RefreshCw className="w-4 h-4 text-[#415192] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Renewal Date</p>
                  <p className="text-sm font-medium text-gray-900">{txn.renewalDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes — only show when non-empty */}
          {txn.notes && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Notes</p>
              <div className="bg-[#ECCBCE]/30 border border-[#D07C84]/30 rounded-xl px-4 py-3 flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-[#D07C84] mt-0.5 shrink-0" />
                <p className="text-sm text-[#D07C84]">{txn.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function Subscriptions() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [viewTransaction, setViewTransaction] = useState<Transaction | null>(null);

  const paginatedTransactions = recentTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Subscriptions & Payments</h1>
        <p className="text-gray-500 mt-1">Manage subscriptions, payments, and revenue</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {revenueStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-green-600">{stat.change}</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue Graph */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#415192] rounded"></div>
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#D07C84] rounded"></div>
                <span className="text-sm text-gray-600">Subscriptions</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis yAxisId="left" stroke="#888" />
              <YAxis yAxisId="right" orientation="right" stroke="#888" />
              <Tooltip
                contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                formatter={(value: number, name: string) =>
                  name === "revenue" ? [`$${value.toLocaleString()}`, "Revenue"] : [value, "Subscriptions"]
                }
              />
              <Line yAxisId="left"  type="monotone" dataKey="revenue"       stroke="#415192" strokeWidth={3} dot={{ r: 4, fill: "#415192" }} activeDot={{ r: 6 }} />
              <Line yAxisId="right" type="monotone" dataKey="subscriptions" stroke="#D07C84" strokeWidth={3} dot={{ r: 4, fill: "#D07C84" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{transaction.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.user}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.plan}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{transaction.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.method}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setViewTransaction(transaction)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TablePagination
            totalItems={recentTransactions.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            itemLabel="transactions"
          />
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {viewTransaction && (
        <TransactionDetailModal
          txn={viewTransaction}
          onClose={() => setViewTransaction(null)}
        />
      )}
    </div>
  );
}
