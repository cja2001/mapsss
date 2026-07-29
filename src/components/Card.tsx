import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-brand-800/60 p-6 shadow-2xl shadow-black/30 backdrop-blur-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
