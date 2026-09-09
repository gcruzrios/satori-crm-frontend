# CRM Clínica Satori — Frontend

Aplicación web (SPA) para administrar Leads, Contactos, Empresas, Servicios,
Pipeline, Oportunidades, Cotizaciones, Facturas, Actividades, Comunicaciones,
Notificaciones y Usuarios.

Implementa `SATORI_CRM_Especificacion_Final_Frontend.md` (v2.0). El estilo visual
está portado de la plantilla **TailAdmin** incluida en `html/` (fuente *Outfit*,
color de marca `#465fff`, tarjetas `rounded-2xl`, modo oscuro por clase).

## Stack

| Área | Tecnología |
|---|---|
| Framework | React 19 + Vite 6 |
| Estilos | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Componentes | Radix UI (primitivas headless, estilo shadcn) |
| Estado servidor | TanStack Query v5 |
| Routing | React Router v7 (data router) |
| Formularios | React Hook Form + Zod |
| Drag & Drop | `@dnd-kit` |
| Gráficos | Recharts |
| Tiempo real | WebSocket nativo (`useWebSocket`) |
| HTTP | Axios (interceptor centralizado en `src/lib/api.js`) |
| Toasts | Sonner · Iconos: lucide-react |

## Puesta en marcha

```bash
npm install
cp .env.example .env      # ajusta si tu API no está en 127.0.0.1:8000
npm run dev               # http://localhost:5173
```

El dev-server hace **proxy** de `/api` → `VITE_PROXY_TARGET` (por defecto
`http://127.0.0.1:8000`), de modo que el frontend y la API quedan en el mismo
origen y la cookie `httpOnly` de refresh funciona sin configurar CORS.

Scripts:

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción a `dist/` |
| `npm run preview` | Sirve el build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest + RTL) |
| `npm run e2e` | End-to-end (Playwright) — requiere API y credenciales |

### Variables de entorno

```env
VITE_API_URL=/api/v1                     # base REST (relativa → usa el proxy)
VITE_WS_URL=ws://127.0.0.1:8000/ws       # endpoint WebSocket
VITE_PROXY_TARGET=http://127.0.0.1:8000  # sólo para el proxy de dev
VITE_IDLE_TIMEOUT_MIN=25                 # auto-logout por inactividad
VITE_IDLE_WARNING_MIN=24                 # aviso previo
```

Nunca se guardan secretos en variables `VITE_*` (son públicas en el bundle).

## Arquitectura

```
src/
├── app/          App.jsx · providers.jsx · router.jsx
├── layouts/      AuthLayout · DashboardLayout
├── lib/          api.js · auth.jsx · authBridge.js · permissions.js
│                 currency.js · utils.js · queryClient.js · constants.js · nav.js
├── hooks/        useIdleTimer · useWebSocket · useUnsavedChangesGuard
│                 useDebounce · useMediaQuery · useTheme · useListParams
├── components/
│   ├── ui/       Button, Input, Select, Dialog, Drawer, DropdownMenu, Tabs,
│   │             Tooltip, Badge, Avatar, Card, Pagination, Toast, ConfirmProvider,
│   │             Empty/Error/Loading states…
│   ├── forms/    Field · fields.jsx (controles RHF) · UnsavedChangesPrompt
│   ├── tables/   DataTable (tabla→tarjetas < 768px) · ListToolbar
│   ├── kanban/   KanbanBoard · KanbanColumn · KanbanCard  (@dnd-kit)
│   ├── charts/   Charts.jsx (Recharts) · chartTheme.js
│   ├── detail/   SectionCard · DescriptionList · MiniList · EntityQuickActions
│   ├── layout/   Sidebar · Header · GlobalSearch · NotificationsMenu · IdleGuard …
│   ├── PageHeader.jsx · Timeline.jsx
└── features/     auth, dashboard, leads, contacts, companies, services,
                  pipeline, opportunities, quotes, invoices, activities,
                  communications, notifications, search, users
                  (cada feature: api.js · hooks.js · schema.js · *Page.jsx)
```

