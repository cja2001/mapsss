import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { ROLES } from "./lib/types";
import { LoginPage } from "./features/login/LoginPage";
import { MenuPage } from "./features/menu/MenuPage";
import { CensoPage } from "./features/luminariasMap/CensoPage";
import { ReportePage } from "./features/luminariasMap/ReportePage";
import { AdminUsuariosPage } from "./features/adminUsuarios/AdminUsuariosPage";
import { InstallAppBanner } from "./components/InstallAppBanner";

/** Componente raíz: define el enrutador, el proveedor de sesión y todas las rutas de la app. */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Aviso para instalar la app; visible en cualquier ruta. */}
        <InstallAppBanner />
        <Routes>
          {/* Ruta pública: inicio de sesión. */}
          <Route path="/" element={<LoginPage />} />

          {/* Rutas protegidas: solo entran usuarios activos con alguno de los roles indicados. */}
          <Route
            path="/menu"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.EDITOR_LUMINARIAS]}>
                <MenuPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/luminarias/censo"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.EDITOR_LUMINARIAS]}>
                <CensoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/luminarias/reporte"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.EDITOR_LUMINARIAS]}>
                <ReportePage />
              </ProtectedRoute>
            }
          />

          {/* Administración de usuarios: solo el rol admin. */}
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN]}>
                <AdminUsuariosPage />
              </ProtectedRoute>
            }
          />

          {/* Cualquier otra dirección lleva al inicio de sesión. */}
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
