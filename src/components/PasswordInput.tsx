import { useId, useState, type InputHTMLAttributes } from "react";

// Íconos del botón (SVG): ojo abierto cuando la contraseña está oculta, tachado cuando se ve.
function IconOjo({ tachado }: { tachado: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
      {tachado && <path d="m3 3 18 18" strokeLinecap="round" />}
    </svg>
  );
}

/** Campo de contraseña con un botón para mostrar u ocultar lo escrito. */
export function PasswordInput({
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  // Si la contraseña se muestra como texto, y un id para la etiqueta accesible del botón.
  const [visible, setVisible] = useState(false);
  const labelId = useId();

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={className}
        {...rest}
      />
      {/* Botón del ojo: alterna entre mostrar y ocultar. */}
      <button
        type="button"
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-labelledby={labelId}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-200"
      >
        <span id={labelId} className="sr-only">
          {visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        </span>
        <IconOjo tachado={visible} />
      </button>
    </div>
  );
}
