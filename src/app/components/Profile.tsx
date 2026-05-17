import { User, Mail, Shield, Calendar, Edit, Save, X } from "lucide-react";
import { useState } from "react";

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState("admin@matchmaker.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savedName, setSavedName] = useState("Admin User");
  const [savedEmail, setSavedEmail] = useState("admin@matchmaker.com");

  const handleSave = () => {
    if (newPassword && newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    setSavedName(name);
    setSavedEmail(email);
    setIsEditing(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    alert("Profile updated successfully!");
  };

  const handleCancel = () => {
    setName(savedName);
    setEmail(savedEmail);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditing(false);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Profile Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account information and preferences</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Profile Picture */}
        <div className="space-y-6">
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Profile Picture</h3>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#415192] to-[#ACB5DA] flex items-center justify-center text-white text-5xl mb-4">
                A
              </div>
              {isEditing && (
                <button className="text-sm text-[#415192] hover:underline">
                  Change Photo
                </button>
              )}
            </div>
          </div>

          <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Account Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">Role</p>
                  <p className="text-gray-900 font-medium">Super Admin</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">Member Since</p>
                  <p className="text-gray-900 font-medium">January 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Profile Details */}
        <div className="col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192]"
                  />
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{savedName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192]"
                  />
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{savedEmail}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Change Password */}
          {isEditing && (
            <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192]"
                  />
                </div>

                <p className="text-xs text-gray-500">
                  Leave password fields empty if you don't want to change your password
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}

          {/* Activity Log */}
          {!isEditing && (
            <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gray-900">Logged in</p>
                    <p className="text-gray-500 text-xs">2 hours ago</p>
                  </div>
                  <span className="text-xs text-gray-400">Today, 2:30 PM</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gray-900">Updated settings</p>
                    <p className="text-gray-500 text-xs">Yesterday</p>
                  </div>
                  <span className="text-xs text-gray-400">May 5, 10:15 AM</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gray-900">Created new match</p>
                    <p className="text-gray-500 text-xs">2 days ago</p>
                  </div>
                  <span className="text-xs text-gray-400">May 4, 3:45 PM</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