Piezas compartidas: `features/shared/crud.js` (cliente REST por recurso),
`features/shared/hooks.js` (`createCrudHooks` → list/item/create/update/remove/
action con toasts + invalidación) y `features/shared/EntityFormLayout.jsx`.

## Seguridad de sesión (spec §2)

- **Access token** JWT: sólo en memoria (estado de `AuthContext`). Nunca en
  `localStorage`/`sessionStorage`. Se pierde al recargar — es intencional.
- **Refresh token**: cookie `httpOnly + Secure + SameSite=Strict` gestionada por
  el backend. JavaScript nunca la toca.
- `src/lib/api.js` centraliza todas las llamadas. Ante un **401** intenta
  `POST /auth/refresh` una vez y reintenta la petición original; si el refresh
  falla → `logout()` + redirección a `/login?redirect=<ruta>`.
- **Auto-logout por inactividad**: `useIdleTimer` cierra sesión a los 25 min con
  aviso al minuto 24 (`IdleGuard`).
- Permisos: `useAuth().can('quotes:send')` controla visibilidad de botones/rutas;
  la autorización real siempre se revalida en el backend.

## Diferencias entre la spec y la API en ejecución

La spec v2.0 asume endpoints que la API `Satori CRM API 2.0.0` todavía no expone.
El frontend está construido según la spec y **degrada con elegancia**:

| Spec asume | API 2.0.0 | Comportamiento del frontend |
|---|---|---|
| `POST /auth/refresh`, `GET /auth/me`, `/auth/logout` | sólo `POST /auth/login` (devuelve `{access_token, user}`) | El usuario se toma de la respuesta de login. El bootstrap intenta `refresh` y, si no existe, muestra el login. El interceptor conserva la ruta de refresh para cuando el backend la añada. |
| `capabilities: string[]` en `/auth/me` | no disponible | `can()` deriva las capacidades de `user.role` con el mapa de la spec §28 (`src/lib/permissions.js`). |
| `GET /dashboard/*` | no existe | Métricas y series se calculan en cliente desde los listados (`features/dashboard/useDashboard.js`). |
| `GET /timeline?entity=…` | no existe | `<Timeline/>` fusiona actividades + comunicaciones + cotizaciones + facturas en cliente (revisión §4.3). |
| PDF de cotización/factura | no existe | Botón "PDF" abre `${API_URL}/quotes/{id}/pdf` (spec §10); si el backend responde 404 el navegador lo muestra. |
| `quotes/{id}/reject`, `invoices/{id}/pay|cancel|issue` | no existen | Se llaman igual (spec §15); si el backend no las soporta, se muestra un toast de error legible. |
| filtros `q`, `status`, … en varios listados | sólo `page`/`page_size` (leads tiene algunos) | Se envían igual y además se filtra en cliente la página recibida (`features/shared/filterRows.js`). |

Cuando el backend implemente estos endpoints, la app los usará sin cambios de UI.

## Definition of Done por pantalla (spec §21)

- [x] Responsive en los 3 breakpoints; tablas → tarjetas a `< 768px` (`DataTable`).
- [x] Navegable por teclado (Radix: focus trap en modales, `aria-*`).
- [x] Estados loading / error / empty en todas las vistas de datos.
- [x] Montos siempre con `formatMoney()` (`src/lib/currency.js`).
- [x] Guard de cambios sin guardar en formularios (`useUnsavedChangesGuard`).
- [x] `ConfirmDialog` en acciones destructivas (spec §15): eliminar entidades,
      cancelar factura, rechazar cotización, marcar factura pagada, convertir lead.

## Tests

- **Unitarios** (`npm test`): `useIdleTimer`, helpers de moneda y totales de
  documentos. Base para ampliar a formularios y `useUnsavedChangesGuard`.
- **E2E** (`npm run e2e`): `e2e/smoke.spec.js` cubre login → dashboard. Requiere
  la API en marcha y credenciales en `E2E_EMAIL` / `E2E_PASSWORD`. Los flujos de
  la spec §18 (convertir lead, cotización→factura, mover en Kanban con rollback)
  están esbozados como `test.skip` a la espera de datos semilla en la API.
