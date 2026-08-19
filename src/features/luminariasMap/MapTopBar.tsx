import { Link } from "react-router";
import type { ColoniaSugerencia } from "./useColoniasBuscador";

export type MapVista = "mapa" | "dashboard";

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}

function IconMap() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" strokeLinejoin="round" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}

function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function MapTopBar({
  vista,
  onVistaChange,
  query,
  onQueryChange,
  sugerencias,
  onSeleccionarColonia,
}: {
  vista: MapVista;
  onVistaChange: (vista: MapVista) => void;
  query: string;
  onQueryChange: (query: string) => void;
  sugerencias: ColoniaSugerencia[];
  onSeleccionarColonia: (colonia: ColoniaSugerencia) => void;
}) {
  const mostrarSugerencias = query.trim().length > 0 && sugerencias.length > 0;
  const sinResultados = query.trim().length > 0 && sugerencias.length === 0;

  function manejarTeclado(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && sugerencias.length > 0) {
      onSeleccionarColonia(sugerencias[0]);
    } else if (e.key === "Escape") {
      onQueryChange("");
    }
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex flex-col gap-2.5 p-3">
      <div className="flex items-center gap-2.5">
        {/* Espaciador invisible: reserva el ancho aprox. del botón "Menú" para que la
            barra de búsqueda quede centrada de verdad entre ambos lados. */}
        <div className="w-[92px] shrink-0" />

        <div className="pointer-events-auto relative min-w-0 flex-1">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-slate-500 shadow-lg">
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={manejarTeclado}
              placeholder="Buscar colonia..."
              className="w-full min-w-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
            <IconSearch />
          </div>

          {mostrarSugerencias && (
            <ul className="absolute inset-x-0 top-full mt-1.5 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1.5 shadow-lg">
              {sugerencias.map((s) => (
                <li key={s.nombre}>
                  <button
                    type="button"
                    onClick={() => onSeleccionarColonia(s)}
                    className="block w-full truncate px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    {s.nombre}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {sinResultados && (
            <div className="absolute inset-x-0 top-full mt-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-400 shadow-lg">
              Sin resultados
            </div>
          )}
        </div>

        <Link
          to="/menu"
          className="pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-lg hover:bg-slate-50"
        >
          <IconMenu />
          Menú
        </Link>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Espaciador invisible: deja libre la zona de los controles de zoom de Leaflet. */}
        <div className="w-[52px] shrink-0" />

        <div className="flex min-w-0 flex-1 justify-center">
          <div className="pointer-events-auto inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
            <button
              type="button"
              onClick={() => onVistaChange("mapa")}
              aria-label="Mapa"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                vista === "mapa" ? "bg-blue-50 text-brand-600" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <IconMap />
              <span className="hidden sm:inline">Mapa</span>
            </button>
            <button
              type="button"
              onClick={() => onVistaChange("dashboard")}
              aria-label="Dashboard"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                vista === "dashboard" ? "bg-blue-50 text-brand-600" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <IconDashboard />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          </div>
        </div>

        {/* Espaciador invisible: deja libre la zona del control de capas nativo de Leaflet. */}
        <div className="w-[52px] shrink-0" />
      </div>
    </div>
  );
}
