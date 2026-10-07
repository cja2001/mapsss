# Grafo del proyecto MAPSSS Luminarias

Mapa de navegación del código. Las flechas significan "depende de" o "llama a".
Generado a partir de los imports reales y de los accesos a datos del código.
Actualizar cuando se agregue un módulo, una ruta, una tabla o una capa del mapa.

## 1. Vista general

```mermaid
flowchart LR
  subgraph Cliente["Navegador (PWA React + Vite)"]
    UI["Páginas y componentes<br/>src/features, src/components"]
    AUTH["Sesión y roles<br/>src/auth"]
    LIB["Cliente y utilidades<br/>src/lib"]
    SW["Service worker Workbox<br/>vite.config.ts"]
    LS[("localStorage<br/>perfil, cola offline, banner")]
  end

  subgraph Estaticos["Archivos estáticos public/"]
    GJ["GeoJSON: distritos, colonias,<br/>parcelario, calles"]
  end

  subgraph Supabase
    SAUTH["Auth"]
    DB[("Postgres + PostGIS<br/>usuarios, roles, luminarias,<br/>luminarias_historial_tipo,<br/>luminarias_historial_estado,<br/>vias_san_marcos")]
    RPC["RPC vias_san_marcos_geojson"]
    EDGE["Edge Function create-user"]
  end

  TILES["Tiles de Google<br/>mt0-3.google.com"]

  UI --> AUTH --> LIB
  UI --> LIB
  LIB --> SAUTH
  LIB --> DB
  LIB --> RPC --> DB
  UI -- "fetch con JWT" --> EDGE --> DB
  EDGE --> SAUTH
  UI --> GJ
  UI --> TILES
  LIB --> LS
  AUTH --> LS
  SW -. "cachea" .-> GJ
  SW -. "cachea" .-> TILES
  SW -. "cachea GET /rest/v1" .-> DB
```

## 2. Rutas y control de acceso

Definidas en `src/App.tsx`. Todo cuelga de `BrowserRouter` y `AuthProvider`.

```mermaid
flowchart TD
  main["src/main.tsx"] --> App["src/App.tsx"]
  App --> AuthProvider["AuthProvider<br/>auth/AuthContext.tsx"]
  App --> Banner["InstallAppBanner"]
  App --> R0["/ y * : LoginPage"]
  App --> PR["ProtectedRoute<br/>auth/ProtectedRoute.tsx"]
  PR --> R1["/menu : MenuPage<br/>admin, editor_luminarias"]
  PR --> R2["/luminarias/censo : CensoPage<br/>admin, editor_luminarias"]
  PR --> R3["/luminarias/reporte : ReportePage<br/>admin, editor_luminarias"]
  PR --> R4["/admin/usuarios : AdminUsuariosPage<br/>solo admin"]
  R1 -- "MODULOS en menu/moduleConfig.tsx" --> R2
  R1 --> R3
  R1 --> R4
  R2 -- "mode=censo" --> LM["LuminariasMap"]
  R3 -- "mode=reporte" --> LM
```

Los roles viven en `ROLES` dentro de `src/lib/types.ts`.
Una ruta nueva exige tres cambios: `App.tsx`, `moduleConfig.tsx` y, si aplica, un rol nuevo en `types.ts`.

## 3. Dependencias entre módulos

