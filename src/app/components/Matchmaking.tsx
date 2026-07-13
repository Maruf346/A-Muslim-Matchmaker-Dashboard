import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Heart, MapPin, Briefcase, Search, ChevronDown, Users, Check, X } from "lucide-react";
import { TablePagination } from "./ui/TablePagination";
import {
  createPrivateMatchSuggestion,
  listPrivateMatchmakingClients,
  listPrivateMatchmakingProspects,
  type PaginatedResponse,
  type PrivateMatchSuggestionParty,
  type PrivateMatchmakingClient,
  type PrivateMatchmakingGenderFilter,
  type PrivateMatchmakingProspect,
} from "../api/privateMatchmaking";
import { ApiError } from "../api/errors";

type GenderFilter = "" | "Male" | "Female";

const FLOATING_HEARTS = [
  { left: "5%", dur: "1.8s", delay: "0.1s" },
  { left: "15%", dur: "2.1s", delay: "0.4s" },
  { left: "28%", dur: "1.6s", delay: "0s" },
  { left: "42%", dur: "2.3s", delay: "0.2s" },
  { left: "55%", dur: "1.9s", delay: "0.6s" },
  { left: "68%", dur: "1.7s", delay: "0.3s" },
  { left: "80%", dur: "2.0s", delay: "0.5s" },
  { left: "92%", dur: "1.5s", delay: "0.1s" },
];

interface MatchSuccessModalProps {
  first: PrivateMatchSuggestionParty;
  second: PrivateMatchSuggestionParty;
  onClose: () => void;
}

function getDisplayName(person: {
  codename: string | null;
  first_name: string;
  last_name: string;
}) {
  return `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim() || person.codename || "Unnamed profile";
}

function getLocation(person: { city: string | null; country: string | null }) {
  const parts = [person.city, person.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "-";
}

function formatSecondaryLine(person: { role: string; sect?: string | null }) {
  const parts = [person.role, person.sect].filter(Boolean).map((value) => String(value));
  if (parts.length === 0) return "-";

  return parts
    .map((value) => value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " "))
    .join(" • ");
}

function formatRole(value: string | null | undefined) {
  if (!value) return "-";
  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");
}

function isPaginatedResponse<T>(value: unknown): value is PaginatedResponse<T> {
  return Boolean(value) && typeof value === "object" && "results" in (value as Record<string, unknown>);
}

function normalizeListResponse<T>(value: PaginatedResponse<T> | T[] | null) {
  if (Array.isArray(value)) {
    return {
      results: value,
      count: value.length,
    };
  }

  if (isPaginatedResponse<T>(value)) {
    return {
      results: Array.isArray(value.results) ? value.results : [],
      count: typeof value.count === "number" ? value.count : 0,
    };
  }

  return {
    results: [] as T[],
    count: 0,
  };
}

function MatchSuccessModal({ first, second, onClose }: MatchSuccessModalProps) {
  const firstColor = first.gender === "male" ? "#415192" : "#D07C84";
  const secondColor = second.gender === "male" ? "#415192" : "#D07C84";
  const firstRing = first.gender === "male" ? "#ACB5DA" : "#ECCBCE";
  const secondRing = second.gender === "male" ? "#ACB5DA" : "#ECCBCE";
  const firstName = getDisplayName(first);
  const secondName = getDisplayName(second);

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
          0%   { transform: translateY(0px) scale(1);      opacity: 0.85; }
          100% { transform: translateY(-130px) scale(0.3); opacity: 0; }
        }
        .mm-backdrop    { animation: fadeInBackdrop 0.3s ease forwards; }
        .mm-modal       { animation: slideUpModal 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .mm-heart-pulse { animation: heartPulse 1.3s ease-in-out infinite; }
        .mm-float       { animation: floatHeart var(--dur) ease-out var(--delay) forwards; }
      `}</style>

      <div className="mm-backdrop absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="mm-modal relative bg-white rounded-3xl px-8 pt-8 pb-7 max-w-sm w-full mx-4 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {FLOATING_HEARTS.map((heart, index) => (
            <span
              key={index}
              className="mm-float absolute bottom-4 text-xl text-[#D07C84]"
              style={{ left: heart.left, "--dur": heart.dur, "--delay": heart.delay } as CSSProperties}
            >
              ♥
            </span>
          ))}
        </div>

        <div className="mm-heart-pulse w-20 h-20 bg-gradient-to-br from-[#D07C84] to-[#ECCBCE] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Heart className="w-10 h-10 text-white fill-white" />
        </div>

        <div className="flex items-center justify-center gap-5 mb-5">
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold mx-auto mb-1.5 ring-2"
              style={{ backgroundColor: firstColor, outline: `2px solid ${firstRing}`, outlineOffset: "2px" }}
            >
              {firstName.charAt(0)}
            </div>
            <p className="text-sm font-medium text-gray-700">{firstName.split(" ")[0]}</p>
          </div>

          <div className="flex flex-col items-center gap-1 pb-5">
            <Heart className="w-5 h-5 text-[#D07C84] fill-[#D07C84]" />
            <Heart className="w-3 h-3 text-[#ECCBCE] fill-[#ECCBCE]" />
          </div>

          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold mx-auto mb-1.5"
              style={{ backgroundColor: secondColor, outline: `2px solid ${secondRing}`, outlineOffset: "2px" }}
            >
              {secondName.charAt(0)}
            </div>
            <p className="text-sm font-medium text-gray-700">{secondName.split(" ")[0]}</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Match Generated!</h3>
        <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
          <span className="font-medium text-gray-700">{firstName}</span>
          {" & "}
          <span className="font-medium text-gray-700">{secondName}</span>
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

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Users className="w-7 h-7 text-gray-300" />
      </div>
      <p className="text-sm text-gray-400 leading-relaxed">{message}</p>
    </div>
  );
}

