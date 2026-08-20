import type { CapaExtraConfig } from "./colorConfig";

/**
 * Popup de un feature de una capa extra (ej. Calles): muestra los campos de
 * solo lectura y, si la capa declara `camposEditables`, un <select> por cada
 * uno con un botón "Guardar" que llama a `onGuardar` con los valores nuevos.
 */
export function buildCapaPopupContent(
  props: GeoJSON.GeoJsonProperties,
  capa: CapaExtraConfig,
  onGuardar: (cambios: Record<string, string>) => Promise<void>
) {
  const wrapper = document.createElement("div");
  wrapper.className = "min-w-[190px] text-sm";

  const propKeysEditables = new Set((capa.camposEditables ?? []).map((c) => c.propKey));

  (capa.popupFields ?? [])
    .filter(({ propKey }) => !propKeysEditables.has(propKey))
    .forEach(({ label, propKey }) => {
      const p = document.createElement("div");
      p.innerHTML = `<b>${label}:</b> ${props?.[propKey] ?? "N/D"}`;
      wrapper.appendChild(p);
    });

  const selects: Record<string, HTMLSelectElement> = {};

  (capa.camposEditables ?? []).forEach(({ propKey, label, opciones }) => {
    const campoLabel = document.createElement("label");
    campoLabel.className = "mb-1 mt-2 block text-xs font-medium text-slate-600";
    campoLabel.textContent = `${label}:`;
    wrapper.appendChild(campoLabel);

    const select = document.createElement("select");
    select.className = "w-full rounded border border-slate-300 px-1.5 py-1 text-xs";

    const valorActual = (props?.[propKey] ?? "").toString().trim().toUpperCase();
    let coincide = false;
    opciones.forEach((opt) => {
      const optionEl = document.createElement("option");
      optionEl.value = opt;
      optionEl.textContent = opt;
      if (opt === valorActual) {
        optionEl.selected = true;
        coincide = true;
      }
      select.appendChild(optionEl);
    });

    if (!coincide && valorActual) {
      const optionEl = document.createElement("option");
      optionEl.value = valorActual;
      optionEl.textContent = `${valorActual} (actual)`;
      optionEl.selected = true;
      select.insertBefore(optionEl, select.firstChild);
    }

    selects[propKey] = select;
    wrapper.appendChild(select);
  });

  const errorMsg = document.createElement("p");
  errorMsg.className = "mt-1.5 hidden text-xs text-red-600";
  wrapper.appendChild(errorMsg);

  if (capa.camposEditables?.length) {
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.textContent = "Guardar";
    saveBtn.className =
      "mt-2 w-full rounded bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-500 disabled:opacity-60";
    saveBtn.onclick = async () => {
      const cambios: Record<string, string> = {};
      for (const key in selects) cambios[key] = selects[key].value;

      saveBtn.disabled = true;
      saveBtn.textContent = "Guardando…";
      errorMsg.classList.add("hidden");

      try {
        await onGuardar(cambios);
        saveBtn.disabled = false;
        saveBtn.textContent = "Guardado ✓";
      } catch (err) {
        errorMsg.textContent = err instanceof Error ? err.message : "Error al guardar.";
        errorMsg.classList.remove("hidden");
        saveBtn.disabled = false;
        saveBtn.textContent = "Guardar";
      }
    };
    wrapper.appendChild(saveBtn);
  }

  return wrapper;
}
