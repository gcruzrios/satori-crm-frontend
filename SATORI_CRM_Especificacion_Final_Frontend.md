# CRM Clínica Satori — Especificación Final de Frontend (Lista para Desarrollo)

**Versión:** 2.0 (consolida spec original v1.0 + revisión arquitectónica)
**Framework:** React 19 + Vite
**CSS:** Tailwind CSS + shadcn/ui (Radix UI) — `[RESUELTO 2.2]`
**Estado servidor:** TanStack Query
**Routing:** React Router
**Forms:** React Hook Form + Zod
**Drag & Drop:** `@dnd-kit/core` — `[RESUELTO 3.1]`
**Gráficos:** Recharts — `[RESUELTO 3.5]`
**Tiempo real:** WebSocket nativo (`useWebSocket` hook propio) — `[RESUELTO 2.3]`

Este documento reemplaza a `CRM_Clínica_Satori_-_Frontend_-_React.md` v1.0. Depende directamente de las decisiones tomadas en `SATORI_CRM_Especificacion_Final_Backend.md`.

---

## 1. Objetivo

Aplicación web para administrar Leads, Contactos, Empresas, Servicios, Pipeline, Oportunidades, Cotizaciones, Facturas, Actividades, Comunicaciones y Usuarios. Responsive: Desktop / Tablet / Mobile.

---

## 2. Autenticación y almacenamiento de sesión `[RESUELTO 2.1 — CRÍTICO]`

Esta es la decisión de seguridad más importante del frontend y queda fijada así:

- **Access token**: JWT de 15 min, se guarda **solo en memoria** (estado de un `AuthContext` de React). Se pierde al recargar la página — esto es intencional, el interceptor lo recupera automáticamente vía refresh.
- **Refresh token**: nunca lo maneja JavaScript. Vive en una cookie `httpOnly + Secure + SameSite=Strict` que el backend setea en `/auth/login` y renueva en `/auth/refresh`.
- **Nunca usar `localStorage` ni `sessionStorage`** para ningún token.
- Al montar la app (`App.jsx`), intentar `POST /auth/refresh` silenciosamente antes de mostrar la UI: si hay cookie válida, se obtiene un access token nuevo sin pedir login de nuevo.

```
src/lib/auth.js
├── AuthContext { user, accessToken, capabilities, login(), logout() }
└── el accessToken vive en useState, no en storage persistente
```

### Interceptor de API `[RESUELTO frontend 3.8]`

`src/lib/api.js` centraliza todas las llamadas (regla ya correcta en la spec original, sección 22) y añade:

```
Request → adjunta Authorization: Bearer {accessToken en memoria}
Response 401 → intenta POST /auth/refresh UNA vez
   → si funciona: reintenta la request original con el nuevo token
   → si falla: logout() + redirect a /login?redirect={ruta_actual}
```

### Auto-logout por inactividad `[RESUELTO 3.6]`
Timer global (hook `useIdleTimer`) que cierra sesión tras 25 minutos de inactividad, con aviso a los 24 min ("tu sesión expirará en 1 minuto, ¿continuar?"). Justificado por manejar datos personales de una clínica en equipos potencialmente compartidos (recepción).

---

## 3. Contrato de permisos `[RESUELTO frontend 4.6]`

El frontend **no** mantiene su propia matriz rol→permiso. `GET /auth/me` devuelve `capabilities: string[]` (ver spec de backend §5). Un hook simple:

```js
const { can } = useAuth();
can('quotes:send')  // true/false
```

controla visibilidad de botones/rutas. La autorización real siempre se re-valida en el backend (principio ya correcto en la spec original, sección 28) — esto es solo para UX.

---

## 4. Estructura del proyecto

```
frontend/
├── src/
│   ├── app/ (App.jsx, router.jsx, providers.jsx)
│   ├── components/
│   │   ├── ui/          # shadcn/ui: Button, Input, Select, Modal, Drawer,
│   │   │                # Dropdown, Badge, Avatar, Tabs, Toast, ConfirmDialog...
│   │   ├── forms/
│   │   ├── tables/       # incluye responsive table→card behavior
│   │   ├── kanban/        # [NUEVO] wrapper de @dnd-kit
│   │   ├── charts/        # [NUEVO] wrappers de Recharts
│   │   └── layout/
│   ├── features/
│   │   ├── auth/, dashboard/, leads/, contacts/, companies/, services/,
│   │   │   pipeline/, opportunities/, quotes/, invoices/, activities/,
│   │   │   communications/, notifications/  [NUEVO], search/  [NUEVO]
│   ├── hooks/
│   │   ├── useIdleTimer.js        [NUEVO]
│   │   ├── useWebSocket.js        [NUEVO]
│   │   └── useUnsavedChangesGuard.js  [NUEVO]
│   ├── lib/ (api.js, auth.js, utils.js, currency.js [NUEVO])
│   ├── layouts/ (AuthLayout.jsx, DashboardLayout.jsx)
│   ├── pages/
│   ├── types/
│   └── main.jsx
├── public/
├── package.json
└── vite.config.js
```

