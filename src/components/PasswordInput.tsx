import { useId, useState, type InputHTMLAttributes } from "react";

export function PasswordInput({
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  const labelId = useId();

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={className}
        {...rest}
      />
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
