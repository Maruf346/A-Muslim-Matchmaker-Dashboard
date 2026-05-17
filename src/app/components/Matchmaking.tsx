import { useState } from "react";
import { Heart, MapPin, Briefcase } from "lucide-react";

const maleProfiles = [
  { id: 1, name: "Mohammed Ali", age: 32, location: "London, UK", profession: "Doctor", image: "M" },
  { id: 2, name: "Ahmed Hassan", age: 30, location: "Toronto, Canada", profession: "Engineer", image: "A" },
  { id: 3, name: "Omar Farooq", age: 35, location: "Riyadh, Saudi Arabia", profession: "Business Owner", image: "O" },
  { id: 4, name: "Ibrahim Yusuf", age: 29, location: "Kuala Lumpur", profession: "Architect", image: "I" },
];

const femaleProfiles = [
  { id: 1, name: "Sarah Ahmed", age: 28, location: "New York, USA", profession: "Software Engineer", image: "S" },
  { id: 2, name: "Fatima Khan", age: 25, location: "Dubai, UAE", profession: "Teacher", image: "F" },
  { id: 3, name: "Aisha Rahman", age: 27, location: "Sydney, Australia", profession: "Nurse", image: "A" },
  { id: 4, name: "Zainab Malik", age: 26, location: "Singapore", profession: "Designer", image: "Z" },
];

export function Matchmaking() {
  const [selectedMale, setSelectedMale] = useState<number | null>(null);
  const [selectedFemale, setSelectedFemale] = useState<number | null>(null);

  const handleCreateMatch = () => {
    if (selectedMale && selectedFemale) {
      alert("Match created successfully!");
      setSelectedMale(null);
      setSelectedFemale(null);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Matchmaking Panel</h1>
        <p className="text-gray-500 mt-1">Select profiles to create a new match</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Male Profiles */}
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Male Profiles</h2>
          <div className="space-y-3">
            {maleProfiles.map((profile) => (
              <div
                key={profile.id}
                onClick={() => setSelectedMale(profile.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedMale === profile.id
                    ? "border-[#415192] bg-[#ACB5DA]/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-[#415192] flex items-center justify-center text-white text-lg">
                    {profile.image}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{profile.name}</p>
                    <p className="text-sm text-gray-500">{profile.age} years</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-3 h-3" />
                    <span>{profile.profession}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Match Preview */}
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
          {selectedMale && selectedFemale ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-[#415192] flex items-center justify-center text-white text-2xl">
                  {maleProfiles.find(p => p.id === selectedMale)?.image}
                </div>
                <Heart className="w-8 h-8 text-[#D07C84]" />
                <div className="w-20 h-20 rounded-full bg-[#D07C84] flex items-center justify-center text-white text-2xl">
                  {femaleProfiles.find(p => p.id === selectedFemale)?.image}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Match</h3>
              <p className="text-sm text-gray-500 mb-6">
                {maleProfiles.find(p => p.id === selectedMale)?.name} & {femaleProfiles.find(p => p.id === selectedFemale)?.name}
              </p>
              <button
                onClick={handleCreateMatch}
                className="px-6 py-3 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors"
              >
                Create Match
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select one profile from each side to create a match</p>
            </div>
          )}
        </div>

        {/* Female Profiles */}
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Female Profiles</h2>
          <div className="space-y-3">
            {femaleProfiles.map((profile) => (
              <div
                key={profile.id}
                onClick={() => setSelectedFemale(profile.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedFemale === profile.id
                    ? "border-[#D07C84] bg-[#ECCBCE]/30"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-[#D07C84] flex items-center justify-center text-white text-lg">
                    {profile.image}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{profile.name}</p>
                    <p className="text-sm text-gray-500">{profile.age} years</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-3 h-3" />
                    <span>{profile.profession}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
