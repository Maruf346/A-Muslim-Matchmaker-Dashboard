import { Outlet, Link, useLocation } from "react-router";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Heart,
  MessageSquare,
  CheckCircle2,
  Layers,
  Settings,
  BarChart3,
  FileText,
  User,
  LogOut,
  ChevronUp,
  MessageCircle,
  CreditCard
} from "lucide-react";
import { span } from "motion/react-m";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/users", label: "Users", icon: Users },
  { path: "/matchmaking", label: "Matchmaking", icon: Heart },
  { path: "/requests", label: "Requests", icon: MessageSquare },
  { path: "/matches", label: "Matches", icon: CheckCircle2 },
  { path: "/leads", label: "Leads", icon: Layers },
  { path: "/chat", label: "Chat with User", icon: MessageCircle },
  { path: "/subscriptions", label: "Subscriptions & Payments", icon: CreditCard },
  // { path: "/custom-fields", label: "Custom Fields", icon: FileText },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function RootLayout() {
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      alert("Logging out...");
      // Add logout logic here
    }
  };

  return (
    <div className="flex h-screen bg-[#FFFFFF]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col mb-8 border-b border-gray-200">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center px-6 py-4 border-b border-gray-200 bg-white">
          <img
            src="/logo.png"
            alt="A Muslim Matchmaker Logo"
            className="h-26 w-auto object-contain"
          />

          <h1 className="mt-2 text-sm font-semibold tracking-wide text-gray-700 uppercase">
            Admin Panel
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2.5 mb-1 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#415192] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 relative" ref={profileRef}>
          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                onClick={() => setShowProfileMenu(false)}
              >
                <User className="w-4 h-4" />
                <div>
                  <p className="text-sm font-medium">View Profile</p>
                  <p className="text-xs text-gray-500">Manage your account</p>
                </div>
              </Link>

              <Link
                to="/settings"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                onClick={() => setShowProfileMenu(false)}
              >
                <Settings className="w-4 h-4" />
                <div>
                  <p className="text-sm font-medium">Settings</p>
                  <p className="text-xs text-gray-500">App configuration</p>
                </div>
              </Link>

              <div className="border-t border-gray-200"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600"
              >
                <LogOut className="w-4 h-4" />
                <div className="text-left">
                  <p className="text-sm font-medium">Logout</p>
                  <p className="text-xs text-red-500">Sign out of your account</p>
                </div>
              </button>
            </div>
          )}

          {/* Profile Button */}
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#415192] flex items-center justify-center text-white">
              A
            </div>
            <div className="ml-3 flex-1 text-left">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">admin@matchmaker.com</p>
            </div>
            <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
