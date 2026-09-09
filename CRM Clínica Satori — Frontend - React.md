# CRM Clínica Satori
## Especificación Técnica — Frontend

**Versión:** 1.0  
**Framework:** React.js  
**CSS:** Tailwind CSS  
**Comunicación:** REST API  
**Backend:** FastAPI  
**Estado:** React Query / TanStack Query  
**Routing:** React Router  
**Forms:** React Hook Form  
**Validación:** Zod

---

# 1. Objetivo

Construir una aplicación web CRM para Clínica Satori que permita administrar:

- Leads
- Contactos
- Empresas
- Servicios
- Pipeline
- Oportunidades
- Cotizaciones
- Facturas
- Actividades
- Comunicaciones
- Usuarios

La interfaz debe ser responsive y funcionar correctamente en:

```text
Desktop
Tablet
Mobile
```

---

# 2. Arquitectura Frontend

```text
React Application
│
├── Authentication
│
├── Layout
│
├── Dashboard
│
├── CRM
│   ├── Leads
│   ├── Contacts
│   ├── Companies
│   ├── Opportunities
│   └── Activities
│
├── Sales
│   ├── Pipeline
│   ├── Quotes
│   └── Invoices
│
├── Catalog
│   └── Services
│
├── Communications
│   ├── Email
│   └── WhatsApp
│
└── Administration
    └── Users
```

---

# 3. Estructura del proyecto

```text
frontend/
│
├── src/
│   │
│   ├── app/
│   │   ├── App.jsx
│   │   ├── router.jsx
│   │   └── providers.jsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── tables/
│   │   ├── modals/
│   │   ├── cards/
│   │   └── layout/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── leads/
│   │   ├── contacts/
│   │   ├── companies/
│   │   ├── services/
│   │   ├── pipeline/
│   │   ├── opportunities/
│   │   ├── quotes/
│   │   ├── invoices/
│   │   ├── activities/
│   │   └── communications/
│   │
│   ├── hooks/
│   │
│   ├── lib/
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── utils.js
│   │
│   ├── layouts/
│   │   ├── AuthLayout.jsx
│   │   └── DashboardLayout.jsx
│   │
│   ├── pages/
│   │
│   ├── types/
│   │
│   └── main.jsx
│
├── public/
│
├── package.json
└── vite.config.js
```

---

# 4. Navegación principal

```text
Dashboard

CRM
├── Leads
├── Contactos
├── Empresas
└── Actividades

Ventas
├── Pipeline
├── Oportunidades
├── Cotizaciones
└── Facturas

Catálogo
└── Servicios

Comunicaciones
├── Email
└── WhatsApp

Administración
└── Usuarios
```

---

# 5. Layout

La aplicación utilizará un layout tipo SaaS:

```text
┌──────────────────────────────────────────────────────┐
│ Logo Clínica Satori              Usuario   🔔        │
├──────────────┬───────────────────────────────────────┤
│              │                                       │
│ Dashboard    │                                       │
│              │                                       │
│ CRM          │             MAIN CONTENT              │
│  Leads       │                                       │
│  Contactos   │                                       │
│  Empresas    │                                       │
│              │                                       │
│ Ventas       │                                       │
│  Pipeline    │                                       │
│  Cotizaciones│                                       │
│  Facturas    │                                       │
│              │                                       │
│ Catálogo     │                                       │
│  Servicios   │                                       │
│              │                                       │
│ Configuración│                                       │
└──────────────┴───────────────────────────────────────┘
```

En mobile:

```text
Header
   ↓
Content
   ↓
Bottom navigation / Drawer
```

---

# 6. Dashboard

Ruta:

```text
/dashboard
```

Componentes:

```text
Total Leads
Nuevos Leads
Oportunidades Abiertas
Pipeline Value
Cotizaciones Pendientes
Facturas Pendientes
Facturas Vencidas
Ventas
```

Gráficos:

```text
Leads por fuente
Leads por estado
Pipeline por etapa
Ventas mensuales
Cotizaciones
```

Actividad reciente:

```text
Nuevo Lead
Cotización enviada
WhatsApp recibido
Oportunidad creada
Factura pagada
```

---

# 7. Leads

Ruta:

```text
/leads
```

Vista principal:

```text
┌───────────────────────────────────────────────┐
│ Leads                    [+ Nuevo Lead]       │
├───────────────────────────────────────────────┤
│ Buscar...     Estado ▼ Fuente ▼ Tipo ▼       │
├───────────────────────────────────────────────┤
│ Nombre | Empresa | Email | Fuente | Estado    │
├───────────────────────────────────────────────┤
│ Juan    | -      | ...   | WhatsApp | Nuevo  │
│ Ana     | ABC    | ...   | Web      | Contact│
└───────────────────────────────────────────────┘
```

