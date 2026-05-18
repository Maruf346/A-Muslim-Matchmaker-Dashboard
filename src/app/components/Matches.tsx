import { useState } from "react";
import { Heart, Eye, Phone, CheckCircle2, Search, Filter, X, MapPin, Briefcase, Star, PhoneCall } from "lucide-react";
import { TablePagination } from "./ui/TablePagination";

interface Match {
  id: number;
  groom: string;
  groomAge: number;
  groomLocation: string;
  groomProfession: string;
  groomPhone: string;
  bride: string;
  brideAge: number;
  brideLocation: string;
  brideProfession: string;
  bridePhone: string;
  status: string;
  createdDate: string;
  photosRevealed: boolean;
  matchedBy: string;
}

const mockMatches: Match[] = [
  { id: 1,  groom: "Mohammed Ali",      groomAge: 32, groomLocation: "London, UK",              groomProfession: "Doctor",              groomPhone: "+44 7911 123 456",   bride: "Sarah Ahmed",     brideAge: 28, brideLocation: "New York, USA",          brideProfession: "Software Engineer",   bridePhone: "+1 (212) 555-0142",   status: "Contact Shared",  createdDate: "2026-04-15", photosRevealed: true,  matchedBy: "Admin"     },
  { id: 2,  groom: "Ahmed Hassan",       groomAge: 30, groomLocation: "Toronto, Canada",          groomProfession: "Accountant",          groomPhone: "+1 (416) 555-0238",  bride: "Fatima Khan",     brideAge: 25, brideLocation: "Dubai, UAE",             brideProfession: "Marketing Manager",   bridePhone: "+971 55 123 4567",    status: "Photos Revealed", createdDate: "2026-04-20", photosRevealed: true,  matchedBy: "Algorithm" },
  { id: 3,  groom: "Omar Farooq",        groomAge: 35, groomLocation: "Riyadh, Saudi Arabia",     groomProfession: "Civil Engineer",      groomPhone: "+966 55 234 5678",   bride: "Aisha Rahman",    brideAge: 27, brideLocation: "Sydney, Australia",      brideProfession: "Nurse",               bridePhone: "+61 412 345 678",     status: "New Match",       createdDate: "2026-04-28", photosRevealed: false, matchedBy: "Admin"     },
  { id: 4,  groom: "Ibrahim Yusuf",      groomAge: 29, groomLocation: "Kuala Lumpur, Malaysia",   groomProfession: "Software Developer",  groomPhone: "+60 12 345 6789",    bride: "Zainab Malik",    brideAge: 26, brideLocation: "Singapore",              brideProfession: "Financial Analyst",   bridePhone: "+65 9123 4567",       status: "In Discussion",   createdDate: "2026-04-10", photosRevealed: true,  matchedBy: "Algorithm" },
  { id: 5,  groom: "Tariq Siddiqui",     groomAge: 36, groomLocation: "Houston, USA",             groomProfession: "Petroleum Engineer",  groomPhone: "+1 (713) 555-0189",  bride: "Maryam Chaudhry", brideAge: 24, brideLocation: "Birmingham, UK",         brideProfession: "Pharmacist",          bridePhone: "+44 7844 234 567",    status: "Contact Shared",  createdDate: "2026-04-25", photosRevealed: true,  matchedBy: "Admin"     },
  { id: 6,  groom: "Khalid Al-Rashid",   groomAge: 33, groomLocation: "Abu Dhabi, UAE",           groomProfession: "Business Consultant", groomPhone: "+971 50 234 5678",   bride: "Nadia Hussain",   brideAge: 31, brideLocation: "Paris, France",          brideProfession: "Fashion Designer",    bridePhone: "+33 6 12 34 56 78",   status: "Successful",      createdDate: "2026-03-05", photosRevealed: true,  matchedBy: "Admin"     },
  { id: 7,  groom: "Yusuf Osman",        groomAge: 28, groomLocation: "Nairobi, Kenya",           groomProfession: "Architect",           groomPhone: "+254 712 345 678",   bride: "Hina Baig",       brideAge: 29, brideLocation: "Lahore, Pakistan",       brideProfession: "Teacher",             bridePhone: "+92 321 234 5678",    status: "New Match",       createdDate: "2026-05-01", photosRevealed: false, matchedBy: "Algorithm" },
  { id: 8,  groom: "Bilal Mahmoud",      groomAge: 31, groomLocation: "Cairo, Egypt",             groomProfession: "Journalist",          groomPhone: "+20 100 234 5678",   bride: "Ruqayyah Patel",  brideAge: 23, brideLocation: "Leicester, UK",          brideProfession: "Medical Student",     bridePhone: "+44 7700 345 678",    status: "Photos Revealed", createdDate: "2026-04-18", photosRevealed: true,  matchedBy: "Admin"     },
  { id: 9,  groom: "Hamid Qureshi",      groomAge: 34, groomLocation: "Islamabad, Pakistan",      groomProfession: "IT Manager",          groomPhone: "+92 333 345 6789",   bride: "Safia Jama",      brideAge: 27, brideLocation: "Minneapolis, USA",       brideProfession: "Social Worker",       bridePhone: "+1 (612) 555-0234",   status: "In Discussion",   createdDate: "2026-04-12", photosRevealed: true,  matchedBy: "Admin"     },
  { id: 10, groom: "Dawud Thompson",     groomAge: 29, groomLocation: "Atlanta, USA",             groomProfession: "Data Scientist",      groomPhone: "+1 (404) 555-0167",  bride: "Leila Benali",    brideAge: 26, brideLocation: "Casablanca, Morocco",    brideProfession: "Graphic Designer",    bridePhone: "+212 66 123 4567",    status: "Contact Shared",  createdDate: "2026-04-22", photosRevealed: true,  matchedBy: "Algorithm" },
  { id: 11, groom: "Rashid Al-Amin",     groomAge: 27, groomLocation: "Jeddah, Saudi Arabia",     groomProfession: "Sales Executive",     groomPhone: "+966 56 345 6789",   bride: "Amina Diallo",    brideAge: 30, brideLocation: "Dakar, Senegal",         brideProfession: "Economist",           bridePhone: "+221 76 123 4567",    status: "New Match",       createdDate: "2026-05-05", photosRevealed: false, matchedBy: "Algorithm" },
  { id: 12, groom: "Kareem Washington",  groomAge: 32, groomLocation: "Chicago, USA",             groomProfession: "Attorney",            groomPhone: "+1 (312) 555-0298",  bride: "Sumaiya Islam",   brideAge: 25, brideLocation: "Dhaka, Bangladesh",      brideProfession: "Lecturer",            bridePhone: "+880 1711 234 567",   status: "Successful",      createdDate: "2026-03-15", photosRevealed: true,  matchedBy: "Admin"     },
  { id: 13, groom: "Mohammed Ali",       groomAge: 32, groomLocation: "London, UK",              groomProfession: "Doctor",              groomPhone: "+44 7911 123 456",   bride: "Zainab Malik",    brideAge: 26, brideLocation: "Singapore",              brideProfession: "Financial Analyst",   bridePhone: "+65 9123 4567",       status: "In Discussion",   createdDate: "2026-04-08", photosRevealed: true,  matchedBy: "Admin"     },
  { id: 14, groom: "Ahmed Hassan",       groomAge: 30, groomLocation: "Toronto, Canada",          groomProfession: "Accountant",          groomPhone: "+1 (416) 555-0238",  bride: "Aisha Rahman",    brideAge: 27, brideLocation: "Sydney, Australia",      brideProfession: "Nurse",               bridePhone: "+61 412 345 678",     status: "New Match",       createdDate: "2026-05-08", photosRevealed: false, matchedBy: "Algorithm" },
  { id: 15, groom: "Omar Farooq",        groomAge: 35, groomLocation: "Riyadh, Saudi Arabia",     groomProfession: "Civil Engineer",      groomPhone: "+966 55 234 5678",   bride: "Maryam Chaudhry", brideAge: 24, brideLocation: "Birmingham, UK",         brideProfession: "Pharmacist",          bridePhone: "+44 7844 234 567",    status: "Photos Revealed", createdDate: "2026-04-03", photosRevealed: true,  matchedBy: "Admin"     },
  { id: 16, groom: "Ibrahim Yusuf",      groomAge: 29, groomLocation: "Kuala Lumpur, Malaysia",   groomProfession: "Software Developer",  groomPhone: "+60 12 345 6789",    bride: "Nadia Hussain",   brideAge: 31, brideLocation: "Paris, France",          brideProfession: "Fashion Designer",    bridePhone: "+33 6 12 34 56 78",   status: "Contact Shared",  createdDate: "2026-04-17", photosRevealed: true,  matchedBy: "Algorithm" },
  { id: 17, groom: "Tariq Siddiqui",     groomAge: 36, groomLocation: "Houston, USA",             groomProfession: "Petroleum Engineer",  groomPhone: "+1 (713) 555-0189",  bride: "Ruqayyah Patel",  brideAge: 23, brideLocation: "Leicester, UK",          brideProfession: "Medical Student",     bridePhone: "+44 7700 345 678",    status: "New Match",       createdDate: "2026-05-10", photosRevealed: false, matchedBy: "Admin"     },
  { id: 18, groom: "Khalid Al-Rashid",   groomAge: 33, groomLocation: "Abu Dhabi, UAE",           groomProfession: "Business Consultant", groomPhone: "+971 50 234 5678",   bride: "Safia Jama",      brideAge: 27, brideLocation: "Minneapolis, USA",       brideProfession: "Social Worker",       bridePhone: "+1 (612) 555-0234",   status: "In Discussion",   createdDate: "2026-03-28", photosRevealed: true,  matchedBy: "Admin"     },
  { id: 19, groom: "Yusuf Osman",        groomAge: 28, groomLocation: "Nairobi, Kenya",           groomProfession: "Architect",           groomPhone: "+254 712 345 678",   bride: "Leila Benali",    brideAge: 26, brideLocation: "Casablanca, Morocco",    brideProfession: "Graphic Designer",    bridePhone: "+212 66 123 4567",    status: "Successful",      createdDate: "2026-03-10", photosRevealed: true,  matchedBy: "Algorithm" },
  { id: 20, groom: "Dawud Thompson",     groomAge: 29, groomLocation: "Atlanta, USA",             groomProfession: "Data Scientist",      groomPhone: "+1 (404) 555-0167",  bride: "Hina Baig",       brideAge: 29, brideLocation: "Lahore, Pakistan",       brideProfession: "Teacher",             bridePhone: "+92 321 234 5678",    status: "New Match",       createdDate: "2026-05-12", photosRevealed: false, matchedBy: "Algorithm" },
  { id: 21, groom: "Hamid Qureshi",      groomAge: 34, groomLocation: "Islamabad, Pakistan",      groomProfession: "IT Manager",          groomPhone: "+92 333 345 6789",   bride: "Amina Diallo",    brideAge: 30, brideLocation: "Dakar, Senegal",         brideProfession: "Economist",           bridePhone: "+221 76 123 4567",    status: "Photos Revealed", createdDate: "2026-04-05", photosRevealed: true,  matchedBy: "Admin"     },
  { id: 22, groom: "Rashid Al-Amin",     groomAge: 27, groomLocation: "Jeddah, Saudi Arabia",     groomProfession: "Sales Executive",     groomPhone: "+966 56 345 6789",   bride: "Sumaiya Islam",   brideAge: 25, brideLocation: "Dhaka, Bangladesh",      brideProfession: "Lecturer",            bridePhone: "+880 1711 234 567",   status: "Contact Shared",  createdDate: "2026-04-30", photosRevealed: true,  matchedBy: "Algorithm" },
  { id: 23, groom: "Kareem Washington",  groomAge: 32, groomLocation: "Chicago, USA",             groomProfession: "Attorney",            groomPhone: "+1 (312) 555-0298",  bride: "Fatima Khan",     brideAge: 25, brideLocation: "Dubai, UAE",             brideProfession: "Marketing Manager",   bridePhone: "+971 55 123 4567",    status: "In Discussion",   createdDate: "2026-04-14", photosRevealed: true,  matchedBy: "Admin"     },
  { id: 24, groom: "Bilal Mahmoud",      groomAge: 31, groomLocation: "Cairo, Egypt",             groomProfession: "Journalist",          groomPhone: "+20 100 234 5678",   bride: "Sarah Ahmed",     brideAge: 28, brideLocation: "New York, USA",          brideProfession: "Software Engineer",   bridePhone: "+1 (212) 555-0142",   status: "New Match",       createdDate: "2026-05-15", photosRevealed: false, matchedBy: "Algorithm" },
];

