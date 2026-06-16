export interface Matchmaker {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "Matchmaker" | "Superadmin";
  avatar: string;
  isActive: boolean;
  joinedAt: string;
}

const STORAGE_KEY = "amm_dashboard_matchmakers";

const initialMatchmakers: Matchmaker[] = [
  {
    id: 1,
    firstName: "Amina",
    lastName: "Yusuf",
    email: "amina.yusuf@matchmaker.com",
    role: "Matchmaker",
    avatar: "",
    isActive: true,
    joinedAt: "2026-01-10",
  },
  {
    id: 2,
    firstName: "Bilal",
    lastName: "Siddiqui",
    email: "bilal.siddiqui@matchmaker.com",
    role: "Superadmin",
    avatar: "",
    isActive: true,
    joinedAt: "2026-02-04",
  },
  {
    id: 3,
    firstName: "Fatima",
    lastName: "Khan",
    email: "fatima.khan@matchmaker.com",
    role: "Matchmaker",
    avatar: "",
    isActive: false,
    joinedAt: "2026-03-08",
  },
  {
    id: 4,
    firstName: "Omar",
    lastName: "Farooq",
    email: "omar.farooq@matchmaker.com",
    role: "Matchmaker",
    avatar: "",
    isActive: true,
    joinedAt: "2026-04-12",
  },
  {
    id: 5,
    firstName: "Nadia",
    lastName: "Hussain",
    email: "nadia.hussain@matchmaker.com",
    role: "Matchmaker",
    avatar: "",
    isActive: true,
    joinedAt: "2026-05-01",
  },
];

function getStoredMatchmakers(): Matchmaker[] {
  if (typeof window === "undefined") return initialMatchmakers;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialMatchmakers;
  try {
    const parsed = JSON.parse(raw) as Matchmaker[];
    return parsed;
  } catch {
    return initialMatchmakers;
  }
}

export function loadMatchmakers(): Matchmaker[] {
  return getStoredMatchmakers();
}

export function saveMatchmakers(matchmakers: Matchmaker[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(matchmakers));
}

export function findMatchmakerById(id: number): Matchmaker | undefined {
  return getStoredMatchmakers().find((item) => item.id === id);
}