Acciones:

```text
Ver
Editar
Asignar
Convertir
Eliminar
```

---

# 8. Lead Detail

Ruta:

```text
/leads/:id
```

Secciones:

```text
Información
Contacto
Origen
Estado
Asignación
Mensaje inicial
Actividades
Comunicaciones
Timeline
```

Acciones principales:

```text
Convertir Lead
Crear Oportunidad
Crear Actividad
Enviar Email
Enviar WhatsApp
```

---

# 9. Conversión de Lead

Modal:

```text
Convertir Lead

Tipo:
○ Individual
○ Empresa

Contacto
Nombre
Apellido
Email
Teléfono

Empresa
Nombre
Industria

☑ Crear oportunidad

Pipeline:
B2C ▼

Etapa:
Contacto Inicial ▼

[Cancelar] [Convertir]
```

Para B2C:

```text
Lead → Contact → Opportunity
```

Para B2B:

```text
Lead → Company → Contact → Opportunity
```

---

# 10. Contactos

Ruta:

```text
/contacts
```

Campos:

```text
Nombre
Apellido
Email
Teléfono
WhatsApp
Empresa
Cargo
Estado
```

Vista:

```text
Tabla
```

Detalle:

```text
Información
Empresa
Oportunidades
Cotizaciones
Facturas
Actividades
Comunicaciones
Timeline
```

---

# 11. Empresas

Ruta:

```text
/companies
```

Campos:

```text
Nombre
Nombre legal
Identificación fiscal
Industria
Email
Teléfono
Website
Dirección
```

Detalle:

```text
Información
Contactos
Oportunidades
Cotizaciones
Facturas
Actividades
Timeline
```

---

# 12. Servicios

Ruta:

```text
/services
```

Tabla:

```text
Código
Servicio
Tipo
Precio
Facturación
Estado
```

Formulario:

```text
Nombre
Código
Descripción
Tipo
Precio
Moneda
Tipo de facturación
Activo
```

Tipos:

```text
Individual
Corporativo
Taller
Consultoría
Terapia
Evaluación
Otro
```

---

# 13. Pipeline

Ruta:

```text
/pipeline
```

Vista Kanban:

```text
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Nuevo Lead   │ Contactado   │ Propuesta    │ Negociación  │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ Opportunity  │ Opportunity  │ Opportunity  │ Opportunity  │
│ $100         │ $250         │ $500         │ $1,000       │
│              │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

Debe permitir:

```text
Drag & Drop
```

Al mover una oportunidad:

```http
POST /opportunities/{id}/move
```

---

# 14. Oportunidades

Ruta:

```text
/opportunities
```

Campos:

```text
Nombre
Cliente
Empresa
Pipeline
Etapa
Valor
Probabilidad
Fecha estimada
Responsable
Estado
```

Detalle:

```text
Opportunity Header
        ↓
Cliente
        ↓
Servicios
        ↓
Timeline
        ↓
Actividades
        ↓
Cotización
        ↓
Factura
```

---

# 15. Cotizaciones

Ruta:

```text
/quotes
```

Tabla:

```text
Número
Cliente
Empresa
Fecha
Vencimiento
Total
Estado
```

Crear cotización:

```text
Cliente
Empresa
Oportunidad

Servicios
--------------------------------
Servicio
Cantidad
Precio
Descuento
Total
--------------------------------

Subtotal
Descuento
Impuestos
Total
```

Acciones:

```text
Guardar
Enviar
Aceptar
Rechazar
Generar PDF
```

---

# 16. Facturas

Ruta:

```text
/invoices
```

Tabla:

```text
Número
Cliente
Fecha
Vencimiento
Total
Estado
```

Formulario:

```text
Cliente
Empresa
Cotización
Fecha
Vencimiento

Items

Subtotal
Descuento
Impuesto
Total
```

Acciones:

```text
Emitir
Enviar
Marcar como pagada
Generar PDF
Cancelar
```

---

# 17. Actividades

Ruta:

```text
/activities
```

Tipos:

```text
Llamada
Email
WhatsApp
Reunión
Tarea
Nota
Seguimiento
```

Vista:

```text
Hoy
Próximas
Vencidas
Completadas
```

Formulario:

```text
Tipo
Asunto
Descripción
Lead
Contacto
Empresa
Oportunidad
Responsable
Fecha
```

---

# 18. Timeline

Debe existir un componente reutilizable:

```text
<Timeline />
```

Ejemplo:

```text
● 08 Sep 2026
  Lead creado desde WhatsApp

