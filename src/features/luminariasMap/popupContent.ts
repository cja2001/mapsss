// Contenido de los popups del mapa. Se construye con elementos del DOM (no con React) porque Leaflet los inserta directamente.
import { SERVICIOS, type CambioLuminaria, type Luminaria, type Servicio } from "../../lib/types";
import type { MapaConfig } from "./colorConfig";

/** Acciones que el popup puede disparar; las que no se definen no muestran su control. */
export type PopupHandlers = {
  onGuardarEdicion: (nuevoValor: string) => void;
  onGuardarTasada?: (nuevoValor: boolean) => void;
  /** Si se define, la potencia se muestra como un campo editable en vez de texto. */
  onGuardarPotencia?: (nuevoValor: string) => void;
  onGuardarServicio?: (nuevoValor: Servicio | null) => void;
  cargarHistorial?: () => Promise<CambioLuminaria[]>;
};

// Clases de Tailwind compartidas por los selectores y campos del popup.
const CLASE_SELECT = "rounded border border-slate-300 px-1.5 py-1 text-xs";

/** Fecha y hora en formato corto local; si no es una fecha válida, devuelve el texto original. */
function formatearFecha(iso: string) {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime())
    ? iso
    : fecha.toLocaleString("es-SV", { dateStyle: "short", timeStyle: "short" });
}

// Nombre visible de cada campo en el historial.
const ETIQUETA_CAMPO: Record<CambioLuminaria["campo"], string> = {
  tipo: "Tipo",
  potencia: "Potencia",
};

/** Enlace "Ver historial de cambios" que, al pulsarlo, descarga y lista los cambios de tipo y de potencia de la luminaria. */
function crearSeccionHistorial(cargarHistorial: () => Promise<CambioLuminaria[]>) {
  // Contenedor, botón para cargar el historial y lista donde se muestran los cambios.
  const seccion = document.createElement("div");
  seccion.className = "mt-2.5 border-t border-slate-200 pt-2";

  const boton = document.createElement("button");
  boton.type = "button";
  boton.textContent = "Ver historial de cambios";
  boton.className = "text-xs font-semibold text-brand-600 hover:underline";

  const lista = document.createElement("div");
  lista.className = "mt-1.5 max-h-32 space-y-1 overflow-y-auto text-xs";

  // Al pulsar: descarga el historial y pinta un elemento por cada cambio.
  boton.onclick = async () => {
    boton.disabled = true;
    lista.textContent = "Cargando…";
    try {
      const cambios = await cargarHistorial();
      lista.textContent = "";
      if (cambios.length === 0) {
        lista.textContent = "Sin cambios de tipo ni de potencia registrados.";
        return;
      }
      cambios.forEach((cambio) => {
        // Cada cambio: una línea principal (campo y valores) y un detalle (fecha y autor).
        const item = document.createElement("div");

        const linea = document.createElement("div");
        linea.textContent = `${ETIQUETA_CAMPO[cambio.campo]}: ${cambio.anterior || "N/D"} → ${
          cambio.nuevo || "N/D"
        }`;
        linea.className = "font-semibold";

        const detalle = document.createElement("div");
        detalle.className = "text-slate-500";
        detalle.textContent = [formatearFecha(cambio.cambiado_en), cambio.cambiado_por_email]
          .filter(Boolean)
          .join(" · ");

        item.appendChild(linea);
        item.appendChild(detalle);
        lista.appendChild(item);
      });
    } catch {
      lista.textContent = navigator.onLine
        ? "No se pudo cargar el historial."
        : "El historial no está disponible sin conexión.";
    } finally {
      boton.disabled = false;
    }
  };

  seccion.appendChild(boton);
  seccion.appendChild(lista);
  return seccion;
}