```mermaid
flowchart TD
  subgraph features
    subgraph login
      LoginPage --> useLogin
    end
    subgraph menu
      MenuPage --> moduleConfig
    end
    subgraph adminUsuarios
      AdminUsuariosPage --> useUsuarios
      AdminUsuariosPage --> CreateUserForm --> useCreateUserFn
      AdminUsuariosPage --> UsersTable --> useCreateUserFn
    end
    subgraph luminariasMap
      CensoPage --> LuminariasMap
      ReportePage --> LuminariasMap
      LuminariasMap --> colorConfig
      LuminariasMap --> useLuminarias
      LuminariasMap --> paneles["DashboardPanel, ReporteDashboard,<br/>LeyendaPanel"]
      LuminariasMap --> controles["MapTopBar, MapToolsMenu,<br/>MapLegendButton"]
      LuminariasMap --> districtsLayer
      LuminariasMap --> extraLayers
      LuminariasMap --> popupContent
      LuminariasMap --> historialTipo
      LuminariasMap --> measureTool
      LuminariasMap --> useColoniasBuscador
      controles --> useColoniasBuscador
      paneles --> colorConfig
      paneles --> useConteosPorCapa --> colorConfig
      extraLayers --> colorConfig
      extraLayers --> capaPopup --> colorConfig
      extraLayers --> polygonLabelPoint
      districtsLayer --> polygonLabelPoint
      popupContent --> colorConfig
    end
  end

  subgraph auth
    useAuth --> AuthContext
    ProtectedRoute --> useAuth
  end

  subgraph lib
    supabaseClient
    offlineQueue --> supabaseClient
    types
    useOnlineStatus
    useInstallPrompt
    deviceType
  end

  LoginPage --> useAuth
  MenuPage --> useAuth
  AuthContext --> supabaseClient
  useLogin --> supabaseClient
  useUsuarios --> supabaseClient
  useCreateUserFn --> supabaseClient
  historialTipo --> supabaseClient
  useLuminarias --> supabaseClient
  useLuminarias --> offlineQueue
  colorConfig --> supabaseClient
  colorConfig --> offlineQueue
  paneles --> useOnlineStatus
  paneles --> useReparacionesPorMes --> supabaseClient
```

`colorConfig.ts` es el nodo central del mapa. Contiene los tipos `MapaConfig` y `CapaExtraConfig`, las configuraciones de censo y reporte, y la definición de cada capa extra.

## 4. Flujo de datos

| Dato | Origen | Quién lo lee | Quién lo escribe |
|---|---|---|---|
| Sesión | Supabase Auth | `auth/AuthContext.tsx`, `login/useLogin.ts` | `login/useLogin.ts` |
| `usuarios` | Postgres | `AuthContext`, `useLogin`, `useUsuarios`, Edge Function | `useUsuarios`, Edge Function |
| `roles` | Postgres | `useLogin`, `useUsuarios` | nadie desde la app |
| `luminarias` | Postgres | `luminariasMap/useLuminarias.ts`, paginado de 1000 | `useLuminarias`, `lib/offlineQueue.ts` |
| `luminarias_historial_tipo` | Postgres, la llena un trigger al cambiar `luminarias.tipo` | `luminariasMap/historialTipo.ts`, botón del popup | solo el trigger `luminarias_registrar_cambio_tipo` |
| `luminarias_historial_estado` | Postgres, la llena un trigger al cambiar `luminarias.estado` | `luminariasMap/useReparacionesPorMes.ts`, dashboard del reporte | solo el trigger `luminarias_registrar_cambio_estado` |
| `vias_san_marcos` | Postgres con PostGIS, vía RPC `vias_san_marcos_geojson` | `colorConfig.ts`, capa Calles | `colorConfig.ts`, `offlineQueue.ts` |
| Distritos | `public/distritos-sss.geojson` | `districtsLayer.ts`, `LeyendaPanel.tsx` | solo lectura |
| Colonias | `public/colonias-san-marcos.geojson` | `colorConfig.ts`, `useColoniasBuscador.ts` | solo lectura |
| Parcelario | `public/parcelario-san-marcos.geojson`, 10 MB, carga diferida | `colorConfig.ts` | solo lectura |
| Alta y baja de usuarios | Edge Function `create-user`, POST y DELETE | `adminUsuarios/useCreateUserFn.ts` | la función usa `service_role` |

El archivo `public/calles-san-marcos.geojson` sigue en el repo, pero la capa Calles ya lee de la tabla `vias_san_marcos`.

