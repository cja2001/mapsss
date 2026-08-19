import { useEffect, useState } from "react";

/** Refleja `navigator.onLine`, actualizándose con los eventos "online"/"offline" del navegador. */
export function useOnlineStatus() {
  const [enLinea, setEnLinea] = useState(() => navigator.onLine);

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
