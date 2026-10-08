import { useEffect, useState } from "react";

/** Refleja `navigator.onLine`, actualizándose con los eventos "online"/"offline" del navegador. */
export function useOnlineStatus() {
  const [enLinea, setEnLinea] = useState(() => navigator.onLine);

  // Se suscribe a los eventos de conexión del navegador y se desuscribe al desmontar.
  useEffect(() => {
    function marcarEnLinea() {
      setEnLinea(true);
    }
    function marcarSinConexion() {
      setEnLinea(false);
    }

    window.addEventListener("online", marcarEnLinea);
    window.addEventListener("offline", marcarSinConexion);
    return () => {
      window.removeEventListener("online", marcarEnLinea);
      window.removeEventListener("offline", marcarSinConexion);
    };
  }, []);

  return enLinea;
}
