/** Botón "leyenda" (topleft, debajo del engrane de herramientas) que muestra/oculta el LeyendaPanel. */
export function MapLegendButton({
  activo,
  onToggle,
}: {
  activo: boolean;
  onToggle: () => void;
}) {
  return (
    <a
      href="#"
      title="Ver leyenda"
      onClick={(e) => {
        e.preventDefault();
        onToggle();
      }}
      className={activo ? "bg-brand-50" : ""}
      style={{
        display: "block",
        fontSize: 15,
        lineHeight: "26px",
        textAlign: "center",
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      📖
    </a>
  );
}