/** Construye el popup de una luminaria existente: datos, campos editables e historial. */
export function buildPopupContent(row: Luminaria, config: MapaConfig, handlers: PopupHandlers) {
  const { onGuardarEdicion, onGuardarTasada, onGuardarServicio, onGuardarPotencia, cargarHistorial } =
    handlers;

  // Contenedor y título.
  const wrapper = document.createElement("div");
  wrapper.className = "min-w-[170px] text-sm";

  const titulo = document.createElement("strong");
  titulo.className = "mb-1 block";
  titulo.textContent = config.popupTitulo(row);
  wrapper.appendChild(titulo);

  // Datos de solo lectura definidos por el modo.
  config.popupCampos(row).forEach(({ label, value }) => {
    const p = document.createElement("div");
    p.innerHTML = `<b>${label}:</b> ${value}`;
    wrapper.appendChild(p);
  });

  // Potencia: campo de texto con su botón Guardar.
  if (onGuardarPotencia) {
    const potenciaFila = document.createElement("div");
    potenciaFila.className = "mt-1.5 flex items-center gap-1.5";

    const texto = document.createElement("b");
    texto.textContent = "Potencia:";

    const potenciaInput = document.createElement("input");
    potenciaInput.type = "text";
    potenciaInput.value = row.potencia ?? "";
    potenciaInput.placeholder = "N/D";
    potenciaInput.setAttribute("aria-label", "Potencia");
    potenciaInput.className = `min-w-0 flex-1 ${CLASE_SELECT}`;

    const potenciaBtn = document.createElement("button");
    potenciaBtn.type = "button";
    potenciaBtn.textContent = "Guardar";
    potenciaBtn.className =
      "rounded bg-brand-600 px-2 py-1 text-xs font-semibold text-white hover:bg-brand-500 disabled:opacity-50";
    potenciaBtn.disabled = true;

    // El botón solo se activa cuando hay un valor nuevo y no vacío.
    const valorNuevo = () => potenciaInput.value.trim();
    const hayCambio = () => valorNuevo() !== "" && valorNuevo() !== (row.potencia ?? "").trim();
    const guardar = () => {
      if (hayCambio()) onGuardarPotencia(valorNuevo());
    };
    potenciaInput.oninput = () => {
      potenciaBtn.disabled = !hayCambio();
    };
    potenciaInput.onkeydown = (e) => {
      if (e.key === "Enter") guardar();
    };
    potenciaBtn.onclick = guardar;

    potenciaFila.appendChild(texto);
    potenciaFila.appendChild(potenciaInput);
    potenciaFila.appendChild(potenciaBtn);
    wrapper.appendChild(potenciaFila);
  }

  // Servicio (solo en el censo): selector que guarda al cambiar.
  if (config.editableServicio) {
    const servicioLabel = document.createElement("label");
    servicioLabel.className = "mt-1.5 flex items-center gap-1.5";

    const texto = document.createElement("b");
    texto.textContent = "Servicio:";

    const servicioSelect = document.createElement("select");
    servicioSelect.className = `flex-1 ${CLASE_SELECT}`;
    [{ value: "", label: "Sin clasificar" }, ...SERVICIOS].forEach(({ value, label }) => {
      const optionEl = document.createElement("option");
      optionEl.value = value;
      optionEl.textContent = label;
      if (value === (row.servicio ?? "")) optionEl.selected = true;
      servicioSelect.appendChild(optionEl);
    });
    servicioSelect.onchange = () =>
      onGuardarServicio?.((servicioSelect.value || null) as Servicio | null);

    servicioLabel.appendChild(texto);
    servicioLabel.appendChild(servicioSelect);
    wrapper.appendChild(servicioLabel);
  }

  // Tasada (solo en el censo): casilla que guarda al cambiar.
  if (config.editableTasada) {
    const tasadaLabel = document.createElement("label");
    tasadaLabel.className = "mt-1.5 flex items-center gap-1.5";

    const tasadaCheckbox = document.createElement("input");
    tasadaCheckbox.type = "checkbox";
    tasadaCheckbox.checked = row.tasada;
    tasadaCheckbox.onchange = () => onGuardarTasada?.(tasadaCheckbox.checked);

    tasadaLabel.appendChild(tasadaCheckbox);
    tasadaLabel.appendChild(document.createTextNode("Tasada"));
    wrapper.appendChild(tasadaLabel);
  }

  // Campo principal del modo (tipo o estado): selector con botón Guardar.
  const form = document.createElement("div");
  form.className = "mt-2.5 flex items-center gap-1.5";

  const select = document.createElement("select");
  select.className = `flex-1 ${CLASE_SELECT}`;
  config.editableOpciones.forEach((opt) => {
    const optionEl = document.createElement("option");
    optionEl.value = opt;
    optionEl.textContent = opt;
    if (opt === (row[config.editableField] || "").toString().toLowerCase().trim()) {
      optionEl.selected = true;
    }
    select.appendChild(optionEl);
  });

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.textContent = "Guardar";
  saveBtn.className =
    "rounded bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-500";
  saveBtn.onclick = () => onGuardarEdicion(select.value);

  form.appendChild(select);
  form.appendChild(saveBtn);
  wrapper.appendChild(form);

  // Las luminarias añadidas sin conexión aún no existen en la base (id temporal negativo).
  if (cargarHistorial && row.id > 0) {
    wrapper.appendChild(crearSeccionHistorial(cargarHistorial));
  }

  return wrapper;
}

