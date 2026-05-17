import { useParams, Link } from "react-router";
import { ArrowLeft, Check, X, Heart } from "lucide-react";

export function UserDetail() {
  const { id } = useParams();

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
                <p className="text-gray-900 mt-1">Sarah Ahmed</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Age</label>
                <p className="text-gray-900 mt-1">28 years</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Gender</label>
                <p className="text-gray-900 mt-1">Female</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Religion</label>
                <p className="text-gray-900 mt-1">Muslim</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Location</label>
                <p className="text-gray-900 mt-1">New York, USA</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Profession</label>
                <p className="text-gray-900 mt-1">Software Engineer</p>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500">Education</label>
                <p className="text-gray-900 mt-1">Masters in Computer Science</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Marital Status</label>
                <p className="text-gray-900 mt-1">Never Married</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Height</label>
                <p className="text-gray-900 mt-1">5'6"</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Ethnicity</label>
                <p className="text-gray-900 mt-1">South Asian</p>
              </div>
            </div>
          </div>

          {/* Family Info */}
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Family Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500">Father's Occupation</label>
                <p className="text-gray-900 mt-1">Business Owner</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Mother's Occupation</label>
                <p className="text-gray-900 mt-1">Teacher</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Siblings</label>
                <p className="text-gray-900 mt-1">2 Brothers, 1 Sister</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Family Type</label>
                <p className="text-gray-900 mt-1">Middle Class</p>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Partner Preferences</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500">Age Range</label>
                <p className="text-gray-900 mt-1">28 - 35 years</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Education</label>
                <p className="text-gray-900 mt-1">Bachelor's or higher</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Profession</label>
                <p className="text-gray-900 mt-1">Any professional career</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Location</label>
                <p className="text-gray-900 mt-1">USA, Canada, UK</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Activity */}
        <div className="space-y-6">
          {/* Profile Photo */}
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="w-full aspect-square bg-gradient-to-br from-[#415192] to-[#ACB5DA] rounded-lg flex items-center justify-center text-white text-6xl">
              S
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
              <div className="text-sm">
                <p className="text-gray-900">Profile created</p>
                <p className="text-gray-500 text-xs">2 days ago</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-900">Photos uploaded</p>
                <p className="text-gray-500 text-xs">1 day ago</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-900">Profile completed</p>
                <p className="text-gray-500 text-xs">12 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
