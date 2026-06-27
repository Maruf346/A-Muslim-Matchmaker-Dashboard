import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Check, X, Heart, CheckCircle2, XCircle, Pencil, Save } from "lucide-react";
import { mockUsers, UserData } from "../data/mockUsers";

type ProfileStatus = "pending" | "verified" | "deleted";

const inputClass =
  "mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#415192]/30 bg-white";

export function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const foundUser = mockUsers.find((u) => u.id === Number(id));

  const [userData, setUserData] = useState<UserData | undefined>(foundUser);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>("pending");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UserData | undefined>(foundUser);

  if (!userData || !editData) {
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

  const handleEdit = () => {
    setEditData({ ...userData, preferences: { ...userData.preferences } });
    setIsEditing(true);
  };

  const handleSave = () => {
    setUserData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ ...userData, preferences: { ...userData.preferences } });
    setIsEditing(false);
  };

  const setField = (field: keyof UserData, value: string | number) =>
    setEditData((prev) => prev ? { ...prev, [field]: value } : prev);

  const setPref = (field: keyof UserData["preferences"], value: string) =>
    setEditData((prev) =>
      prev ? { ...prev, preferences: { ...prev.preferences, [field]: value } } : prev
    );

  return (
    <div className="p-8">

      {/* ── Verify Confirmation Modal ─────────────────────────────── */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Verify this Profile?</h3>
              <p className="text-sm text-gray-500 mt-2">
                <span className="font-medium text-gray-700">{userData.name}</span>'s profile will be
                marked as verified and made visible for matching.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setProfileStatus("verified"); setShowApproveModal(false); }}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Yes, Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────────── */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <XCircle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete this Profile?</h3>
              <p className="text-sm text-gray-500 mt-2">
                <span className="font-medium text-gray-700">{userData.name}</span>'s profile will be
                deleted and removed from matches.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setProfileStatus("deleted"); setShowRejectModal(false); }}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <Link to="/users" className="flex items-center text-[#415192] hover:underline mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-900">User Details</h1>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-[#415192] text-white rounded-lg text-sm font-medium hover:bg-[#354177] transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
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
                {isEditing ? (
                  <input value={editData.name} onChange={(e) => setField("name", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900 mt-1">{userData.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.age}
                    onChange={(e) => setField("age", Number(e.target.value))}
                    className={inputClass}
                  />
                ) : (
                  <p className="text-gray-900 mt-1">{userData.age} years</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">Gender</label>
                {isEditing ? (
                  <input value={editData.gender} onChange={(e) => setField("gender", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900 mt-1">{userData.gender}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">Religion</label>
                {isEditing ? (
                  <input value={editData.religion} onChange={(e) => setField("religion", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900 mt-1">{userData.religion}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">Location</label>
                {isEditing ? (
                  <input value={editData.location} onChange={(e) => setField("location", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900 mt-1">{userData.location}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">Profession</label>
                {isEditing ? (
                  <input value={editData.profession} onChange={(e) => setField("profession", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900 mt-1">{userData.profession}</p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500">Education</label>
                {isEditing ? (
                  <input value={editData.education} onChange={(e) => setField("education", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900 mt-1">{userData.education}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">Marital Status</label>
                {isEditing ? (
                  <input value={editData.maritalStatus} onChange={(e) => setField("maritalStatus", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900 mt-1">{userData.maritalStatus}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">Height</label>
                {isEditing ? (
                  <input value={editData.height} onChange={(e) => setField("height", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900 mt-1">{userData.height}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">Ethnicity</label>
                {isEditing ? (
                  <input value={editData.ethnicity} onChange={(e) => setField("ethnicity", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900 mt-1">{userData.ethnicity}</p>
                )}
              </div>
            </div>
          </div>

          {/* Family Info */}
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Family Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500">Father's Occupation</label>
                {isEditing ? (
                  <input value={editData.fatherOccupation} onChange={(e) => setField("fatherOccupation", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900 mt-1">{userData.fatherOccupation}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">Mother's Occupation</label>
                {isEditing ? (
                  <input value={editData.motherOccupation} onChange={(e) => setField("motherOccupation", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900 mt-1">{userData.motherOccupation}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">Siblings</label>
                {isEditing ? (
                  <input value={editData.siblings} onChange={(e) => setField("siblings", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900 mt-1">{userData.siblings}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">Family Type</label>
                {isEditing ? (
                  <input value={editData.familyType} onChange={(e) => setField("familyType", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900 mt-1">{userData.familyType}</p>
                )}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Partner Preferences</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500">Age Range</label>
                {isEditing ? (
                  <input value={editData.preferences.ageRange} onChange={(e) => setPref("ageRange", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900 mt-1">{userData.preferences.ageRange}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">Education</label>
                {isEditing ? (
                  <input value={editData.preferences.education} onChange={(e) => setPref("education", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900 mt-1">{userData.preferences.education}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">Profession</label>
                {isEditing ? (
                  <input value={editData.preferences.profession} onChange={(e) => setPref("profession", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900 mt-1">{userData.preferences.profession}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">Location</label>
                {isEditing ? (
                  <input value={editData.preferences.location} onChange={(e) => setPref("location", e.target.value)} className={inputClass} />
                ) : (
                  <p className="text-gray-900 mt-1">{userData.preferences.location}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Activity */}
        <div className="space-y-6">
          {/* Profile Photo */}
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="w-full aspect-square bg-gradient-to-br from-[#415192] to-[#ACB5DA] rounded-lg flex items-center justify-center text-white text-6xl font-light">
              {userData.name.charAt(0)}
            </div>
            <div className="mt-4 text-center">
              <p className="font-semibold text-gray-900">{userData.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">{userData.profession}</p>
              <div className="mt-3">
                <div className="flex items-center gap-2 justify-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-[#415192] h-1.5 rounded-full"
                      style={{ width: `${userData.completion}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{userData.completion}%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Profile completion</p>
              </div>

              {/* Status badge */}
              {profileStatus === "verified" && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </div>
              )}
              {profileStatus === "deleted" && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">
                  <XCircle className="w-3.5 h-3.5" />
                  Deleted
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">

              {/* Verify */}
              {profileStatus === "verified" ? (
                <div className="w-full px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center justify-center gap-2 text-sm font-medium cursor-default">
                  <CheckCircle2 className="w-4 h-4" />
                  Profile Verified
                </div>
              ) : (
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="w-full px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Check className="w-4 h-4" />
                  Verify Profile
                </button>
              )}

              {/* Suggest Match */}
              <button
                onClick={() => navigate("/matchmaking")}
                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Heart className="w-4 h-4" />
                Suggest Match
              </button>

              {/* Delete */}
              {profileStatus === "deleted" ? (
                <div className="w-full px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center justify-center gap-2 text-sm font-medium cursor-default">
                  <XCircle className="w-4 h-4" />
                  Profile Deleted
                </div>
              ) : (
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="w-full px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <X className="w-4 h-4" />
                  Delete Profile
                </button>
              )}
            </div>
          </div>

          {/* Activity History */}
          <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {userData.recentActivity.map((activity, index) => (
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
