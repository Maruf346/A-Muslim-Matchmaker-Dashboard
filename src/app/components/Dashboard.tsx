import { Users, UserCheck, Heart, MessageSquare, Phone } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const statsCards = [
  { label: "Total Users", value: "2,847", icon: Users, color: "bg-[#ACB5DA]" },
  { label: "Active Users", value: "1,932", icon: UserCheck, color: "bg-[#415192]" },
  { label: "Total Matches", value: "567", icon: Heart, color: "bg-[#D07C84]" },
  { label: "Pending Requests", value: "89", icon: MessageSquare, color: "bg-[#ECCBCE]" },
  { label: "Contact Shared", value: "234", icon: Phone, color: "bg-[#415192]" },
];

const chartData = [
  { month: "Jan", matches: 45 },
  { month: "Feb", matches: 52 },
  { month: "Mar", matches: 61 },
  { month: "Apr", matches: 58 },
  { month: "May", matches: 67 },
  { month: "Jun", matches: 73 },
];

const recentActivity = [
  { type: "user", name: "Sarah Ahmed", action: "New user registered", time: "2 hours ago" },
  { type: "match", name: "Ahmed & Fatima", action: "New match created", time: "3 hours ago" },
  { type: "request", name: "Mohammed Ali", action: "Accepted contact request", time: "5 hours ago" },
  { type: "user", name: "Zainab Khan", action: "Profile approved", time: "6 hours ago" },
  { type: "match", name: "Omar & Aisha", action: "Photos revealed", time: "8 hours ago" },
];

export function Dashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Chart & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Matches Chart */}
        <div className="lg:col-span-2 bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Matches Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Line type="monotone" dataKey="matches" stroke="#415192" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                  activity.type === "user" ? "bg-[#ACB5DA]" :
                  activity.type === "match" ? "bg-[#D07C84]" : "bg-[#ECCBCE]"
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.name}</p>
                  <p className="text-xs text-gray-500">{activity.action}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
