import { useState } from "react";
import { Heart, MapPin, Briefcase, Search } from "lucide-react";
import { mockUsers, type UserData } from "../data/mockUsers";
import { TablePagination } from "./ui/TablePagination";

const maleProfiles = mockUsers.filter((u) => u.gender === "Male");
const femaleProfiles = mockUsers.filter((u) => u.gender === "Female");

const FLOATING_HEARTS = [
  { left: "5%",  dur: "1.8s", delay: "0.1s" },
  { left: "15%", dur: "2.1s", delay: "0.4s" },
  { left: "28%", dur: "1.6s", delay: "0s"   },
  { left: "42%", dur: "2.3s", delay: "0.2s" },
  { left: "55%", dur: "1.9s", delay: "0.6s" },
  { left: "68%", dur: "1.7s", delay: "0.3s" },
  { left: "80%", dur: "2.0s", delay: "0.5s" },
  { left: "92%", dur: "1.5s", delay: "0.1s" },
];

interface MatchSuccessModalProps {
  male: UserData;
  female: UserData;
  onClose: () => void;
}

function MatchSuccessModal({ male, female, onClose }: MatchSuccessModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <style>{`
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { transform: translateY(40px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes heartPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.18); }
        }
        @keyframes floatHeart {
          0%   { transform: translateY(0px) scale(1);   opacity: 0.85; }
          100% { transform: translateY(-130px) scale(0.3); opacity: 0; }
        }
        .mm-backdrop { animation: fadeInBackdrop 0.3s ease forwards; }
        .mm-modal   { animation: slideUpModal 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .mm-heart-pulse { animation: heartPulse 1.3s ease-in-out infinite; }
        .mm-float   { animation: floatHeart var(--dur) ease-out var(--delay) forwards; }
      `}</style>

      {/* Backdrop */}
      <div
        className="mm-backdrop absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="mm-modal relative bg-white rounded-3xl px-8 pt-8 pb-7 max-w-sm w-full mx-4 shadow-2xl overflow-hidden">

        {/* Floating hearts */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {FLOATING_HEARTS.map((h, i) => (
            <span
              key={i}
              className="mm-float absolute bottom-4 text-xl text-[#D07C84]"
              style={{ left: h.left, "--dur": h.dur, "--delay": h.delay } as React.CSSProperties}
            >
              ♥
            </span>
          ))}
        </div>

        {/* Pulsing heart icon */}
        <div className="mm-heart-pulse w-20 h-20 bg-gradient-to-br from-[#D07C84] to-[#ECCBCE] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Heart className="w-10 h-10 text-white fill-white" />
        </div>

        {/* Matched avatars */}
        <div className="flex items-center justify-center gap-5 mb-5">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#415192] flex items-center justify-center text-white text-xl font-semibold mx-auto mb-1.5 ring-2 ring-[#ACB5DA]">
              {male.name.charAt(0)}
            </div>
            <p className="text-sm font-medium text-gray-700">{male.name.split(" ")[0]}</p>
          </div>

          <div className="flex flex-col items-center gap-1 pb-5">
            <Heart className="w-5 h-5 text-[#D07C84] fill-[#D07C84]" />
            <Heart className="w-3 h-3 text-[#ECCBCE] fill-[#ECCBCE]" />
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#D07C84] flex items-center justify-center text-white text-xl font-semibold mx-auto mb-1.5 ring-2 ring-[#ECCBCE]">
              {female.name.charAt(0)}
            </div>
            <p className="text-sm font-medium text-gray-700">{female.name.split(" ")[0]}</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Match Generated!</h3>
        <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
          <span className="font-medium text-gray-700">{male.name}</span>
          {" & "}
          <span className="font-medium text-gray-700">{female.name}</span>
          {" "}have been successfully matched.{" "}
          May this be the beginning of something beautiful.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-[#415192] to-[#D07C84] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          Wonderful!
        </button>
      </div>
    </div>
  );
}

export function Matchmaking() {
  const [selectedMale, setSelectedMale] = useState<number | null>(null);
  const [selectedFemale, setSelectedFemale] = useState<number | null>(null);
  const [matchSuccess, setMatchSuccess] = useState<{ male: UserData; female: UserData } | null>(null);

  // Search states
  const [maleSearch, setMaleSearch] = useState("");
  const [femaleSearch, setFemaleSearch] = useState("");

  // Pagination states
  const [malePage, setMalePage] = useState(1);
  const [malePageSize, setMalePageSize] = useState(8);
  const [femalePage, setFemalePage] = useState(1);
  const [femalePageSize, setFemalePageSize] = useState(8);

  const filteredMales = maleProfiles.filter((p) => {
    if (!maleSearch) return true;
    const term = maleSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.location.toLowerCase().includes(term) ||
      p.profession.toLowerCase().includes(term)
    );
  });

  const filteredFemales = femaleProfiles.filter((p) => {
    if (!femaleSearch) return true;
    const term = femaleSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.location.toLowerCase().includes(term) ||
      p.profession.toLowerCase().includes(term)
    );
  });

  const paginatedMales = filteredMales.slice(
    (malePage - 1) * malePageSize,
    malePage * malePageSize
  );

  const paginatedFemales = filteredFemales.slice(
    (femalePage - 1) * femalePageSize,
    femalePage * femalePageSize
  );

  const handleMaleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaleSearch(e.target.value);
    setMalePage(1);
  };

  const handleFemaleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFemaleSearch(e.target.value);
    setFemalePage(1);
  };

  const handleCreateMatch = () => {
    if (!selectedMale || !selectedFemale) return;
    const male = mockUsers.find((u) => u.id === selectedMale);
    const female = mockUsers.find((u) => u.id === selectedFemale);
    if (male && female) {
      setMatchSuccess({ male, female });
      setSelectedMale(null);
      setSelectedFemale(null);
    }
  };

  const selectedMaleProfile = maleProfiles.find((p) => p.id === selectedMale);
  const selectedFemaleProfile = femaleProfiles.find((p) => p.id === selectedFemale);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Matchmaking Panel</h1>
        <p className="text-gray-500 mt-1">Select profiles to create a new match</p>
      </div>

      <div className="grid grid-cols-3 gap-6 items-start">
        {/* Male Profiles */}
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Male Profiles</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search profiles..."
                value={maleSearch}
                onChange={handleMaleSearch}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
              />
            </div>
          </div>

          <div className="px-6 space-y-3 pb-4">
            {paginatedMales.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No profiles found.</p>
            ) : (
              paginatedMales.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => setSelectedMale(profile.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedMale === profile.id
                      ? "border-[#415192] bg-[#ACB5DA]/20"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 rounded-full bg-[#415192] flex items-center justify-center text-white text-base font-semibold shrink-0">
                      {profile.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{profile.name}</p>
                      <p className="text-xs text-gray-500">{profile.age} years</p>
                    </div>
                    {selectedMale === profile.id && (
                      <div className="w-5 h-5 rounded-full bg-[#415192] flex items-center justify-center shrink-0">
                        <Heart className="w-3 h-3 text-white fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{profile.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Briefcase className="w-3 h-3 shrink-0" />
                      <span className="truncate">{profile.profession}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <TablePagination
            totalItems={filteredMales.length}
            currentPage={malePage}
            pageSize={malePageSize}
            onPageChange={setMalePage}
            onPageSizeChange={(size) => { setMalePageSize(size); setMalePage(1); }}
            itemLabel="profiles"
          />
        </div>

        {/* Match Preview */}
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center min-h-[320px]">
          {selectedMale && selectedFemale ? (
            <div className="text-center w-full">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-[#415192] flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-1">
                    {selectedMaleProfile?.name.charAt(0)}
                  </div>
                  <p className="text-xs text-gray-500 max-w-[70px] truncate mx-auto">
                    {selectedMaleProfile?.name.split(" ")[0]}
                  </p>
                </div>
                <Heart className="w-8 h-8 text-[#D07C84] fill-[#D07C84]" />
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-[#D07C84] flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-1">
                    {selectedFemaleProfile?.name.charAt(0)}
                  </div>
                  <p className="text-xs text-gray-500 max-w-[70px] truncate mx-auto">
                    {selectedFemaleProfile?.name.split(" ")[0]}
                  </p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Create Match</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                {selectedMaleProfile?.name}
                <br />
                <span className="text-[#D07C84]">&</span>
                <br />
                {selectedFemaleProfile?.name}
              </p>
              <button
                onClick={handleCreateMatch}
                className="px-6 py-3 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors font-medium"
              >
                Generate Match
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500 leading-relaxed">
                Select one profile from each side to create a match
              </p>
            </div>
          )}
        </div>

        {/* Female Profiles */}
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Female Profiles</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search profiles..."
                value={femaleSearch}
                onChange={handleFemaleSearch}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D07C84] focus:border-transparent"
              />
            </div>
          </div>

          <div className="px-6 space-y-3 pb-4">
            {paginatedFemales.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No profiles found.</p>
            ) : (
              paginatedFemales.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => setSelectedFemale(profile.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedFemale === profile.id
                      ? "border-[#D07C84] bg-[#ECCBCE]/30"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 rounded-full bg-[#D07C84] flex items-center justify-center text-white text-base font-semibold shrink-0">
                      {profile.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{profile.name}</p>
                      <p className="text-xs text-gray-500">{profile.age} years</p>
                    </div>
                    {selectedFemale === profile.id && (
                      <div className="w-5 h-5 rounded-full bg-[#D07C84] flex items-center justify-center shrink-0">
                        <Heart className="w-3 h-3 text-white fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{profile.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Briefcase className="w-3 h-3 shrink-0" />
                      <span className="truncate">{profile.profession}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <TablePagination
            totalItems={filteredFemales.length}
            currentPage={femalePage}
            pageSize={femalePageSize}
            onPageChange={setFemalePage}
            onPageSizeChange={(size) => { setFemalePageSize(size); setFemalePage(1); }}
            itemLabel="profiles"
          />
        </div>
      </div>

      {/* Success Modal */}
      {matchSuccess && (
        <MatchSuccessModal
          male={matchSuccess.male}
          female={matchSuccess.female}
          onClose={() => setMatchSuccess(null)}
        />
      )}
    </div>
  );
}
