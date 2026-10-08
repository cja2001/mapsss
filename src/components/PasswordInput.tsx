import { useId, useState, type InputHTMLAttributes } from "react";

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
        className="absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none"
      >
        <span id={labelId} className="sr-only">
          {visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        </span>
        {visible ? "🙈" : "👁️"}
      </button>
    </div>
  );
}