export function Matchmaking() {
  const [requestedGender, setRequestedGender] = useState<GenderFilter>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedLeft, setSelectedLeft] = useState<PrivateMatchmakingClient | null>(null);
  const [selectedRight, setSelectedRight] = useState<PrivateMatchmakingProspect | null>(null);
  const [matchSuccess, setMatchSuccess] = useState<{ first: PrivateMatchSuggestionParty; second: PrivateMatchSuggestionParty } | null>(null);

  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");
  const [debouncedLeftSearch, setDebouncedLeftSearch] = useState("");
  const [debouncedRightSearch, setDebouncedRightSearch] = useState("");

  const [leftPage, setLeftPage] = useState(1);
  const [leftPageSize, setLeftPageSize] = useState(8);
  const [rightPage, setRightPage] = useState(1);
  const [rightPageSize, setRightPageSize] = useState(8);

  const [leftClients, setLeftClients] = useState<PrivateMatchmakingClient[]>([]);
  const [rightProspects, setRightProspects] = useState<PrivateMatchmakingProspect[]>([]);
  const [leftTotal, setLeftTotal] = useState(0);
  const [rightTotal, setRightTotal] = useState(0);
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);

  const [loadingLeft, setLoadingLeft] = useState(false);
  const [loadingRight, setLoadingRight] = useState(false);
  const [creatingMatch, setCreatingMatch] = useState(false);
  const [leftError, setLeftError] = useState<string | null>(null);
  const [rightError, setRightError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedLeftSearch(leftSearch.trim()), 250);
    return () => clearTimeout(timer);
  }, [leftSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedRightSearch(rightSearch.trim()), 250);
    return () => clearTimeout(timer);
  }, [rightSearch]);

  useEffect(() => {
    let cancelled = false;

    const loadCounts = async () => {
      try {
        const [maleResponse, femaleResponse] = await Promise.all([
          listPrivateMatchmakingClients({ gender: "male", page: 1, page_size: 1 }),
          listPrivateMatchmakingClients({ gender: "female", page: 1, page_size: 1 }),
        ]);

        if (cancelled) return;

        setMaleCount(normalizeListResponse(maleResponse).count);
        setFemaleCount(normalizeListResponse(femaleResponse).count);
      } catch {
        if (cancelled) return;
        setMaleCount(0);
        setFemaleCount(0);
      }
    };

    void loadCounts();

    return () => {
      cancelled = true;
    };
  }, []);

  const requestedGenderParam: PrivateMatchmakingGenderFilter | undefined =
    requestedGender === "Male" ? "male" : requestedGender === "Female" ? "female" : undefined;

  useEffect(() => {
    if (!requestedGenderParam) {
      setLeftClients([]);
      setLeftTotal(0);
      setLeftError(null);
      return;
    }

    let cancelled = false;

    const loadClients = async () => {
      setLoadingLeft(true);
      setLeftError(null);

      try {
        const response = await listPrivateMatchmakingClients({
          gender: requestedGenderParam,
          page: leftPage,
          page_size: leftPageSize,
          search: debouncedLeftSearch || undefined,
        });

        if (cancelled) return;

        const normalized = normalizeListResponse(response);
        setLeftClients(normalized.results);
        setLeftTotal(normalized.count);

        if (normalized.results.length === 0 && normalized.count > 0 && leftPage > 1) {
          setLeftPage((prev) => Math.max(1, prev - 1));
        }
      } catch (error) {
        if (cancelled) return;
        setLeftError(error instanceof ApiError ? error.message : "Unable to load private clients.");
        setLeftClients([]);
        setLeftTotal(0);
      } finally {
        if (!cancelled) setLoadingLeft(false);
      }
    };

    void loadClients();

    return () => {
      cancelled = true;
    };
  }, [debouncedLeftSearch, leftPage, leftPageSize, requestedGenderParam]);

  useEffect(() => {
    if (!selectedLeft) {
      setRightProspects([]);
      setRightTotal(0);
      setRightError(null);
      setSelectedRight(null);
      return;
    }

    let cancelled = false;

    const loadProspects = async () => {
      setLoadingRight(true);
      setRightError(null);

      try {
        const response = await listPrivateMatchmakingProspects({
          private_client_id: selectedLeft.id,
          page: rightPage,
          page_size: rightPageSize,
          search: debouncedRightSearch || undefined,
        });

        if (cancelled) return;

        const normalized = normalizeListResponse(response);
        setRightProspects(normalized.results);
        setRightTotal(normalized.count);

        if (normalized.results.length === 0 && normalized.count > 0 && rightPage > 1) {
          setRightPage((prev) => Math.max(1, prev - 1));
        }
      } catch (error) {
        if (cancelled) return;
        setRightError(error instanceof ApiError ? error.message : "Unable to load suggested profiles.");
        setRightProspects([]);
        setRightTotal(0);
      } finally {
        if (!cancelled) setLoadingRight(false);
      }
    };

    void loadProspects();

    return () => {
      cancelled = true;
    };
  }, [debouncedRightSearch, rightPage, rightPageSize, selectedLeft]);

  const suggestedGender: GenderFilter =
    requestedGender === "Male" ? "Female" :
    requestedGender === "Female" ? "Male" : "";

  const leftAccent = requestedGender === "Female" ? "#D07C84" : "#415192";
  const rightAccent = suggestedGender === "Female" ? "#D07C84" : "#415192";

  const leftSelectedStyle =
    requestedGender === "Female"
      ? "border-[#D07C84] bg-[#ECCBCE]/30"
      : "border-[#415192] bg-[#ACB5DA]/20";
  const rightSelectedStyle =
    suggestedGender === "Female"
      ? "border-[#D07C84] bg-[#ECCBCE]/30"
      : "border-[#415192] bg-[#ACB5DA]/20";

  const leftProfile = useMemo(
    () => (selectedLeft ? leftClients.find((profile) => profile.id === selectedLeft.id) ?? selectedLeft : null),
    [leftClients, selectedLeft],
  );

  const rightProfile = useMemo(
    () => (selectedRight ? rightProspects.find((profile) => profile.id === selectedRight.id) ?? selectedRight : null),
    [rightProspects, selectedRight],
  );

  const handleGenderChange = (gender: GenderFilter) => {
    setRequestedGender(gender);
    setSelectedLeft(null);
    setSelectedRight(null);
    setLeftSearch("");
    setRightSearch("");
    setDebouncedLeftSearch("");
    setDebouncedRightSearch("");
    setLeftPage(1);
    setRightPage(1);
    setLeftClients([]);
    setRightProspects([]);
    setLeftTotal(0);
    setRightTotal(0);
    setLeftError(null);
    setRightError(null);
    setActionError(null);
  };

  const handleCreateMatch = async () => {
    if (!leftProfile || !rightProfile || creatingMatch) return;

    setCreatingMatch(true);
    setActionError(null);

    try {
      const response = await createPrivateMatchSuggestion({
        private_client_id: leftProfile.id,
        prospect_id: rightProfile.id,
      });

      setMatchSuccess({
        first: response.private_client,
        second: response.prospect,
      });
      setSelectedLeft(null);
      setSelectedRight(null);
      setRightSearch("");
      setDebouncedRightSearch("");
      setRightPage(1);
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : "Unable to create match.");
    } finally {
      setCreatingMatch(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Private Matchmaking Panel</h1>
        <p className="text-gray-500 mt-1">Select profiles to create a new match</p>
      </div>

      <div className={`grid grid-cols-3 gap-6 ${requestedGender ? "items-start" : "items-stretch"}`}>
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 pb-4">
            <div className="flex items-center gap-2 mb-3 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 flex-1 min-w-0 truncate">Requested Profiles</h2>

              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((open) => !open)}
                  className={`flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-sm whitespace-nowrap bg-white ${
                    requestedGender === "Male"
                      ? "text-[#415192] border-[#415192]"
                      : requestedGender === "Female"
                        ? "text-[#D07C84] border-[#D07C84]"
                        : "text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {requestedGender ? (
                    <span className="text-sm leading-none">
                      {requestedGender === "Male" ? "♂" : "♀"}
                    </span>
                  ) : (
                    <Users className="w-3 h-3 text-gray-400" />
                  )}
                  <span>{requestedGender || "Gender"}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 opacity-60 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full right-0 mt-1.5 w-44 bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/60 overflow-hidden z-30">
                    <button
                      onClick={() => {
                        handleGenderChange("Male");
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 transition-colors ${
                        requestedGender === "Male" ? "bg-[#415192]/5" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#415192] to-[#5261a8] flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
                        ♂
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900">Male</p>
                        <p className="text-[10px] text-gray-400">{maleCount} profiles</p>
                      </div>
                      {requestedGender === "Male" && (
                        <div className="w-4 h-4 rounded-full bg-[#415192] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>

                    <div className="h-px bg-gray-100 mx-2.5" />

                    <button
                      onClick={() => {
                        handleGenderChange("Female");
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 transition-colors ${
                        requestedGender === "Female" ? "bg-[#D07C84]/5" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D07C84] to-[#e08e96] flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
                        ♀
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900">Female</p>
                        <p className="text-[10px] text-gray-400">{femaleCount} profiles</p>
                      </div>
                      {requestedGender === "Female" && (
                        <div className="w-4 h-4 rounded-full bg-[#D07C84] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>

                    {requestedGender && (
                      <>
                        <div className="h-px bg-gray-100 mx-2.5" />
                        <button
                          onClick={() => {
                            handleGenderChange("");
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                          <span className="text-[10px] font-medium">Clear selection</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {requestedGender && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search profiles..."
                  value={leftSearch}
                  onChange={(event) => {
                    setLeftSearch(event.target.value);
                    setLeftPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent"
                />
              </div>
            )}
          </div>

          {!requestedGender ? (
            <EmptyPanel message="Select a gender above to view requested profiles" />
          ) : (
            <>
              <div className="px-6 space-y-3 pb-4">
                {loadingLeft ? (
                  <p className="text-sm text-gray-400 text-center py-6">Loading profiles...</p>
                ) : leftError ? (
                  <p className="text-sm text-red-500 text-center py-6">{leftError}</p>
                ) : leftClients.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No profiles found.</p>
                ) : (
                  leftClients.map((profile) => (
                    <div
                      key={profile.id}
                      onClick={() => setSelectedLeft(profile)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedLeft?.id === profile.id
                          ? leftSelectedStyle
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-semibold shrink-0"
                          style={{ backgroundColor: leftAccent }}
                        >
                          {getDisplayName(profile).charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{getDisplayName(profile)}</p>
                          <p className="text-xs text-gray-500">{profile.age ?? "-"} years</p>
                        </div>
                        {selectedLeft?.id === profile.id && (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: leftAccent }}
                          >
                            <Heart className="w-3 h-3 text-white fill-white" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{getLocation(profile)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Users className="w-3 h-3 shrink-0" />
                          <span className="truncate">{formatRole(profile.role)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <TablePagination
                totalItems={leftTotal}
                currentPage={leftPage}
                pageSize={leftPageSize}
                onPageChange={setLeftPage}
                onPageSizeChange={(size) => {
                  setLeftPageSize(size);
                  setLeftPage(1);
                }}
                itemLabel="profiles"
              />
            </>
          )}
        </div>

        <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center min-h-[380px]">
          {leftProfile && rightProfile ? (
            <div className="text-center w-full">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="text-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-1"
                    style={{ backgroundColor: leftAccent }}
                  >
                    {getDisplayName(leftProfile).charAt(0)}
                  </div>
                  <p className="text-xs text-gray-500 max-w-[70px] truncate mx-auto">
                    {getDisplayName(leftProfile).split(" ")[0]}
                  </p>
                </div>
                <Heart className="w-8 h-8 text-[#D07C84] fill-[#D07C84]" />
                <div className="text-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-1"
                    style={{ backgroundColor: rightAccent }}
                  >
                    {getDisplayName(rightProfile).charAt(0)}
                  </div>
                  <p className="text-xs text-gray-500 max-w-[70px] truncate mx-auto">
                    {getDisplayName(rightProfile).split(" ")[0]}
                  </p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Create Match</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                {getDisplayName(leftProfile)}
                <br />
                <span className="text-[#D07C84]">&</span>
                <br />
                {getDisplayName(rightProfile)}
              </p>
              {actionError ? <p className="text-xs text-red-500 mb-3">{actionError}</p> : null}
              <button
                onClick={() => void handleCreateMatch()}
                disabled={creatingMatch}
                className="px-6 py-3 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creatingMatch ? "Generating..." : "Generate Match"}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500 leading-relaxed">
                {!requestedGender
                  ? "Select a gender on the left to begin matching"
                  : "Select one profile from each side to create a match"}
              </p>
            </div>
          )}
        </div>

        <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Suggested Profiles</h2>
            {leftProfile && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search profiles..."
                  value={rightSearch}
                  onChange={(event) => {
                    setRightSearch(event.target.value);
                    setRightPage(1);
                  }}
                  className={`w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    suggestedGender === "Female" ? "focus:ring-[#D07C84]" : "focus:ring-[#415192]"
                  }`}
                />
              </div>
            )}
          </div>

          {!suggestedGender ? (
            <EmptyPanel message="Suggested profiles will appear once a gender is selected on the left" />
          ) : !leftProfile ? (
            <EmptyPanel message="Select a requested profile to view suggested prospects" />
          ) : (
            <>
              <div className="px-6 space-y-3 pb-4">
                {loadingRight ? (
                  <p className="text-sm text-gray-400 text-center py-6">Loading profiles...</p>
                ) : rightError ? (
                  <p className="text-sm text-red-500 text-center py-6">{rightError}</p>
                ) : rightProspects.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No profiles found.</p>
                ) : (
                  rightProspects.map((profile) => (
                    <div
                      key={profile.id}
                      onClick={() => setSelectedRight(profile)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedRight?.id === profile.id
                          ? rightSelectedStyle
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-semibold shrink-0"
                          style={{ backgroundColor: rightAccent }}
                        >
                          {getDisplayName(profile).charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{getDisplayName(profile)}</p>
                          <p className="text-xs text-gray-500">{profile.age ?? "-"} years</p>
                        </div>
                        {selectedRight?.id === profile.id && (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: rightAccent }}
                          >
                            <Heart className="w-3 h-3 text-white fill-white" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{getLocation(profile)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Users className="w-3 h-3 shrink-0" />
                          <span className="truncate">{formatRole(profile.role)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <TablePagination
                totalItems={rightTotal}
                currentPage={rightPage}
                pageSize={rightPageSize}
                onPageChange={setRightPage}
                onPageSizeChange={(size) => {
                  setRightPageSize(size);
                  setRightPage(1);
                }}
                itemLabel="profiles"
              />
            </>
          )}
        </div>
      </div>

      {matchSuccess && (
        <MatchSuccessModal
          first={matchSuccess.first}
          second={matchSuccess.second}
          onClose={() => setMatchSuccess(null)}
        />
      )}
    </div>
  );
}
