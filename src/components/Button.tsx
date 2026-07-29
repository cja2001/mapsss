import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  children: ReactNode;
};

const VARIANT_CLASSES: Record<string, string> = {
  primary:
    "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/40 disabled:bg-brand-800 disabled:text-slate-400",
  secondary:
    "bg-white/10 hover:bg-white/15 text-slate-100 border border-white/10 disabled:opacity-50",
  danger:
    "bg-status-danger/90 hover:bg-status-danger text-white disabled:opacity-50",
  ghost: "bg-transparent hover:bg-white/10 text-brand-300 disabled:opacity-50",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <svg
          className="animate-spin"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      )}
      {children}
    </button>
  );
}