---

## 5. Navegación y rutas

(Sin cambios respecto a la spec original — la estructura ya era correcta.)

```
/login
/dashboard
/leads, /leads/new, /leads/:id
/contacts, /contacts/new, /contacts/:id
/companies, /companies/new, /companies/:id
/services, /services/new, /services/:id
/pipeline
/opportunities, /opportunities/new, /opportunities/:id
/quotes, /quotes/new, /quotes/:id
/invoices, /invoices/new, /invoices/:id
/activities
/communications, /communications/email, /communications/whatsapp
/settings/users
```

---

## 6. Layout y Responsive `[RESUELTO frontend 4.5]`

Breakpoints (alineados con Tailwind por defecto):

| Nombre | Ancho | Comportamiento |
|---|---|---|
| Mobile | `< 768px` | Sidebar oculto (drawer), tablas → tarjetas |
| Tablet | `768–1024px` | Sidebar colapsable |
| Desktop | `> 1024px` | Sidebar permanente |

Regla concreta: toda `<Table>` reutilizable cambia a vista de tarjetas cuando `window.innerWidth < 768` (breakpoint `md` de Tailwind), no una definición vaga de "reducido".

---

## 7. Componentes UI `[RESUELTO 2.2]`

Se adopta **shadcn/ui sobre Radix UI** en vez de construir Modal/Dropdown/Tabs/Drawer desde cero. Beneficios directos:
- Accesibilidad resuelta de fábrica: navegación por teclado, `aria-*`, focus trap en modales.
- Compatible nativamente con Tailwind (coherente con el resto de la spec).

**Checklist de accesibilidad mínimo (criterio de aceptación):**
- [ ] Todo formulario es completamente operable por teclado (Tab/Shift+Tab/Enter/Esc).
- [ ] Modales atrapan el foco y lo retornan al elemento que los abrió al cerrar.
- [ ] Contraste de color cumple WCAG AA en texto y estados de foco visibles.
- [ ] Tablas usan `<th scope="col">` y encabezados asociados correctamente.

Lista de componentes (igual que la spec original + los ya cubiertos por shadcn/ui): Button, Input, Select, Textarea, DatePicker, Modal, Drawer, Dropdown, Badge, Avatar, Card, Table, Pagination, Tabs, Toast, Alert, ConfirmDialog, EmptyState, LoadingState, ErrorState, Timeline, Kanban.

---

## 8. Pipeline (Kanban) `[RESUELTO 3.1 / 3.2]`

- Librería: `@dnd-kit/core` (no `react-beautiful-dnd`, deprecada desde 2025).
- **Patrón de optimistic update** para `POST /opportunities/{id}/move`:

```js
useMutation({
  mutationFn: moveOpportunity,
  onMutate: async (vars) => {
    await queryClient.cancelQueries(['opportunities']);
    const previous = queryClient.getQueryData(['opportunities']);
    queryClient.setQueryData(['opportunities'], optimisticallyMove(vars));
    return { previous };
  },
  onError: (err, vars, context) => {
    queryClient.setQueryData(['opportunities'], context.previous);
    toast.error('No se pudo mover la oportunidad');
  },
  onSettled: () => queryClient.invalidateQueries(['opportunities']),
});
```

El mismo patrón aplica a: aceptar/rechazar cotización, marcar factura como pagada.

---

## 9. Formularios `[RESUELTO frontend 4.4]`

React Hook Form + Zod (sin cambios de librería). Cada formulario mantiene: validation, loading state, error state, success state, dirty state, confirmation.

**Guard de cambios sin guardar:** hook `useUnsavedChangesGuard(formState.isDirty)` que:
- Intercepta navegación del router (bloquea `<Link>`/`navigate()` con confirmación).
- Añade listener de `beforeunload` para cierre/recarga de pestaña.

Aplica especialmente a Cotizaciones/Facturas (formularios largos con líneas de servicio dinámicas).

---

## 10. Generación de PDF `[RESUELTO 3.3]`

El frontend **no genera PDF**. Los botones "Generar PDF" en Cotizaciones y Facturas simplemente:
```js
window.open(`${API_URL}/quotes/${id}/pdf`, '_blank')
```
El backend (WeasyPrint) es la única fuente de verdad del documento.

---

## 11. Formato de moneda `[RESUELTO 3.4]`

`src/lib/currency.js`:
```js
export function formatMoney(amount, currency = 'CRC') {
  return new Intl.NumberFormat('es-CR', { style: 'currency', currency }).format(amount);
}
```
Usado en **toda** tabla/detalle que muestre montos (Cotizaciones, Facturas, Oportunidades, Dashboard). Si una vista mezcla monedas (ej. tabla de facturas con CRC y USD), el símbolo siempre se muestra explícito por fila; si toda la vista es una sola moneda, puede omitirse en filas individuales y mostrarse solo en el encabezado de columna. Servicios/Cotizaciones precargan `CRC` por defecto en el formulario.

