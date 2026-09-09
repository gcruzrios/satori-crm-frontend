# CRM Clínica Satori — Revisión Técnica: Frontend (React)

**Documento:** Observaciones y recomendaciones de arquitectura
**Revisor:** Arquitectura de Sistemas Web
**Basado en:** `CRM_Clínica_Satori_-_Frontend_-_React.md` (v1.0)
**Fecha de revisión:** Septiembre 2026

---

## 1. Resumen ejecutivo

El stack elegido (React + Vite + TanStack Query + React Hook Form + Zod + Tailwind) es una combinación moderna y probada, y la separación por `features/` en lugar de solo por tipo técnico es la decisión correcta para un dominio con tantos módulos (11 features). La disciplina declarada de "no llamadas HTTP directas desde componentes" y "no Redux si no es necesario" muestra buen criterio.

El documento es fuerte en **estructura de navegación y layout**, pero débil en tres áreas que determinan si el producto se siente profesional en producción: **seguridad de sesión en el cliente, tiempo real, y accesibilidad**. Ninguna de las tres está mencionada, y las tres son razonables de exigir en un sistema que maneja datos personales de pacientes/leads de una clínica.

Clasificación de hallazgos:

| Severidad | Cantidad |
|---|---|
| 🔴 Crítico | 3 |
| 🟠 Alto | 8 |
| 🟡 Medio | 7 |
| 🟢 Bajo / mejora | 5 |

---

## 2. Hallazgos críticos 🔴

### 2.1 No se define dónde se almacena el token de autenticación
La sección 27 describe el flujo de login, y la sección 35 prohíbe correctamente almacenar secretos en el frontend, pero **no dice dónde vive el access token ni el refresh token** en el navegador. Esta es la decisión de seguridad más importante del frontend.

**Riesgo concreto:** si el equipo por defecto usa `localStorage` (patrón muy común en tutoriales de React Query + JWT), el token queda expuesto a robo vía XSS — y una app con formularios ricos, HTML de WhatsApp/email renderizado, etc. tiene más superficie de XSS que un sitio estático.

**Recomendación:** Definir explícitamente:
- Access token de vida corta (~15 min) en memoria (estado de React/contexto), nunca en `localStorage`.
- Refresh token en cookie `httpOnly + Secure + SameSite=Strict`, gestionada por el backend (ver documento de backend, hallazgo 4.5).
- Esto implica coordinarlo con el backend: el login debe setear la cookie server-side, no devolver el refresh token en el body de la respuesta.

### 2.2 Ausencia total de lineamientos de accesibilidad (a11y)
El documento no menciona WCAG, navegación por teclado, `aria-*`, contraste de color, ni foco visible en ningún punto — ni en la lista de componentes reutilizables (sección 25) ni en principios de UX (sección 30). Para un sistema usado por personal administrativo y potencialmente por perfiles con necesidades de accesibilidad diversas, esto no debería quedar implícito.

**Recomendación:** Adoptar una librería de componentes headless con accesibilidad resuelta de fábrica (Radix UI / shadcn-ui, que además es compatible con Tailwind) en lugar de construir `Modal`, `Dropdown`, `Tabs`, `Drawer` desde cero. Establecer como criterio de aceptación mínimo: navegación completa por teclado en formularios y tablas, y foco atrapado (`focus trap`) en modales.

### 2.3 No hay estrategia de tiempo real para Comunicaciones/WhatsApp
La sección 20 muestra una UI de chat estilo WhatsApp (lista de conversaciones + hilo de mensajes), pero la única fuente de datos declarada es TanStack Query, que por defecto es "pull" (el usuario debe refrescar o esperar un refetch). Un módulo de conversaciones que no actualiza en vivo se siente roto para el usuario (llega un WhatsApp del paciente y el agente no lo ve hasta refrescar).

**Recomendación:** Definir explícitamente un mecanismo de push: WebSocket o Server-Sent Events desde el backend hacia el cliente para nuevos `communications` y `notifications`, con TanStack Query usado solo para la carga inicial e invalidación de caché al recibir el evento (`queryClient.invalidateQueries`). Esto también resuelve el hallazgo de notificaciones internas (sección 32) del mismo documento.

---

## 3. Hallazgos de severidad alta 🟠

### 3.1 Librería de Kanban no especificada — riesgo de elegir una deprecada
La sección 13 exige drag & drop en el pipeline, pero no se nombra una librería. La opción "por defecto" que muchos equipos eligen (`react-beautiful-dnd`) está **oficialmente deprecada** por Atlassian desde 2025 y no recibe mantenimiento.

