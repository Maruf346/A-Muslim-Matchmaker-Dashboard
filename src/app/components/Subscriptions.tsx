import { DollarSign, TrendingUp, Users, Download, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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


const recentTransactions = [
  { id: "TXN001", user: "Sarah Ahmed", plan: "Premium", amount: "$39.99", status: "Success", date: "2026-05-12", method: "Credit Card" },
  { id: "TXN002", user: "Mohammed Ali", plan: "Basic", amount: "$19.99", status: "Success", date: "2026-05-12", method: "PayPal" },
  { id: "TXN003", user: "Fatima Khan", plan: "Pro", amount: "$59.99", status: "Success", date: "2026-05-11", method: "Credit Card" },
  { id: "TXN004", user: "Ahmed Hassan", plan: "Premium", amount: "$39.99", status: "Failed", date: "2026-05-11", method: "Credit Card" },
  { id: "TXN005", user: "Aisha Rahman", plan: "Basic", amount: "$19.99", status: "Success", date: "2026-05-11", method: "Debit Card" },
  { id: "TXN006", user: "Omar Farooq", plan: "Premium", amount: "$39.99", status: "Pending", date: "2026-05-10", method: "Bank Transfer" },
  { id: "TXN007", user: "Zainab Malik", plan: "Basic", amount: "$19.99", status: "Success", date: "2026-05-10", method: "Credit Card" },
];


export function Subscriptions() {
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
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value: number, name: string) => {
                  if (name === 'revenue') {
                    return [`$${value.toLocaleString()}`, 'Revenue'];
                  }
                  return [value, 'Subscriptions'];
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#415192"
                strokeWidth={3}
                dot={{ r: 4, fill: '#415192' }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="subscriptions"
                stroke="#D07C84"
                strokeWidth={3}
                dot={{ r: 4, fill: '#D07C84' }}
                activeDot={{ r: 6 }}
              />
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
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {transaction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.plan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${
                        transaction.status === "Success"
                          ? "bg-[#415192]/20 text-[#415192]"
                          : transaction.status === "Failed"
                          ? "bg-[#D07C84]/30 text-[#D07C84]"
                          : "bg-[#ECCBCE]/50 text-[#D07C84]"
                      }`}>
                        {transaction.status === "Success" && <CheckCircle className="w-3 h-3" />}
                        {transaction.status === "Failed" && <XCircle className="w-3 h-3" />}
                        {transaction.status === "Pending" && <Clock className="w-3 h-3" />}
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="View Details">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