● 08 Sep 2026
  Contacto inicial realizado

● 09 Sep 2026
  Reunión programada

● 10 Sep 2026
  Cotización creada

● 10 Sep 2026
  Cotización enviada
```

Debe combinar:

```text
Activities
Communications
Status changes
Quotes
Invoices
```

---

# 19. Comunicaciones

Ruta:

```text
/communications
```

Canales:

```text
Email
WhatsApp
```

Vista:

```text
Inbox
```

Cada conversación debe mostrar:

```text
Contacto
Canal
Fecha
Mensaje
Estado
```

---

# 20. WhatsApp UI

Vista conceptual:

```text
┌────────────────┬────────────────────────────┐
│ Conversaciones │ Juan Pérez                 │
│                │                            │
│ Juan Pérez     │ Hola, quisiera información │
│ Ana Rodríguez  │                            │
│ Empresa ABC    │ Clínica Satori: Claro...   │
│                │                            │
│                │ [Escribir mensaje...]      │
└────────────────┴────────────────────────────┘
```

El frontend no debe comunicarse directamente con WhatsApp.

Debe utilizar:

```text
React
 ↓
FastAPI
 ↓
WhatsApp Provider
```

---

# 21. Email UI

La interfaz debe permitir:

```text
Enviar email
Ver emails recibidos
Ver emails enviados
Relacionar email con Lead
Relacionar email con Contact
Relacionar email con Company
```

Los emails recibidos desde formularios deben aparecer automáticamente en:

```text
Leads
```

---

# 22. API Client

Centralizar todas las llamadas:

```text
src/lib/api.js
```

Ejemplo conceptual:

```javascript
api.get('/leads')
api.post('/leads', data)
api.get(`/leads/${id}`)
api.put(`/leads/${id}`, data)
api.post(`/leads/${id}/convert`)
```

No realizar llamadas HTTP directamente desde componentes UI.

---

# 23. React Query

Utilizar TanStack Query para:

```text
Server State
Caching
Fetching
Mutations
Invalidation
Loading States
Error States
```

Ejemplo conceptual:

```text
useLeads()
useLead(id)
useCreateLead()
useUpdateLead()
useConvertLead()
```

---

# 24. Formularios

Utilizar:

```text
React Hook Form
+
Zod
```

Cada formulario debe tener:

```text
Validation
Loading state
Error state
Success state
Dirty state
Confirmation
```

---

# 25. Componentes UI reutilizables

```text
Button
Input
Select
Textarea
DatePicker
Modal
Drawer
Dropdown
Badge
Avatar
Card
Table
Pagination
Tabs
Toast
Alert
ConfirmDialog
EmptyState
LoadingState
ErrorState
Timeline
Kanban
```

---

# 26. Estados globales

Mantener globalmente únicamente información necesaria:

```text
authenticated user
authentication token
theme
UI preferences
```

El estado de datos del CRM debe manejarse mediante:

```text
TanStack Query
```

Evitar almacenar toda la aplicación en Redux si no es necesario.

---

# 27. Autenticación

Ruta:

```text
/login
```

Formulario:

```text
Email
Password

[Ingresar]
```

Después de autenticar:

```text
/login
   ↓
/dashboard
```

Rutas protegidas:

```text
/dashboard
/leads
/contacts
/companies
/services
/pipeline
/opportunities
/quotes
/invoices
/activities
/communications
```

---

# 28. Control de permisos

El frontend debe respetar los roles enviados por el backend.

Ejemplo:

```text
admin
  → acceso completo

manager
  → CRM + ventas + reportes

sales
  → leads + contactos + empresas + pipeline + cotizaciones

therapist
  → contactos + actividades

accounting
  → cotizaciones + facturas