### Escritura sin conexión

```mermaid
flowchart LR
  E["Edición en popup<br/>luminaria o calle"] --> O{"¿hay red?"}
  O -- sí --> S["supabase update / insert"]
  S -- "falla de red" --> Q
  O -- no --> Q["encolarMutacion<br/>localStorage: luminarias_cola_offline"]
  Q --> OPT["Actualización optimista en pantalla"]
  EV["evento online o montaje del mapa"] --> SYNC["sincronizarCola"]
  Q --> SYNC --> S2["Reenvío en orden a Supabase"] --> RL["reload de luminarias"]
```

Tipos de mutación en cola: `update`, `insert` y `viaUpdate`.
Un error real de Supabase descarta la mutación. Un error de red detiene la sincronización y conserva la cola.

## 5. Modos del mapa

| | Censo | Reporte |
|---|---|---|
| Ruta | `/luminarias/censo` | `/luminarias/reporte` |
| Campo editable | `tipo`, más casilla `tasada` | `estado` |
| Columnas pedidas | id, lat, lng, tipo, potencia, tasada, servicio | además estado y distrito |
| Servicio nuevo o antiguo | editable en el popup y obligatorio al añadir | visible en el popup y obligatorio al añadir |

| Dashboard | `DashboardPanel.tsx`: tasadas, tipos y calles | `ReporteDashboard.tsx`: por reparar, reparadas por mes y estados |

Ambos modos comparten `LuminariasMap.tsx`, la barra superior, las herramientas y las capas extra. Toda diferencia entre ellos debe expresarse en `colorConfig.ts`, no con condicionales nuevos en el componente.

## 6. Build y despliegue

```mermaid
flowchart LR
  push["push a main"] --> W1[".github/workflows/deploy-webapp.yml"]
  push --> W2[".github/workflows/deploy.yml"]
  W1 --> B["npm ci, tsc -b, vite build"] --> GH["GitHub Pages (dist/)"]
  W2 --> SF["supabase functions deploy create-user"]
  secrets["Secrets: VITE_SUPABASE_URL,<br/>VITE_SUPABASE_ANON_KEY,<br/>VITE_EDGE_FUNCTION_URL"] --> B
```

Comandos locales: `npm run dev`, `npm run build`, `npm run lint` (oxlint). No hay pruebas automatizadas.

## 7. Dónde tocar según la tarea

| Tarea | Archivos de entrada |
|---|---|
| Nueva capa en el mapa | `luminariasMap/colorConfig.ts`, luego `extraLayers.ts` si requiere comportamiento nuevo |
| Cambiar colores, leyenda o categorías | `luminariasMap/colorConfig.ts` |
| Cambiar el popup de luminaria | `luminariasMap/popupContent.ts` |
| Cambiar el popup de una capa extra | `luminariasMap/capaPopup.ts` |
| Nuevo campo de luminaria | migración en `supabase/migrations/`, `lib/types.ts`, `colorConfig.ts` (columnas), `popupContent.ts`, `useLuminarias.ts` (fila optimista) |
| Cambio de esquema en Supabase | archivo SQL nuevo en `supabase/migrations/`. Se aplica a mano: ningún workflow lo ejecuta |
| Nueva pantalla o módulo | `App.tsx`, `menu/moduleConfig.tsx`, carpeta nueva en `features/` |
| Nuevo rol | `lib/types.ts`, `App.tsx`, `moduleConfig.tsx`, Edge Function |
| Comportamiento offline o caché | `vite.config.ts` (Workbox), `lib/offlineQueue.ts` |
| Gestión de usuarios | `features/adminUsuarios/`, `supabase/functions/create-user/index.ts` |
| Controles y barra del mapa | `MapTopBar.tsx`, `MapToolsMenu.tsx`, `MapLegendButton.tsx`, `leaflet-overrides.css` |
