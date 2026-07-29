import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "./useAuth";
import { Spinner } from "../components/Spinner";

export function ProtectedRoute({
  roles,
  children,
}: {
  roles: string[];
  children: ReactNode;
}) {
  const { status, rol, activo } = useAuth();

  if (status === "loading") {
    return <Spinner fullscreen />;
  }

  if (status === "error" || !activo || !rol || !roles.includes(rol)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
