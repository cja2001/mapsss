import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { ROLES } from "./lib/types";
import { LoginPage } from "./features/login/LoginPage";
import { MenuPage } from "./features/menu/MenuPage";
import { CensoPage } from "./features/luminariasMap/CensoPage";
import { ReportePage } from "./features/luminariasMap/ReportePage";
import { AdminUsuariosPage } from "./features/adminUsuarios/AdminUsuariosPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />

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

          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN]}>
                <AdminUsuariosPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
