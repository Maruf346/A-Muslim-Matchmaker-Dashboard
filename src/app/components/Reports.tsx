import { TrendingUp, Users, Heart, CheckCircle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const userGrowthData = [
  { month: "Jan", users: 420 },
  { month: "Feb", users: 580 },
  { month: "Mar", users: 720 },
  { month: "Apr", users: 890 },
  { month: "May", users: 1120 },
  { month: "Jun", users: 1340 },
];

const matchSuccessData = [
  { stage: "New Match", count: 45 },
  { stage: "Photos", count: 38 },
  { stage: "Contact", count: 32 },
  { stage: "Discussion", count: 24 },
  { stage: "Married", count: 18 },
];

const conversionData = [
  { name: "Successful", value: 32, color: "#415192" },
  { name: "In Progress", value: 48, color: "#ACB5DA" },
  { name: "Dropped", value: 20, color: "#D07C84" },
];

export function Reports() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">View performance metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-[#ACB5DA]" />
            <span className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +12%
            </span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">1,340</p>
          <p className="text-sm text-gray-500">Total Users</p>
        </div>

        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Heart className="w-8 h-8 text-[#D07C84]" />
            <span className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +8%
            </span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">567</p>
          <p className="text-sm text-gray-500">Total Matches</p>
        </div>

        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-[#415192]" />
            <span className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +15%
            </span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">32%</p>
          <p className="text-sm text-gray-500">Success Rate</p>
        </div>

        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-[#ACB5DA]" />
            <span className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +18%
            </span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">48%</p>
          <p className="text-sm text-gray-500">Conversion Rate</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* User Growth */}
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">User Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#415192" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Match Success Funnel */}
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Match Success Funnel</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={matchSuccessData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="stage" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="count" fill="#415192" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Match Outcomes</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={conversionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {conversionData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="col-span-2 bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Summary Statistics</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Average Time to Match</p>
              <p className="text-2xl font-semibold text-gray-900">14 days</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Average Time to Marriage</p>
              <p className="text-2xl font-semibold text-gray-900">6 months</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Active Matches</p>
              <p className="text-2xl font-semibold text-gray-900">234</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">87%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
