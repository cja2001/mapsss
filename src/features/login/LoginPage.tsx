import { Navigate } from "react-router";
import { useAuth } from "../../auth/useAuth";
import { useLogin } from "./useLogin";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { PasswordInput } from "../../components/PasswordInput";
import loginImg from "../../assets/imglogin.webp";

// Clases de Tailwind compartidas por los campos del formulario (el ícono va a la izquierda, por eso el padding extra).
const inputClasses =
  "w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-3.5 text-base text-slate-100 placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30";

// Clases de las etiquetas de los campos: mayúsculas pequeñas con letras separadas.
const labelClasses = "mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-300";

// Íconos de los campos (SVG), colocados dentro del input.
function IconUsuario() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6v1H4v-1Z" />
    </svg>
  );
}

function IconCandado() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1Zm2 0h6V7a3 3 0 0 0-6 0v3Z" />
    </svg>
  );
}

function IconFlecha() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Pantalla de inicio de sesión: formulario de usuario y contraseña. */
export function LoginPage() {
  // Estado de la sesión y lógica del formulario (que vive en useLogin).
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

  // Si ya hay una sesión activa, se pasa directo al menú.
  if (status === "ready" && session && activo) {
    return <Navigate to="/menu" replace />;
  }

  // Permite enviar el formulario con la tecla Enter.
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-brand-950 bg-cover bg-center p-4"
      style={{ backgroundImage: `url(${loginImg})` }}
    >
      {/* Capa oscura sobre la foto para que la tarjeta y el texto se lean bien. */}
      <div className="absolute inset-0 bg-brand-950/60" />

      {/* Tarjeta de vidrio con el encabezado y el formulario. */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-brand-900/70 p-8 shadow-2xl shadow-black/60 backdrop-blur-md sm:p-10">
        {/* Encabezado: institución, nombre de la app y descripción. */}
        <div className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-400">San Salvador Sur</p>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-white">MAPSSS</h1>
          <p className="mt-3 text-lg italic text-slate-300">Mapa de luminarias</p>
        </div>

        <div className="flex flex-col gap-5">
          {/* Campo de usuario (correo) con su mensaje de error. */}
          <div>
            <label htmlFor="usuario" className={labelClasses}>
              Usuario
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <IconUsuario />
              </span>
              <input
                id="usuario"
                type="text"
                autoComplete="username"
                placeholder="usuario@sansalvadorsur.gob.sv"
                className={inputClasses}
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                onKeyDown={onKeyDown}
              />
            </div>
            {fieldErrors.usuario && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.usuario}</p>
            )}
          </div>

          {/* Campo de contraseña con su mensaje de error. */}
          <div>
            <label htmlFor="password" className={labelClasses}>
              Contraseña
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400">
                <IconCandado />
              </span>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                className={`${inputClasses} pr-12`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onKeyDown}
              />
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
            )}
          </div>

          {/* Mensajes generales de error o de éxito. */}
          {globalError && <Alert type="error" message={globalError} />}
          {globalSuccess && <Alert type="success" message={globalSuccess} />}

          {/* Botón de envío. */}
          <Button
            onClick={handleLogin}
            loading={loading}
            className="mt-1 w-full rounded-xl! py-3.5! text-sm! uppercase tracking-[0.2em] shadow-brand-500/30"
          >
            {loading ? "Verificando..." : "Iniciar sesión"}
            {!loading && <IconFlecha />}
          </Button>
        </div>
      </div>

      {/* Aviso al pie de la pantalla. */}
      <p className="absolute inset-x-0 bottom-4 px-4 text-center text-sm text-slate-400">
        Acceso exclusivo al personal autorizado.
      </p>
    </div>
  );
}
