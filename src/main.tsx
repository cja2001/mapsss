// Punto de entrada de la app: carga los estilos globales y monta el componente raíz.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Monta <App /> en el <div id="root"> de index.html. StrictMode activa avisos extra en desarrollo.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
