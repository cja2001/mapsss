import { useEffect, useState } from "react";

/** Evento no estandarizado en TS pero soportado por Chrome/Edge/Android. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function corriendoInstalada() {
  const enStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const enIosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return enStandalone || enIosStandalone;
}

/**
 * Expone el prompt nativo de instalación de PWA (Chrome/Edge/Android) cuando
 * el navegador lo ofrece, y si la app ya corre instalada (modo standalone).
 */
export function useInstallPrompt() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalada, setInstalada] = useState(corriendoInstalada);

  useEffect(() => {
    function alDisponible(e: Event) {
      e.preventDefault();
      setEvento(e as BeforeInstallPromptEvent);
    }
    function alInstalar() {
      setInstalada(true);
      setEvento(null);
    }

    window.addEventListener("beforeinstallprompt", alDisponible);
    window.addEventListener("appinstalled", alInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", alDisponible);
      window.removeEventListener("appinstalled", alInstalar);
    };
  }, []);

  async function instalar() {
    if (!evento) return false;
    await evento.prompt();
    const { outcome } = await evento.userChoice;
    setEvento(null);
    return outcome === "accepted";
  }

  return { disponible: !!evento, instalada, instalar };
}
