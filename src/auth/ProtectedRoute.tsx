import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "./useAuth";
import { Spinner } from "../components/Spinner";

/** Guardia de rutas: muestra el contenido solo a usuarios activos con un rol permitido. */
export function ProtectedRoute({
  roles,
  children,
}: {
  roles: string[];
  children: ReactNode;
}) {
  const { status, rol, activo } = useAuth();

  // Mientras se resuelve la sesión se muestra un indicador de carga.
  if (status === "loading") {
    return <Spinner fullscreen />;
  }

  // Sin permiso (error, usuario inactivo o rol no permitido): se redirige al inicio de sesión.
  if (status === "error" || !activo || !rol || !roles.includes(rol)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