---

## 12. Tiempo real: Comunicaciones y Notificaciones `[RESUELTO 2.3]`

```js
// hooks/useWebSocket.js
const socket = useWebSocket('/ws/notifications', { token: accessToken });
socket.on('new_communication', () => queryClient.invalidateQueries(['communications']));
socket.on('new_notification', () => queryClient.invalidateQueries(['notifications']));
```

TanStack Query sigue siendo la única fuente de datos (fetch/caché); el WebSocket solo dispara `invalidateQueries` — nunca escribe datos directamente en la caché para evitar desincronización de forma.

Badge de notificaciones no leídas en el header, alimentado por `GET /notifications?unread_only=true`.

---

## 13. Dashboard `[RESUELTO 3.5]`

Gráficos con **Recharts**:
- Leads por fuente → `PieChart` o `BarChart`.
- Leads por estado → `BarChart`.
- Pipeline por etapa → `BarChart` horizontal.
- Ventas mensuales → `LineChart`.

---

## 14. Manejo de errores API `[RESUELTO frontend 3.8, ya cubierto en §2]`

Mapeo de códigos (igual a spec original) + comportamiento específico ya definido para 401 en §2. Nunca mostrar stack traces, errores SQL ni excepciones internas — solo el mensaje `detail` que el backend ya sanitiza.

---

## 15. Acciones que requieren confirmación `[RESUELTO 3.7]`

Lista explícita (antes era un principio genérico):

- Eliminar cualquier entidad (Lead, Contact, Company, Opportunity, Activity) — recuperable vía soft-delete, pero se confirma igual.
- Cancelar factura.
- Rechazar cotización.
- Marcar factura como pagada.
- Convertir un Lead (genera Contact/Company/Opportunity adicionales).

---

## 16. Seguridad frontend

- HTTPS, route guards, input validation, protección XSS (React ya escapa por defecto; cuidado especial al renderizar `communications.message` que viene de fuentes externas — usar texto plano, nunca `dangerouslySetInnerHTML`).
- Nunca secretos en variables `VITE_*` (son públicas en el bundle).
- `.env`:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
```

---

## 17. Performance

- Lazy loading + code splitting por feature (`React.lazy` + `Suspense`).
- Paginación en todo listado (nunca cargar todos los Leads/Contactos/Empresas de una vez).
- Virtualización (`@tanstack/react-virtual`) si un cliente supera ~500 filas visibles simultáneamente en una tabla filtrada.
- Debounce de 300ms en buscadores (tabla y búsqueda global).
- Optimistic updates donde ya se especificó (§8).

---

## 18. Testing `[RESUELTO frontend 4.2]`

- Unitarias: React Testing Library para componentes de formulario y lógica de hooks (`useIdleTimer`, `useUnsavedChangesGuard`).
- E2E (Playwright): flujos críticos mínimos —
  1. Login → Dashboard.
  2. Crear Lead → Convertir → verificar Opportunity creada.
  3. Crear Cotización → Enviar → Aceptar → Convertir a Factura.
  4. Mover una Oportunidad en el Kanban (incluyendo caso de fallo simulado y rollback visual).

---

## 19. Búsqueda global `[RESUELTO backend 3.5]`

Header con input debounced (300ms) que llama `GET /search?q=...` y agrupa resultados por `entity_type` (Leads, Contactos, Empresas, Oportunidades, Cotizaciones, Facturas) con navegación directa al detalle.

---

## 20. Plan de desarrollo (fases — alineado con backend)

**Fase 0:** Auth completo (incluyendo interceptor + refresh silencioso), layout base, contrato de permisos, componentes shadcn/ui base.

**Fase 1 (MVP núcleo):** Login, Dashboard (estático primero), Leads, Contacts, Companies, Services, Pipeline (con dnd-kit + optimistic update), Opportunities.

**Fase 2:** Quotes (+ PDF vía backend + formato de moneda), Invoices, Activities, guard de cambios sin guardar.

**Fase 3:** Communications + WhatsApp UI, Notifications + WebSocket, Search global, Reportes avanzados del Dashboard con Recharts, auto-logout por inactividad.

---

## 21. Definition of Done (por pantalla)

- [ ] Responsive validado en los 3 breakpoints (§6).
- [ ] Navegable completamente por teclado; probado con lector de pantalla básico en al menos los formularios de creación.
- [ ] Estados de loading/error/empty implementados (no solo el happy path).
- [ ] Si involucra datos monetarios, usa `formatMoney()` — no strings manuales.
- [ ] Si tiene formulario con más de 3 campos, tiene guard de cambios sin guardar.
- [ ] Acciones listadas en §15 tienen `ConfirmDialog`.
