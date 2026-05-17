import { useParams, Link } from "react-router";
import { ArrowLeft, Check, X, Heart } from "lucide-react";
import { mockUsers } from "../data/mockUsers";

export function UserDetail() {
  const { id } = useParams();
  const user = mockUsers.find((u) => u.id === Number(id));

  if (!user) {
    return (
      <div className="p-8">
        <Link to="/users" className="flex items-center text-[#415192] hover:underline mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Link>
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <p className="text-lg font-medium text-gray-700 mb-1">User not found</p>
          <p className="text-sm">No user exists with ID {id}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/users" className="flex items-center text-[#415192] hover:underline mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900">User Details</h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Profile */}
        <div className="col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500">Full Name</label>
                <p className="text-gray-900 mt-1">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Age</label>
                <p className="text-gray-900 mt-1">{user.age} years</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Gender</label>
                <p className="text-gray-900 mt-1">{user.gender}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Religion</label>
                <p className="text-gray-900 mt-1">{user.religion}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Location</label>
                <p className="text-gray-900 mt-1">{user.location}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Profession</label>
                <p className="text-gray-900 mt-1">{user.profession}</p>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500">Education</label>
                <p className="text-gray-900 mt-1">{user.education}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Marital Status</label>
                <p className="text-gray-900 mt-1">{user.maritalStatus}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Height</label>
                <p className="text-gray-900 mt-1">{user.height}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Ethnicity</label>
                <p className="text-gray-900 mt-1">{user.ethnicity}</p>
              </div>
            </div>
          </div>

          {/* Family Info */}
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Family Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500">Father's Occupation</label>
                <p className="text-gray-900 mt-1">{user.fatherOccupation}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Mother's Occupation</label>
                <p className="text-gray-900 mt-1">{user.motherOccupation}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Siblings</label>
                <p className="text-gray-900 mt-1">{user.siblings}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Family Type</label>
                <p className="text-gray-900 mt-1">{user.familyType}</p>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Partner Preferences</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500">Age Range</label>
                <p className="text-gray-900 mt-1">{user.preferences.ageRange}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Education</label>
                <p className="text-gray-900 mt-1">{user.preferences.education}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Profession</label>
                <p className="text-gray-900 mt-1">{user.preferences.profession}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Location</label>
                <p className="text-gray-900 mt-1">{user.preferences.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Activity */}
        <div className="space-y-6">
          {/* Profile Photo */}
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="w-full aspect-square bg-gradient-to-br from-[#415192] to-[#ACB5DA] rounded-lg flex items-center justify-center text-white text-6xl font-light">
              {user.name.charAt(0)}
            </div>
            <div className="mt-4 text-center">
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">{user.profession}</p>
              <div className="mt-3">
                <div className="flex items-center gap-2 justify-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-[#415192] h-1.5 rounded-full"
                      style={{ width: `${user.completion}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{user.completion}%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Profile completion</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                Approve Profile
              </button>
              <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <Heart className="w-4 h-4" />
                Suggest Match
              </button>
              <button className="w-full px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                <X className="w-4 h-4" />
                Reject Profile
              </button>
            </div>
          </div>

          {/* Activity History */}
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {user.recentActivity.map((activity, index) => (
                <div key={index} className="text-sm">
                  <p className="text-gray-900">{activity.event}</p>
                  <p className="text-gray-500 text-xs">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