const STATUS_STYLES: Record<string, string> = {
  "New Match":       "bg-blue-100 text-blue-800",
  "Photos Revealed": "bg-purple-100 text-purple-800",
  "Contact Shared":  "bg-orange-100 text-orange-800",
  "In Discussion":   "bg-amber-100 text-amber-800",
  "Successful":      "bg-green-100 text-green-800",
};

const FLOATING_STARS = [
  { left: "6%",  dur: "1.7s", delay: "0s"   },
  { left: "18%", dur: "2.0s", delay: "0.3s" },
  { left: "30%", dur: "1.5s", delay: "0.1s" },
  { left: "44%", dur: "2.2s", delay: "0.5s" },
  { left: "57%", dur: "1.8s", delay: "0.2s" },
  { left: "70%", dur: "1.6s", delay: "0.4s" },
  { left: "82%", dur: "2.1s", delay: "0.6s" },
  { left: "93%", dur: "1.9s", delay: "0.1s" },
];

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function MatchStatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

/* ── View Details Modal ─────────────────────────────── */
function ViewDetailsModal({ match, effectiveStatus, onClose }: { match: Match; effectiveStatus: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Match Details</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              #{match.id.toString().padStart(4, "0")} &nbsp;·&nbsp; Created {formatDate(match.createdDate)} &nbsp;·&nbsp; Matched by {match.matchedBy}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <MatchStatusBadge status={effectiveStatus} />
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Profiles */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Groom */}
            <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-[#415192] uppercase tracking-wider mb-3">Groom</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-[#415192] flex items-center justify-center text-white text-xl font-semibold shrink-0">
                  {match.groom.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{match.groom}</p>
                  <p className="text-sm text-gray-500">{match.groomAge} years old</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {match.groomLocation}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {match.groomProfession}
                </div>
              </div>
            </div>

            {/* Bride */}
            <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-[#D07C84] uppercase tracking-wider mb-3">Bride</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-[#D07C84] flex items-center justify-center text-white text-xl font-semibold shrink-0">
                  {match.bride.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{match.bride}</p>
                  <p className="text-sm text-gray-500">{match.brideAge} years old</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {match.brideLocation}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {match.brideProfession}
                </div>
              </div>
            </div>
          </div>

          {/* Match meta row */}
          <div className="mt-4 bg-[#F9FAFB] rounded-xl border border-gray-100 px-5 py-3 flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Photos</p>
              <p className={`text-sm font-medium ${match.photosRevealed ? "text-green-600" : "text-gray-400"}`}>
                {match.photosRevealed ? "Revealed" : "Hidden"}
              </p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Matched By</p>
              <p className="text-sm font-medium text-gray-700">{match.matchedBy}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Created</p>
              <p className="text-sm font-medium text-gray-700">{formatDate(match.createdDate)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#415192] text-white rounded-xl font-medium hover:bg-[#354177] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Call / Contact Modal ───────────────────────────── */
function CallModal({ match, onClose }: { match: Match; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-[#415192]" />
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Groom contact */}
          <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-[#415192] uppercase tracking-wider mb-3">Groom</p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#415192] flex items-center justify-center text-white text-base font-semibold shrink-0">
                {match.groom.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{match.groom}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-600 font-mono">{match.groomPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bride contact */}
          <div className="bg-[#F9FAFB] rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-[#D07C84] uppercase tracking-wider mb-3">Bride</p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#D07C84] flex items-center justify-center text-white text-base font-semibold shrink-0">
                {match.bride.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{match.bride}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-600 font-mono">{match.bridePhone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Mark Success Modal ─────────────────────────────── */
function MarkSuccessModal({ match, onClose }: { match: Match; onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <style>{`
        @keyframes msFadeBackdrop {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes msSlideUp {
          from { transform: translateY(40px) scale(0.95); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes msStarPulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50%       { transform: scale(1.2) rotate(10deg); }
        }
        @keyframes msStarFloat {
          0%   { transform: translateY(0) scale(1) rotate(0deg);    opacity: 0.9; }
          100% { transform: translateY(-130px) scale(0.2) rotate(45deg); opacity: 0; }
        }
        .ms-backdrop   { animation: msFadeBackdrop 0.3s ease forwards; }
        .ms-modal      { animation: msSlideUp 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .ms-star-pulse { animation: msStarPulse 1.4s ease-in-out infinite; }
        .ms-star-float { animation: msStarFloat var(--dur) ease-out var(--delay) forwards; }
      `}</style>

      <div className="ms-backdrop absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="ms-modal relative bg-white rounded-3xl px-8 pt-8 pb-7 max-w-sm w-full mx-4 shadow-2xl overflow-hidden">
        {/* Floating stars */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {FLOATING_STARS.map((s, i) => (
            <span
              key={i}
              className="ms-star-float absolute bottom-4 text-lg text-amber-400"
              style={{ left: s.left, "--dur": s.dur, "--delay": s.delay } as React.CSSProperties}
            >
              ★
            </span>
          ))}
        </div>

        {/* Star icon */}
        <div className="ms-star-pulse w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Star className="w-10 h-10 text-white fill-white" />
        </div>

        {/* Matched couple */}
        <div className="flex items-center justify-center gap-5 mb-5">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#415192] flex items-center justify-center text-white text-lg font-semibold mx-auto mb-1.5 ring-2 ring-[#ACB5DA]">
              {match.groom.charAt(0)}
            </div>
            <p className="text-xs font-medium text-gray-600">{match.groom.split(" ")[0]}</p>
          </div>
          <div className="flex flex-col items-center gap-1 pb-5">
            <Heart className="w-5 h-5 text-[#D07C84] fill-[#D07C84]" />
            <Heart className="w-3 h-3 text-[#ECCBCE] fill-[#ECCBCE]" />
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#D07C84] flex items-center justify-center text-white text-lg font-semibold mx-auto mb-1.5 ring-2 ring-[#ECCBCE]">
              {match.bride.charAt(0)}
            </div>
            <p className="text-xs font-medium text-gray-600">{match.bride.split(" ")[0]}</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Match Marked Successful!</h3>
        <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
          <span className="font-medium text-gray-700">{match.groom}</span>
          {" & "}
          <span className="font-medium text-gray-700">{match.bride}</span>
          {" "}have been marked as a successful match. May Allah bless their union.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-amber-400 to-[#D07C84] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          Wonderful!
        </button>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────── */
export function Matches() {
  const [matchStatuses, setMatchStatuses] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm]       = useState("");
  const [showFilters, setShowFilters]     = useState(false);
  const [statusFilter, setStatusFilter]   = useState("");
  const [dateFrom, setDateFrom]           = useState("");
  const [dateTo, setDateTo]               = useState("");
  const [currentPage, setCurrentPage]     = useState(1);
  const [pageSize, setPageSize]           = useState(8);

  const [viewMatch, setViewMatch]         = useState<Match | null>(null);
  const [callMatch, setCallMatch]         = useState<Match | null>(null);
  const [successMatch, setSuccessMatch]   = useState<Match | null>(null);

  const resetPage = () => setCurrentPage(1);

  const getEffectiveStatus = (m: Match) => matchStatuses[m.id] ?? m.status;

  const handleMarkSuccess = (match: Match) => {
    setMatchStatuses((prev) => ({ ...prev, [match.id]: "Successful" }));
    setSuccessMatch(match);
  };

  // Dynamic stats
  const photosRevealedCount = mockMatches.filter((m) => m.photosRevealed).length;
  const contactSharedCount  = mockMatches.filter((m) =>
    ["Contact Shared", "In Discussion", "Successful"].includes(getEffectiveStatus(m))
  ).length;
  const successfulCount = mockMatches.filter((m) => getEffectiveStatus(m) === "Successful").length;

  // Filtering
  const filtered = mockMatches.filter((m) => {
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      if (!m.groom.toLowerCase().includes(t) && !m.bride.toLowerCase().includes(t)) return false;
    }
    if (statusFilter && getEffectiveStatus(m) !== statusFilter) return false;
    if (dateFrom && m.createdDate < dateFrom) return false;
    if (dateTo   && m.createdDate > dateTo)   return false;
    return true;
  });

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Matches</h1>
        <p className="text-gray-500 mt-1">View and track all matched profiles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Total Matches</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{mockMatches.length}</p>
        </div>
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Photos Revealed</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{photosRevealedCount}</p>
        </div>
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Contact Shared</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{contactSharedCount}</p>
        </div>
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Successful</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{successfulCount}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#F9FAFB] rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by groom or bride name..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); resetPage(); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 border rounded-lg flex items-center gap-2 transition-colors ${
              showFilters
                ? "border-[#415192] bg-[#415192]/5 text-[#415192]"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); resetPage(); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); resetPage(); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="New Match">New Match</option>
                <option value="Photos Revealed">Photos Revealed</option>
                <option value="Contact Shared">Contact Shared</option>
                <option value="In Discussion">In Discussion</option>
                <option value="Successful">Successful</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Matches Table */}
      <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Groom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bride</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    No matches found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((match) => {
                  const effectiveStatus = getEffectiveStatus(match);
                  return (
                    <tr key={match.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{match.id.toString().padStart(4, "0")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#415192] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                            {match.groom.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-900">{match.groom}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#D07C84] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                            {match.bride.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-900">{match.bride}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(match.createdDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {match.photosRevealed ? (
                          <span className="flex items-center gap-1 text-sm text-green-600">
                            <Eye className="w-3.5 h-3.5" /> Revealed
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Hidden</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <MatchStatusBadge status={effectiveStatus} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setViewMatch(match)}
                            title="View Details"
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => setCallMatch(match)}
                            title="Contact Info"
                            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Phone className="w-4 h-4 text-gray-600" />
                          </button>
                          {effectiveStatus !== "Successful" && (
                            <button
                              onClick={() => handleMarkSuccess(match)}
                              title="Mark as Successful"
                              className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4 text-gray-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          totalItems={filtered.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          itemLabel="matches"
        />
      </div>

      {/* Modals */}
      {viewMatch && (
        <ViewDetailsModal
          match={viewMatch}
          effectiveStatus={getEffectiveStatus(viewMatch)}
          onClose={() => setViewMatch(null)}
        />
      )}
      {callMatch && (
        <CallModal match={callMatch} onClose={() => setCallMatch(null)} />
      )}
      {successMatch && (
        <MarkSuccessModal match={successMatch} onClose={() => setSuccessMatch(null)} />
      )}
    </div>
  );
}
