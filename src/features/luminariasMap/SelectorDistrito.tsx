import { TODOS_LOS_DISTRITOS, type DistritoResumen } from "./distritos";

/** Desplegable para ver el dashboard de todos los distritos o de uno solo. */
export function SelectorDistrito({
  distritos,
  valor,
  onChange,
}: {
  distritos: DistritoResumen[];
  valor: string;
  onChange: (clave: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <span className="font-medium">Distrito</span>
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm font-semibold text-slate-900 shadow-sm"
      >
        <option value={TODOS_LOS_DISTRITOS}>Todos los distritos</option>
        {distritos.map((d) => (
          <option key={d.clave} value={d.clave}>
            {d.nombre} ({d.total.toLocaleString("es-SV")})
          </option>
        ))}
      </select>
    </label>
  );
}