**Recomendación:** Estandarizar en `@dnd-kit/core` (activamente mantenida, accesible por teclado, y compatible con React 18/19).

### 3.2 Sin estrategia de rollback para optimistic updates en el Kanban
Al mover una oportunidad de etapa (`POST /opportunities/{id}/move`), la UX esperada es mover la tarjeta inmediatamente (optimistic update) y solo revertir si el backend falla. El documento menciona "Optimistic Updates donde corresponda" (sección 34) de forma genérica, pero no especifica el caso más obvio donde aplica ni cómo se comunica el fallo al usuario (¿toast de error + la tarjeta regresa a su columna original?).

**Recomendación:** Documentar el patrón concreto con TanStack Query (`onMutate` guarda snapshot, `onError` hace rollback con `setQueryData`, `onSettled` invalida). Aplica también a "marcar cotización como aceptada/rechazada" y "marcar factura como pagada".

### 3.3 No se define generación de PDF: ¿cliente o servidor?
Tanto Cotizaciones (sección 15) como Facturas (sección 16) tienen la acción "Generar PDF", pero no se indica si el PDF se genera en el navegador (ej. `react-pdf`, `jsPDF`) o se solicita al backend. Esto no es un detalle menor: un PDF generado en cliente es fácil de manipular antes de descargar (riesgo si se usa para validación fiscal) y duplica la lógica de formato entre frontend y backend.

**Recomendación:** Generar el PDF en el backend (coherente con el uso ya confirmado de WeasyPrint en otros proyectos del mismo stack) y que el frontend simplemente descargue/abra el archivo devuelto por `GET /quotes/{id}/pdf`.

### 3.4 Formato de moneda y localización no especificado
El backend maneja `currency VARCHAR(3)` (multi-moneda: CRC/USD son los casos reales para una clínica costarricense con clientes B2B), pero el frontend no menciona formato de número/moneda (`Intl.NumberFormat('es-CR', ...)`), separador decimal, ni cómo se muestran montos en ₡ vs $ dentro de la misma tabla (ej. columna "Total" de Cotizaciones, sección 15).

**Recomendación:** Definir un helper único de formato monetario centralizado en `lib/utils.js`, usado en toda tabla/detalle que muestre montos, y decidir si el símbolo de moneda se muestra siempre o solo cuando hay mezcla de monedas en una misma vista.

### 3.5 Sin librería de gráficos especificada para el Dashboard
La sección 6 pide varios gráficos (leads por fuente, pipeline por etapa, ventas mensuales) sin nombrar una librería.

**Recomendación:** Usar `Recharts` (se integra bien con Tailwind y React, curva de aprendizaje baja) o `Chart.js` si se prefiere canvas sobre SVG para datasets grandes.

### 3.6 Falta de auto-logout por inactividad
Dado que el sistema maneja datos personales de pacientes/leads de salud mental (información sensible por naturaleza, aunque el CRM se declare "no clínico" en la sección 41), dejar una sesión abierta indefinidamente en un computador compartido de recepción es un riesgo real.

**Recomendación:** Implementar cierre de sesión automático tras N minutos de inactividad (ej. 20-30 min), con aviso previo ("tu sesión expirará en 1 minuto") y opción de continuar.

### 3.7 Confirmación de "acciones destructivas" mencionada, pero sin criterio de qué las constituye
Sección 30 menciona "Confirmación para acciones destructivas" como principio, pero no lista cuáles acciones aplican. Con el backend ahora usando soft-delete (ver documento de backend, 2.1), la UI también debería distinguir entre "eliminar" (recuperable) y acciones irreversibles reales (ej. "Marcar factura como pagada" sin reversa fácil, "Cancelar factura").

**Recomendación:** Enumerar explícitamente qué acciones requieren `ConfirmDialog`: eliminar cualquier entidad, cancelar factura, rechazar cotización, marcar como pagada, y convertir un lead (porque genera entidades adicionales).

### 3.8 No se especifica manejo de errores 401 de forma centralizada
La sección 33 lista los códigos HTTP a interpretar, pero no describe el comportamiento global esperado ante un 401 (token expirado a mitad de sesión: ¿se intenta refresh automático vía interceptor y se reintenta la request, o se redirige a `/login` de inmediato perdiendo el formulario que el usuario estaba llenando?).

