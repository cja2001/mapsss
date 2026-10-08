/** Indicador de carga giratorio. Con `fullscreen` ocupa toda la pantalla, centrado. */
export function Spinner({ fullscreen = false }: { fullscreen?: boolean }) {
  // El ícono giratorio.
  const spinner = (
    <svg
      className="animate-spin text-brand-400"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );

  // Versión pequeña, para usar dentro de otros elementos.
  if (!fullscreen) return spinner;

  // Versión a pantalla completa.
  return (
    <div className="app-shell-bg flex h-screen w-full items-center justify-center">
      {spinner}
    </div>
  );
}
