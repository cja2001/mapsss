import { Navigate } from "react-router";
import { useAuth } from "../../auth/useAuth";
import { useLogin } from "./useLogin";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { PasswordInput } from "../../components/PasswordInput";
import loginImg from "../../assets/imglogin.webp";

const inputClasses =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-base text-slate-100 placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30";

export function LoginPage() {
  const { status, session, activo } = useAuth();
  const {
    usuario,
    setUsuario,
    password,
    setPassword,
    fieldErrors,
    globalError,
    globalSuccess,
    loading,
    handleLogin,
  } = useLogin();

  if (status === "ready" && session && activo) {
    return <Navigate to="/menu" replace />;
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <div className="app-shell-bg flex min-h-screen items-center justify-center p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50 md:grid-cols-2">
        <div
          className="relative hidden min-h-[420px] flex-col justify-end p-8 md:flex"
          style={{ backgroundImage: `url(${loginImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-900/50 to-brand-900/20" />
          <div className="relative">
            <h1 className="text-3xl font-bold text-white">Bienvenido</h1>
            <p className="mt-2 text-slate-300">Ingresa tus credenciales para continuar.</p>
          </div>
        </div>

        <div className="flex flex-col gap-5 bg-brand-900 p-8">
          <div>
            <label htmlFor="usuario" className="mb-1.5 block text-sm font-medium text-slate-300">
              Usuario
            </label>
            <input
              id="usuario"
              type="text"
              autoComplete="username"
              className={inputClasses}
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              onKeyDown={onKeyDown}
            />
            {fieldErrors.usuario && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.usuario}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
              Password
            </label>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              className={inputClasses}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={onKeyDown}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
            )}
          </div>

          {globalError && <Alert type="error" message={globalError} />}
          {globalSuccess && <Alert type="success" message={globalSuccess} />}

          <Button onClick={handleLogin} loading={loading} className="w-full">
            {loading ? "Verificando..." : "Iniciar sesión"}
          </Button>
        </div>
      </div>
    </div>
  );
}
