import { Navigate } from "react-router";
import { useAuth } from "../../auth/useAuth";
import { useLogin } from "./useLogin";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import { PasswordInput } from "../../components/PasswordInput";
import loginImg from "../../assets/imglogin.webp";
import logo from "../../assets/logo-sss.webp";

// Clases de Tailwind compartidas por los campos del formulario (el ícono va a la izquierda, por eso el padding extra).
const inputClasses =
  "campo-login w-full rounded-[10px] border border-white/[0.12] bg-white/[0.07] py-2.5 pl-10 pr-3.5 text-sm text-white placeholder:text-white/30 transition focus:border-[#4a90ff] focus:bg-[#4a90ff]/10 focus:outline-none focus:ring-[3px] focus:ring-[#4a90ff]/20";

// Clases de las etiquetas de los campos: mayúsculas pequeñas con letras separadas.
const labelClasses = "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-white/60";

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
      {/* Tarjeta de vidrio con el encabezado y el formulario. */}
      <div className="relative w-full max-w-sm rounded-[20px] border border-white/[0.08] bg-[#081030]/50 p-6 shadow-[0_32px_80px_rgba(0,0,0,0.55),0_0_0_1px_rgba(100,160,255,0.08)] backdrop-blur-[6px] sm:p-7">
        {/* Encabezado: escudo, institución, nombre de la app y descripción. */}
        <div className="mb-5 text-center">
          <img src={logo} alt="Escudo de San Salvador Sur" className="mx-auto mb-2 h-20 w-20 object-contain drop-shadow-[0_4px_16px_rgba(80,140,255,0.35)]" />
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#5ab4ff]">San Salvador Sur</p>
          <h1 className="mt-2 text-4xl font-black tracking-wider text-white [text-shadow:0_2px_12px_rgba(80,140,255,0.3)]">MAPSSS</h1>
          <p className="mt-1.5 text-sm italic text-white/65">Mapa de luminarias</p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Campo de usuario (correo) con su mensaje de error. */}
          <div>
            <label htmlFor="usuario" className={labelClasses}>
              Usuario
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
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
              <p className="mt-1 text-xs text-[#fca5a5]">{fieldErrors.usuario}</p>
            )}
          </div>

          {/* Campo de contraseña con su mensaje de error. */}
          <div>
            <label htmlFor="password" className={labelClasses}>
              Contraseña
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-white/40">
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
              <p className="mt-1 text-xs text-[#fca5a5]">{fieldErrors.password}</p>
            )}
          </div>

          {/* Mensajes generales de error o de éxito. */}
          {globalError && <Alert type="error" message={globalError} />}
          {globalSuccess && <Alert type="success" message={globalSuccess} />}

          {/* Botón de envío. */}
          <Button
            onClick={handleLogin}
            loading={loading}
            className="mt-1 w-full rounded-[10px]! bg-gradient-to-r! from-[#3a7fe8] to-[#5b6ef5] py-3! text-xs! font-bold uppercase tracking-[0.2em] shadow-[0_6px_24px_rgba(74,144,255,0.45)]! hover:from-[#4a8ff8] hover:to-[#6b7ef8] hover:shadow-[0_8px_30px_rgba(74,144,255,0.6)]!"
          >
            {loading ? "Verificando..." : "Iniciar sesión"}
            {!loading && <IconFlecha />}
          </Button>
        </div>
      </div>

      {/* Aviso al pie de la pantalla. */}
      <p className="absolute inset-x-0 bottom-4 px-4 text-center text-xs text-white/50">
        Acceso exclusivo al personal autorizado.
      </p>
    </div>
  );
}
