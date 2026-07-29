# MAPSSS Luminarias

Sistema de censo y reporte de luminarias de San Salvador Sur, con autenticación
y administración de usuarios sobre Supabase.

## Stack

React + TypeScript + Vite, Tailwind CSS v4, React Router, Leaflet (mapas) y
`@supabase/supabase-js`. Sin backend propio: toda la persistencia vive en
Supabase (Auth, Postgres, Edge Functions).

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completa las variables con tus credenciales de Supabase
npm run dev
```

Variables de entorno requeridas (`.env.local`, no se versiona):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_EDGE_FUNCTION_URL` — URL de la Edge Function `create-user`

## Build

```bash
npm run build   # tsc -b && vite build, salida en dist/
```

## Estructura

```
src/
  auth/                  # sesión, rol y guard de rutas
  lib/                   # cliente de Supabase y tipos
  components/             # UI genérica (Button, Card, Alert, ...)
  features/
    login/                 Pantalla de acceso
    menu/                  Menú principal por rol
    luminariasMap/          Mapa compartido (censo y reporte, parametrizado por modo)
    adminUsuarios/          Administración de usuarios (solo admin)
```

## Backend (Supabase)

La Edge Function `supabase/functions/create-user` crea/elimina usuarios con
`service_role`, validando en el servidor que quien llama tenga rol `admin`. Se
despliega automáticamente vía `.github/workflows/deploy.yml` en cada push a
`main`.

## Despliegue del sitio

`.github/workflows/deploy-webapp.yml` construye la app y la publica en GitHub
Pages en cada push a `main`. Requiere:

1. Habilitar GitHub Pages en la configuración del repo con fuente = "GitHub Actions".
2. Definir los secrets del repo `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   y `VITE_EDGE_FUNCTION_URL`.