**Recomendación:** Implementar un interceptor en `lib/api.js` que intente refresh token una vez de forma transparente; solo si el refresh también falla, redirigir a `/login` preservando la ruta de retorno (`?redirect=/opportunities/123`).

---

## 4. Hallazgos de severidad media 🟡

| # | Observación | Recomendación |
|---|---|---|
| 4.1 | No se menciona virtualización de tablas (`react-virtual`/`tanstack-virtual`) para listas grandes de Leads/Contactos, más allá de paginación. | Evaluar virtualización si se espera que un cliente tenga miles de leads históricos en una sola vista filtrada. |
| 4.2 | No hay estrategia de pruebas frontend (unitarias con React Testing Library, e2e con Playwright/Cypress). | Definir al menos pruebas e2e de los flujos críticos: login, conversión de lead, creación de cotización, movimiento en Kanban. |
| 4.3 | El componente `<Timeline />` (sección 18) combina 4 fuentes de datos distintas (activities, communications, status changes, quotes/invoices) sin que el backend defina un endpoint unificado. | Coordinar con backend: o se agrega `GET /timeline?entity_type=lead&entity_id=...` que devuelva ya mezclado y ordenado, o el frontend hace 4 fetches y mezcla client-side (más frágil y con más loading states que coordinar). |
| 4.4 | No se define manejo de "unsaved changes" en formularios largos (ej. Cotización con múltiples líneas de servicio) — riesgo de perder trabajo si el usuario navega fuera accidentalmente. | Agregar guard de navegación (`beforeunload` / bloqueo de router) cuando `formState.isDirty`. |
| 4.5 | No se especifica breakpoint exacto para el paso de tabla → tarjetas en mobile (sección 29 dice "cuando el ancho de pantalla sea reducido", sin número). | Definir el breakpoint concreto (ej. `< 768px`, coherente con el breakpoint `md` de Tailwind) para que sea consistente entre todas las tablas del sistema. |
| 4.6 | Control de permisos en frontend (sección 28) depende de que el backend envíe roles, pero no se especifica el contrato exacto (¿`/auth/me` devuelve solo `role: "sales"`, o una lista de capacidades/permisos?). | Preferir que el backend devuelva capacidades explícitas (`can_view_invoices`, `can_delete_lead`) en vez de que el frontend hardcodee la matriz rol→permiso; evita que backend y frontend se desincronicen al agregar un rol nuevo. |
| 4.7 | No se menciona feature flagging para desplegar progresivamente Prioridad 2/3 (sección 38) sin tener que hacer un branch largo. | Considerar un flag simple basado en variable de entorno o config remota, aunque sea rudimentario, para activar/desactivar Comunicaciones/WhatsApp por ambiente. |

---

## 5. Hallazgos menores / mejoras 🟢

- **Monitoreo de errores en producción**: no se menciona Sentry (u otro) para capturar excepciones de React en producción — crítico para depurar bugs reportados por usuarios no técnicos.
- **Code splitting por ruta**: mencionado genéricamente (sección 34); confirmar que se implementa con `React.lazy` + `Suspense` por feature, no solo "en teoría".
- **Debounce de búsqueda**: mencionado sin valor; 300ms es un estándar razonable para no saturar el backend en cada tecla.
- **Confirmación visual de moneda por defecto**: si Clínica Satori opera principalmente en colones, considerar que el formulario de Servicios/Cotizaciones precargue CRC por defecto en vez de dejar el campo vacío.
- **Naming de rutas de detalle**: consistente en todo el documento (`/leads/:id`, `/contacts/:id`, etc.) — buena práctica, sin observaciones.

---

## 6. Priorización recomendada para el MVP

1. **Antes de escribir código:** resolver 2.1 (almacenamiento de tokens) — es una decisión de arquitectura que es costosa de cambiar después. Definir también 4.6 (contrato de permisos) junto con el equipo de backend.
2. **Durante el MVP (Prioridad 1-2 del documento original):** 3.1/3.2 (Kanban + optimistic updates), 3.3 (PDF backend), 3.4 (formato de moneda), 3.8 (manejo de 401).
3. **Puede diferirse pero debe diseñarse ahora para no rehacer layout:** 2.2 (accesibilidad — más barato de incorporar desde el inicio que retrofittear), 2.3 (tiempo real, coincide con Prioridad 3 del documento original: Comunicaciones/Notificaciones).

Esta priorización es compatible con las tres fases ya definidas en la sección 38 del documento original; los ajustes aquí propuestos son principalmente decisiones que deben tomarse **antes** de iniciar cada fase, no un retraso de la fase misma.
