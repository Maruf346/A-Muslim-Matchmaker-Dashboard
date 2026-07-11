import { useEffect } from "react";
import { useNavigate } from "react-router";
import { isAuthenticated, isSuperAdmin } from "../lib/authStorage";

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }

    if (!isSuperAdmin()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  if (!isAuthenticated() || !isSuperAdmin()) return null;

  return <>{children}</>;
}