```

La seguridad real debe aplicarse en el backend.

El frontend solamente controla visibilidad y experiencia de usuario.

---

# 29. Responsive Design

Breakpoints:

```text
Mobile
Tablet
Desktop
Large Desktop
```

En desktop:

```text
Sidebar permanente
```

En mobile:

```text
Sidebar oculto
Drawer
```

Las tablas deben convertirse en:

```text
Cards
```

cuando el ancho de pantalla sea reducido.

---

# 30. UX

Principios:

```text
Menos clicks
Información contextual
Acciones rápidas
Feedback inmediato
Estados claros
Búsqueda global
Filtros
Ordenamiento
Paginación
Confirmación para acciones destructivas
```

Acciones frecuentes deben estar disponibles desde el detalle:

```text
Crear actividad
Enviar WhatsApp
Enviar email
Crear oportunidad
Crear cotización
Crear factura
```

---

# 31. Búsqueda global

Header:

```text
[ 🔍 Buscar en Clínica Satori... ]
```

Buscar:

```text
Leads
Contactos
Empresas
Oportunidades
Cotizaciones
Facturas
```

Resultado:

```text
Tipo
Nombre
Información
Estado
```

---

# 32. Notificaciones

Sistema de Toast:

```text
Lead creado correctamente
Cotización enviada
Factura marcada como pagada
Error al guardar
WhatsApp enviado
```

Notificaciones internas:

```text
Nueva asignación
Nueva actividad
Nuevo Lead
Nuevo mensaje
Cotización aceptada
Factura vencida
```

---

# 33. Manejo de errores API

El frontend debe interpretar:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
429 Too Many Requests
500 Server Error
```

Mostrar mensajes amigables al usuario.

Nunca mostrar directamente:

```text
stack traces
SQL errors
internal exceptions
```

---

# 34. Performance

Implementar:

```text
Lazy Loading
Code Splitting
Pagination
Debounced Search
Query Caching
Optimistic Updates donde corresponda
```

No cargar todos los Leads, Contactos o Empresas simultáneamente.

---

# 35. Seguridad Frontend

Implementar:

```text
HTTPS
Secure authentication
Route guards
Input validation
XSS protection
No secrets in frontend
No API keys privadas
```

Nunca almacenar en React:

```text
DATABASE_URL
WhatsApp API Secret
Email API Secret
JWT signing secret
```

---

# 36. Variables de entorno

```env
VITE_API_URL=https://api.satori-crm.com/api/v1
```

No colocar secretos privados en variables:

```text
VITE_*
```

porque son visibles en el bundle del navegador.

---

# 37. Rutas finales

```text
/login

/dashboard

/leads
/leads/new
/leads/:id

/contacts
/contacts/new
/contacts/:id

/companies
/companies/new
/companies/:id

/services
/services/new
/services/:id

/pipeline

/opportunities
/opportunities/new
/opportunities/:id

/quotes
/quotes/new
/quotes/:id

/invoices
/invoices/new
/invoices/:id

/activities

/communications
/communications/email
/communications/whatsapp

/settings/users
```

---

# 38. MVP Frontend

Prioridad 1:

```text
Login
Dashboard
Leads
Contacts
Companies
Services
Pipeline
Opportunities
```

Prioridad 2:

```text
Quotes
Invoices
Activities
```

Prioridad 3:

```text
Email
WhatsApp
Notifications
Global Search
Reports
```

---

# 39. Flujo principal B2C

```text
                    WEB / WHATSAPP
                           │
                           ▼
                         LEAD
                           │
                           ▼
                       CONTACT
                           │
                           ▼
                     OPPORTUNITY
                           │
                           ▼
                        QUOTE
                           │
                           ▼
                       INVOICE
                           │
                           ▼
                        SERVICE
```

---

# 40. Flujo principal B2B

```text
                    WEB / EMAIL / WHATSAPP
                              │
                              ▼
                         LEAD EMPRESA
                              │
                              ▼
                           COMPANY
                              │
                              ├── CONTACT
                              │
                              └── CONTACT
                                    │
                                    ▼
                              OPPORTUNITY
                                    │
                                    ▼
                                  QUOTE
                                    │
                                    ▼
                                 INVOICE
                                    │
                                    ▼
                              CORPORATE SERVICE
```

---

# 41. Principio de diseño

El CRM debe ser concebido como un **CRM comercial**, no como un expediente clínico.

El modelo principal es:

```text
Lead
 ↓
Relationship
 ↓
Opportunity
 ↓
Sale
 ↓
Service
```

La información clínica sensible debe mantenerse fuera del CRM comercial o, si posteriormente se incorpora, dentro de un módulo independiente con controles de acceso mucho más estrictos.

---

# 42. Roadmap posterior

Después del MVP se pueden incorporar:

```text
Calendario
Agenda de sesiones
Recordatorios
Portal del cliente
Facturación electrónica
Pagos online
Automatización de marketing
Email campaigns
WhatsApp automation
Reportes avanzados
Integración contable
IA para clasificación de Leads
Lead scoring
Automatización del Pipeline
```

La arquitectura inicial debe mantenerse suficientemente modular para agregar estos componentes posteriormente sin rediseñar el núcleo del CRM.