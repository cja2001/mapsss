// Configuración de Vite: plugins de React y Tailwind, y la PWA (manifest y caché sin conexión).
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    // PWA: genera el service worker y el manifest para poder instalar la app y usarla sin conexión.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icons/luminarias.png', 'icons/bulbo.png', 'icons/logo.png'],
      // Datos de la app instalada: nombre, colores e íconos.
      manifest: {
        name: 'MAPSSS Luminarias',
        short_name: 'Luminarias',
        description: 'Censo y reporte de luminarias de San Marcos',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1d4ed8',
        icons: [
          { src: '/icons/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // Service worker (Workbox): qué archivos se guardan y con qué estrategia.
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        // Reglas de caché para las peticiones hechas mientras se usa la app.
        runtimeCaching: [
          {
            // Tiles del mapa base (Google, mapa normal y satelital): se cachean
            // al verlas, así las zonas ya visitadas se siguen viendo sin señal.
            urlPattern: ({ url }) => /^mt[0-3]\.google\.com$/.test(url.hostname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'mapa-tiles-google',
              expiration: { maxEntries: 3000, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Colonias, distritos y parcelario: se cachean la primera vez que se
            // piden (el parcelario solo se pide si el usuario activa esa capa).
            urlPattern: ({ url }) => url.pathname.endsWith('.geojson'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'mapa-geojson',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Lecturas a Supabase: se intenta la red primero, y si no hay
            // respuesta en 5s se usa la última copia guardada.
            urlPattern: ({ url }) =>
              url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/rest/v1/'),
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'supabase-datos',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Hojas de estilo de Google Fonts: se sirve la copia guardada y se actualiza en segundo plano.
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            // Archivos de fuentes: casi nunca cambian, se guardan por un año.
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
