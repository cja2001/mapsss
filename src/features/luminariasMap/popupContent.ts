import type { Luminaria } from "../../lib/types";
import type { MapaConfig } from "./colorConfig";

export function buildPopupContent(
  row: Luminaria,
  config: MapaConfig,
  onGuardarEdicion: (nuevoValor: string) => void,
  onGuardarTasada?: (nuevoValor: boolean) => void
) {
  const wrapper = document.createElement("div");
  wrapper.className = "min-w-[170px] text-sm";

  const titulo = document.createElement("strong");
  titulo.className = "mb-1 block";
  titulo.textContent = config.popupTitulo(row);
  wrapper.appendChild(titulo);

  config.popupCampos(row).forEach(({ label, value }) => {
    const p = document.createElement("div");
    p.innerHTML = `<b>${label}:</b> ${value}`;
    wrapper.appendChild(p);
  });

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

  const form = document.createElement("div");
  form.className = "mt-2.5 flex items-center gap-1.5";

  const select = document.createElement("select");
  select.className = "flex-1 rounded border border-slate-300 px-1.5 py-1 text-xs";
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

  return wrapper;
}

export function buildAddFormContent(
  config: MapaConfig,
  onGuardar: (valores: { campo: string; potencia: string }) => void
) {
  const wrapper = document.createElement("div");
  wrapper.className = "min-w-[170px] text-sm";

  const titulo = document.createElement("h4");
  titulo.className = "mb-2.5 text-sm font-semibold";
  titulo.textContent = "Nueva Luminaria";
  wrapper.appendChild(titulo);

  const campoLabel = document.createElement("label");
  campoLabel.className = "mb-1 block text-xs";
  campoLabel.textContent = `${config.addForm.fieldLabel}:`;
  wrapper.appendChild(campoLabel);

  const select = document.createElement("select");
  select.className = "mb-2.5 w-full rounded border border-slate-300 px-1.5 py-1 text-xs";
  config.addForm.opciones.forEach(({ value, label }) => {
    const optionEl = document.createElement("option");
    optionEl.value = value;
    optionEl.textContent = label;
    select.appendChild(optionEl);
  });
  wrapper.appendChild(select);

  const potenciaLabel = document.createElement("label");
  potenciaLabel.className = "mb-1 block text-xs";
  potenciaLabel.textContent = "Potencia (ej: 100W):";
  wrapper.appendChild(potenciaLabel);

  const potenciaInput = document.createElement("input");
  potenciaInput.type = "text";
  potenciaInput.placeholder = "100W";
  potenciaInput.className = "mb-3 w-full rounded border border-slate-300 px-1.5 py-1 text-xs";
  wrapper.appendChild(potenciaInput);

  const errorMsg = document.createElement("p");
  errorMsg.className = "mb-2 hidden text-xs text-red-600";
  errorMsg.textContent = "Por favor ingresa la potencia.";
  wrapper.appendChild(errorMsg);

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.textContent = "Guardar";
  saveBtn.className =
    "w-full rounded bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-500";
  saveBtn.onclick = () => {
    if (!potenciaInput.value.trim()) {
      errorMsg.classList.remove("hidden");
      return;
    }
    onGuardar({ campo: select.value, potencia: potenciaInput.value.trim() });
  };
  wrapper.appendChild(saveBtn);

  return wrapper;
}