/** Construye el formulario del popup para añadir una luminaria nueva. */
export function buildAddFormContent(
  config: MapaConfig,
  onGuardar: (valores: { campo: string; potencia: string; servicio: Servicio }) => void
) {
  // Contenedor y título.
  const wrapper = document.createElement("div");
  wrapper.className = "min-w-[170px] text-sm";

  const titulo = document.createElement("h4");
  titulo.className = "mb-2.5 text-sm font-semibold";
  titulo.textContent = "Nueva Luminaria";
  wrapper.appendChild(titulo);

  // Campo principal del modo (tipo o estado).
  const campoLabel = document.createElement("label");
  campoLabel.className = "mb-1 block text-xs";
  campoLabel.textContent = `${config.addForm.fieldLabel}:`;
  wrapper.appendChild(campoLabel);

  const select = document.createElement("select");
  select.className = `mb-2.5 w-full ${CLASE_SELECT}`;
  config.addForm.opciones.forEach(({ value, label }) => {
    const optionEl = document.createElement("option");
    optionEl.value = value;
    optionEl.textContent = label;
    select.appendChild(optionEl);
  });
  wrapper.appendChild(select);

  // Servicio: obligatorio, nuevo o antiguo.
  const servicioLabel = document.createElement("label");
  servicioLabel.className = "mb-1 block text-xs";
  servicioLabel.textContent = "Servicio:";
  wrapper.appendChild(servicioLabel);

  const servicioSelect = document.createElement("select");
  servicioSelect.className = `mb-2.5 w-full ${CLASE_SELECT}`;
  [{ value: "", label: "Seleccionar…" }, ...SERVICIOS].forEach(({ value, label }) => {
    const optionEl = document.createElement("option");
    optionEl.value = value;
    optionEl.textContent = label;
    servicioSelect.appendChild(optionEl);
  });
  wrapper.appendChild(servicioSelect);

  // Potencia: obligatoria.
  const potenciaLabel = document.createElement("label");
  potenciaLabel.className = "mb-1 block text-xs";
  potenciaLabel.textContent = "Potencia (ej: 100W):";
  wrapper.appendChild(potenciaLabel);

  const potenciaInput = document.createElement("input");
  potenciaInput.type = "text";
  potenciaInput.placeholder = "100W";
  potenciaInput.className = "mb-3 w-full rounded border border-slate-300 px-1.5 py-1 text-xs";
  wrapper.appendChild(potenciaInput);

  // Mensaje de validación, oculto hasta que falte algún dato.
  const errorMsg = document.createElement("p");
  errorMsg.className = "mb-2 hidden text-xs text-red-600";
  wrapper.appendChild(errorMsg);

  // Botón Guardar: valida los campos obligatorios y entrega los valores.
  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.textContent = "Guardar";
  saveBtn.className =
    "w-full rounded bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-500";
  saveBtn.onclick = () => {
    const faltantes: string[] = [];
    if (!servicioSelect.value) faltantes.push("si el servicio es nuevo o antiguo");
    if (!potenciaInput.value.trim()) faltantes.push("la potencia");
    if (faltantes.length > 0) {
      errorMsg.textContent = `Por favor indica ${faltantes.join(" y ")}.`;
      errorMsg.classList.remove("hidden");
      return;
    }
    onGuardar({
      campo: select.value,
      potencia: potenciaInput.value.trim(),
      servicio: servicioSelect.value as Servicio,
    });
  };
  wrapper.appendChild(saveBtn);

  return wrapper;
}
