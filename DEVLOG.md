# Development Log

## [2026-03-13] - Mejora de Sección Etiquetas de Producto

### Estado: EN PROGRESO

### Tareas

#### Fase 1: Backend (Laravel)
- [ ] **Tarea 1.1**: Agregar método `bulkDelete()` en ProductTagController
- [ ] **Tarea 1.2**: Agregar filtros avanzados (filter_id, filter_name) en método index()
- [ ] **Tarea 1.3**: Agregar ruta POST `/api/product-tags/bulk-delete` en api.php

#### Fase 2: Frontend - TagsList.jsx
- [ ] **Tarea 2.1**: Importar y usar PageHeader con breadcrumbs
- [ ] **Tarea 2.2**: Importar useBulkSelect hook y implementar estado de selección
- [ ] **Tarea 2.3**: Agregar checkboxes en filas de tabla y header
- [ ] **Tarea 2.4**: Importar y usar BulkActionsBar
- [ ] **Tarea 2.5**: Implementar filtros avanzados (ID, Nombre) con inputs
- [ ] **Tarea 2.6**: Agregar columna created_at a la tabla
- [ ] **Tarea 2.7**: Actualizar query params al hacer fetch
- [ ] **Tarea 2.8**: Implementar handler para bulk delete

#### Fase 3: Frontend - TagForm.jsx
- [ ] **Tarea 3.1**: Importar y usar PageHeader con breadcrumbs
- [ ] **Tarea 3.2**: Cambiar método HTTP de PUT a POST con _method=PUT

#### Fase 4: Internacionalización
- [ ] **Tarea 4.1**: Verificar/agregar claves de traducción en es.json
- [ ] **Tarea 4.2**: Verificar/agregar claves de traducción en en.json

#### Fase 5: Testing y Verificación
- [ ] **Tarea 5.1**: Probar endpoint bulk-delete en backend
- [ ] **Tarea 5.2**: Probar filtros avanzados
- [ ] **Tarea 5.3**: Probar selección masiva y bulk delete en frontend
- [ ] **Tarea 5.4**: Verificar responsive en móvil
- [ ] **Tarea 5.5**: Verificar breadcrumbs y navegación

### Archivos a Modificar
1. `backend/app/Http/Controllers/ProductTagController.php`
2. `backend/routes/api.php`
3. `frontend/src/views/product-tags/TagsList.jsx`
4. `frontend/src/views/product-tags/TagForm.jsx`
5. `frontend/src/i18n/locales/es.json`
6. `frontend/src/i18n/locales/en.json`

### Notas
- Prioridad: Alta (bulk delete), Media (filtros, UI), Baja (consistencia HTTP)
- Basado en SPECS.md en `.agent_storage/SPECS.md`

---

## [2026-03-14] - CRUD Abstractions y Módulo de Colores

### Estado: COMPLETADO ✅

### Resumen de Cambios

#### 1. Abstracciones CRUD (Reutilizables)
Creados hooks y componentes reutilizables para eliminar código repetitivo:

**Nuevos Archivos:**
- `frontend/src/hooks/use-crud-list.js` - Hook para operaciones de listado
- `frontend/src/hooks/use-crud-form.js` - Hook para operaciones de formulario
- `frontend/src/components/crud-table.jsx` - Componente de tabla reutilizable
- `frontend/src/components/crud-pagination.jsx` - Componente de paginación
- `.agent_storage/CRUD_STANDARDS.md` - Documentación de estándares

**Reducción de Código:**
- CategoriesList: 436 → 262 líneas (-40%)
- CategoryForm: 188 → 122 líneas (-35%)
- TagsList: 422 → 260 líneas (-38%)
- TagForm: 191 → 122 líneas (-36%)
- ProductsList: 577 → 450 líneas (-22%)

#### 2. Módulo de Colores (CRUD Completo)
Implementación de un nuevo CRUD completo como prueba de las abstracciones.

**Backend:**
- Migration: `2026_03_14_000001_create_colors_table.php`
- Model: `Color.php`
- Resource: `ColorResource.php`
- Controller: `ColorController.php` (CRUD completo + bulk delete)
- Routes: Agregadas en `api.php` con permisos

**Frontend:**
- `ColorsList.jsx` (197 líneas) - Listado con color picker preview
- `ColorForm.jsx` (122 líneas) - Formulario con input type=color
- Routes: Agregadas en `App.jsx`
- Sidebar: Agregado menú bajo "Productos"
- Translations: Agregadas en `es.json` y `en.json`

**Características:**
- Color picker nativo HTML5
- Preview de colores en la tabla
- Validación de formato hexadecimal (#RRGGBB)
- Permisos: view colors, manage colors

#### 3. Mejoras de UI/UX
- Títulos consistentes en PageHeader y CardHeader
- Breadcrumbs estandarizados
- Botones de acción alineados a la izquierda en listados
- Botones de formulario alineados a la derecha
- Layout consistente en todos los módulos

### Commits Realizados
1. `2cc174f` - refactor(crud): implement reusable CRUD abstractions for category module
2. `8758f88` - refactor(crud): apply CRUD abstractions to Tags and Products modules
3. `76b001f` - fix(crud): add titles back to form cards
4. `0cf34d8` - docs(crud): document requirement for titles in both PageHeader and CardHeader
5. `814a277` - feat(colors): implement complete CRUD for colors module
6. `92cc983` - feat(colors): add colors menu item to sidebar
7. `625c089` - i18n(colors): simplify hex_color translation label

### Push a Remoto
✅ Todos los cambios han sido pusheados a `origin/main`

### Pendiente
- Ejecutar migración: `php artisan migrate` (la tabla colors no existe aún)

---

## [2026-03-11] - Fix: ChatbotForm UI Improvements and Auto-save

### Frontend Admin (React + Vite)
- [x] 1. Removed empty Card component from ChatbotForm layout.
- [x] 2. Implemented auto-save for status switch (is_active) when editing existing chatbots.
- [x] 3. Added loading spinner feedback when toggling chatbot status.
- [x] 4. Filter out empty suggested questions before saving (with trim validation).
- [x] 5. Aligned avatar upload component to the left instead of center.

---

## [2026-03-08] - Feature: Public API & Chatbot Widget Integration
### Phase 4 - Implementation (Checklist)
#### Backend (Laravel API)
- [x] 1. Created `CheckWidgetDomain` middleware for secure cross-origin access.
- [x] 2. Created `PublicChatbotController` with `config` and `chat` endpoints.
- [x] 3. Updated `config/cors.php` to allow dynamic origins from authorized customers.
- [x] 4. Added `widget_token` (UUID) to `chatbots` table and automated generation.

#### Frontend Admin & Widget
- [x] 5. Developed `chatbot.js` (Vanilla JS + Shadow DOM) for universal embedding.
- [x] 6. Added "Integration" section to `ChatbotForm.jsx` with copyable code snippets.
- [x] 7. Implemented session persistence and suggested questions in the widget.
- [x] 8. Fixed CORS Preflight (OPTIONS) issues for public chat interactions.

## [2026-03-08] - Feature: Customer Management & Multi-client Support
### Phase 1 & 2 - Implementation (Checklist)
#### Backend
- [x] 1. Created `Customer` model and CRUD for managing external clients.
- [x] 2. Implemented `official_domain` validation for widget security.
- [x] 3. Linked `Chatbot` model with `Customer` (one-to-many).
- [x] 4. Created `fix_tokens.php` script to migrate existing chatbots to the new token system.

#### Frontend Admin
- [x] 5. Created `CustomersList.jsx` and `CustomerForm.jsx` with unified design.
- [x] 6. Integrated Customer selection in Chatbot creation/editing.
- [x] 7. Standardized UI components (Card, Badge, Button) across the admin panel.

---

## [2026-03-08] - Feature: Customer Management (Phase 1)

### Phase 1 - Implementation (Checklist)

#### Backend (Laravel API / MySQL)
- [x] 1. Creado modelo `Customer` y migración (name, email, phone, official_domain, is_active).
- [x] 2. Creado `CustomerRequest` para validaciones y `CustomerResource` para respuestas API.
- [x] 3. Creado `CustomerController` con CRUD completo y acción `bulkDelete`.
- [x] 4. Registradas rutas administrativas en `api.php`.
- [x] 5. Seeders: Agregado `manage customers` a `PermissionSeeder`.
- [x] 6. PRE-PHASE 2: Ejecutada migración para añadir `customer_id` a la tabla `chatbots` para evitar errores de relación.

#### Frontend Admin (React + Vite)
- [x] 7. Creada vista `CustomersList.jsx` con diseño unificado (estilo Blog).
- [x] 8. Creada vista `CustomerForm.jsx` para creación y edición de clientes (soporte logo).
- [x] 9. Integrado `useTranslation` para soporte multilingüe completo (ES/EN).
- [x] 10. Registradas rutas en `App.jsx` y vinculadas al `Sidebar`.

#### Fixes & Refactors
- [x] 11. FIX: Corregido prefijo `/api` duplicado en `axios.js` que causaba errores 404.
- [x] 12. FIX: Reparado anidamiento de etiquetas JSX y cierres de `Card` en listados de clientes.
- [x] 13. FIX: Ajustado interceptor de Axios para NO cerrar sesión ante errores 500 fortuitos, facilitando el debugeo.

---

## [2026-03-08] - Feature: Chatbot Interactions Storage & History

### Phase 4 - Implementation (Checklist)

#### Backend (Laravel API / MySQL)
- [x] 1. Actualizado `GroqService.php` para persistir mensajes (user/assistant) en la DB.
- [x] 2. Actualizado `ChatbotController.php` para manejar sesiones en el modo prueba.
- [x] 3. Creado `ChatInteractionController.php` para listado de sesiones y transcripciones.
- [x] 4. Registradas nuevas rutas API para interacciones y sesiones.

#### Frontend Admin (React + Vite)
- [x] 5. Agregado botón "Historial" en `ChatbotsList.jsx`.
- [x] 6. Creada vista `ChatbotInteractions.jsx` para listar sesiones por chatbot.
- [x] 7. Creada vista `ChatbotSessionDetail.jsx` para visualizar transcripciones de chat.
- [x] 8. Actualizado `ChatbotTest.jsx` para persistir conversaciones de prueba.
- [x] 9. Registradas nuevas rutas en `App.jsx` y corregido orden de coincidencia.
- [x] 10. REFACTOR: Eliminada dependencia de `date-fns` y reemplazada por métodos nativos de JS para mayor ligereza y evitar errores de carga.

---

## [2026-03-08] - Feature: Chatbot Form Layout Refactor

### Phase 3 - Planning (Checklist)

#### Frontend Admin (React + Vite)
- [x] 1. Reorganizar `ChatbotForm.jsx` en 3 filas.
- [x] 2. Fila 1 (Izquierda): Identidad + Preguntas Sugeridas.
- [x] 3. Fila 1 (Derecha): Personalidad (System Prompt) + Bienvenida.
- [x] 4. Fila 2: Configuración del Modelo (Full width).
- [x] 5. Fila 3: Acciones (Cancelar/Guardar).
- [x] 6. FIX: Eliminada propiedad `h-full` en tarjeta de Identidad que ocultaba las Preguntas Sugeridas.
- [x] 7. ROBUSTEZ: Asegurados valores por defecto para `max_tokens` y `temperature` en backend y frontend.
- [x] 8. FEATURE: Agregados campos `consent_notice` y `privacy_policy` con valores por defecto.
- [x] 9. OPTIMIZATION: Corregido lag de escritura en `ChatbotForm.jsx` al extraer `HelpTooltip`.
- [x] 10. REFACTOR: Unificadas todas las migraciones de Chatbots en archivos base (MySQL).
- [x] 11. FIX: Corregida redirección post-creación a `/chatbots/edit/:id`.

---

## [2026-03-08] - Feature: Chatbot UI Reorganization

### Phase 3 - Planning (Checklist)

#### Frontend Admin (React + Vite)
- [x] 1. Mover `Card` de Preguntas Sugeridas de la columna derecha a la izquierda en `ChatbotForm.jsx`.
- [x] 2. Reorganizar el grid para que la Identidad y las Preguntas Sugeridas ocupen la primera columna (Row 1).
- [x] 3. Mover `Card` de Configuración del Modelo a un nuevo bloque de grid inferior (Row 2) de ancho completo.
- [x] 4. Ajustar los spans del grid para que la fila 1 tenga un balance 1:2 o similar.

---

## [2026-03-08] - Feature: Chatbot Drafts (Scratchpad)

### Phase 3 - Planning (Checklist)

#### Backend (Laravel API / MySQL)
- [x] 1. Crear migración y modelo `ChatbotDraft`.
- [x] 2. Crear `Admin\ChatbotDraftController` (CRUD).
- [x] 3. Registrar rutas en `api.php`.

#### Frontend Admin (React + Vite)
- [x] 4. Crear vista `ChatbotDrafts.jsx` con listado y formulario (textarea).
- [x] 5. Registrar ruta `/chatbots/drafts` en `App.jsx`.
- [x] 6. Agregar botón "Borradores" en `ChatbotsList.jsx`.

---

## [2026-03-08] - Fix: Autenticación y Redirección de Sesión Corrupta

### Frontend (`adminpanel`)
- [x] 1. Actualizado `lib/axios.js`:
    - Interceptor de respuesta ahora maneja estados `401`, `419` y `500`.
    - Elimina automáticamente `ACCESS_TOKEN` y redirige a `/login`.
    - Prevención de bucles de redirección mediante chequeo de ruta actual.
- [x] 2. Ajustado `views/Dashboard.jsx`:
    - Mejorado `catch` en `fetchDashboard` para loguear errores y forzar salida en `403`.
    - Asegurada la desactivación del estado `loading` en cualquier fallo.

- [x] Problema de carga infinita resuelto cuando la sesión expira o el servidor falla.
- [x] Redirección automática al login implementada globalmente.

### Backend (Seguridad)
- [x] Desactivado `APP_DEBUG=true` en `.env`.
- [x] Implementado manejador de excepciones global en `bootstrap/app.php` para ocultar detalles de `PDOException` y `QueryException`.

### Login (`adminpanel`)
- [x] Refactorizado `Login.jsx` para mostrar mensajes amigables ante errores 500, manteniendo el rastro técnico solo en consola.

---

## [2026-03-07] - Feature: Chatbot Base System (MySQL + Groq)

### Phase 3 - Planning (Checklist)

#### Backend (Laravel API / MySQL)
- [x] 1. Crear migraciones y modelos: `Chatbot`, `ChatSession`, `ChatMessage`.
- [x] 2. Configurar la capa de interfaces transversales (`LLMProviderInterface`) y el `GroqService`.
- [x] 3. Crear `Admin\ChatbotController` (CRUD) con su Resource y FormRequest.
- [x] 4. Registrar endpoints de administración de Chatbots en `routes/api.php`.

#### Frontend Admin (React + Vite)
- [x] 5. Agregar sección "Chatbots" al `Sidebar`.
- [x] 6. Crear vistas `/admin/chatbots` (Listado) y `/admin/chatbots/create|edit`.
- [x] 8. Integrar API Axios y manejar estados UI/validaciones.

### Phase 4 - Testing Interface (Checklist)
- [x] 9. Crear el endpoint `POST /api/admin/chatbots/{chatbot}/test` en `ChatbotController`.
- [x] 10. Interfaz de Chat (Frontend): crear `ChatbotTest.jsx` con diseño de burbujas.
- [x] 11. Integrar componente `ChatbotTest.jsx` y su ruta al router en `App.jsx`.
- [x] 12. Agregar botón de 'Probar Chatbot' en la tabla `ChatbotsList.jsx`.

## [2026-03-03] - Feature: Products Module

### Backend
- Migrations: products, product_categories (con parent_id), product_tags, pivot
- Models: Product (Spatie Media), ProductCategory (jerárquico), ProductTag
- Controllers: ProductController (CRUD, quickUpdate, bulkDelete), ProductCategoryController, ProductTagController
- API Resources: ProductResource, ProductCategoryResource, ProductTagResource
- Rutas API: pública y protegida
- Permisos: 6 permisos nuevos (view/manage products, categories, tags)
- Campo subcategory_id agregado para jerarquía de categorías

### Frontend
- Sidebar: Nueva sección Products separada de Blog
- Rutas: /products, /product-categories, /product-tags
- Componentes: ProductsList, ProductForm, CategoriesList/Form, TagsList/Form
- Formulario reorganizado:
  - Row 1: Name, Slug, Precios, Descripción, Categoría+Subcategoría+Tags
  - Row 2: Cover + Gallery (misma altura)
  - Row 3: Documento
  - Row 4: Status, Order, Featured
  - Row 5: Botones guardar/cancelar
- Traducciones ES/EN

### Fixes
- Corregido FormLabel sin FormField (CategoryForm, TagForm, ProductForm)
- Corregido Content-Type para FormData en axios
- Tags ahora usa MultiSelect igual que posts
- Portada y Gallery en mismo row con misma altura
- Agregadas subcategorías con filtro por parent_id

- [x] Módulo completo de Productos con CRUD
- [x] Categorías y subcategorías jerárquicas
- [x] Sistema de etiquetas múltiples
- [x] Imágenes: cover + gallery
- [x] Documento (PDF/texto)
- [x] Estados: draft, published, archived
- [x] Featured, orden, precios

---

## [2026-03-02] - Feature: Quick Actions en Listado de Blog

### Backend
- [x] 1. Endpoint PATCH /api/articles/{id} para updates parciales
- [x] 2. Método quickUpdate en ArticleController.php

### Frontend
- [x] 3. Función quickUpdate con optimistic updates
- [x] 4. Toggle featured con click directo
- [x] 5. Dropdown para cambiar estado
- [x] 6. Input inline para orden

### UI/UX
- Helper formatDate en utils.js
- Columna slug eliminada del listado
- Fecha con formato dd/mm/aaaa
- Columna Category agregada
- Acciones alineadas a la derecha
- colspan corregido

- [x] Recurso: Quick actions en listado de blog

---

## [2026-03-02] - Feature: Campos order, featured y estado archivado

### Backend
- Nueva migración `add_order_featured_to_posts_table.php` con campos:
  - `order` (integer, nullable, default 0)
  - `featured` (boolean, default false)
- Actualizado modelo Post.php (fillable y casts)
- Actualizado ArticleController.php:
  - Validación de order y featured
  - Sorting por order y featured
- Actualizado PostResource.php (respuesta API)
- Agregado estado 'archived' al enum de status

### Frontend
- ArticleForm.jsx:
  - Agregados campos order (input number) y featured (checkbox)
  - Ubicados en row completo debajo del contenido
  - Agregado estado archivado al select de status
  - Fixed: conversión de boolean a string para FormData
- ArticlesList.jsx:
  - Columna combinada "Dest/Ord" con icono de estrella y número
  - Sorting por featured y order
  - Estilos para modo oscuro en selects

### UI/UX
- Gallery movida debajo del editor de contenido (ancho completo)
- Order y Featured en row separado antes de botones guardar
- Estilos CSS para selects en modo oscuro

- [x] Recurso: Campos order y featured en posts
- [x] Recurso: Estado archivado para posts
- [x] Mejora: UI de formulario de artículos

---

## [2026-03-02] - Mejoras de UX: Selección Múltiple y Diálogos de Confirmación

### Backend
- Se implementó endpoint `POST /bulk-delete` para eliminación masiva en:
  - Articles (`articles/bulk-delete`)
  - Users (`users/bulk-delete`)
  - Roles (`roles/bulk-delete`)
  - Categories (`categories/bulk-delete`)
  - Tags (`tags/bulk-delete`)
- Los endpoints validan que los IDs existan y belongezcan al recurso.

### Frontend
- Se creó hook `useBulkSelect` para manejar selección múltiple de items en tablas.
- Se creó componente `BulkActionsBar` con:
  - Contador de items seleccionados
  - Botón de eliminación masiva
  - Botón para limpiar selección
  - Animación de entrada flotante
- Se creó componente `ConfirmationDialog` basado en Radix UI AlertDialog:
  - Modal con ícono de alerta
  - Título y descripción personalizables
  - Botones Confirmar/Cancelar
  - Soporte para variant="destructive" para acciones destructivas
- Se instalo `@radix-ui/react-alert-dialog`.

### Listas actualizadas con selección múltiple
- ArticlesList
- UsersList
- RolesList
- CategoriesList
- TagsList

### Traducciones (ES/EN)
- `bulk_selected`, `bulk_delete`, `bulk_delete_confirm`, `bulk_delete_success`, `bulk_delete_error`
- `confirm_delete`, `confirm_delete_item`, `confirm_delete_description`, `confirm`, `cancel`

### Cambios UX
- Se reemplazaron todos los `window.confirm()` nativos por diálogos de confirmación visuales.
- Las acciones de eliminación ahora tienen feedback visual consistente.
- Selección múltiple con checkboxes en todas las tablas de admin.

- [x] Recurso: Selección múltiple con checkboxes en tablas.
- [x] Recurso: Eliminación masiva de registros.
- [x] Recurso: Diálogos de confirmación para eliminar.
- [x] Recurso: Componente reutilizable ConfirmationDialog.

---

## [2026-03-01] - Implementación del Módulo Blog

### Backend
- Se implementó el módulo Blog: modelos `Categories`, `Tags` y `Posts` con relaciones.
- Se crearon migraciones para las tablas del blog.
- Se implementó `PostController` con CRUD completo, paginación, búsqueda, filtros y ordenamiento.
- Se arreglaron las rutas de la API: se cambió `/posts` por `/articles` para consistencia con el frontend.
- Se corrigió `PostResource` para manejar correctamente las relaciones anidadas.
- Se corrigió `UserResource` para manejar de forma segura relaciones no cargadas.
- **Corrección de fallo:** Se cambió `$request->has()` por `$request->filled()` en filtros para manejar correctamente parámetros vacíos.
- Se actualizaron seeders para usar `updateOrCreate` para idempotencia.

### Frontend
- Se creó `ArticlesList.jsx` con una tabla paginada, búsqueda, filtros y ordenamiento.
- Se creó `ArticleForm.jsx` con:
  - Campo de título
  - Editor de texto enriquecido (Tiptap)
  - Carga de imagen de portada con recortador
  - Desplegable de categorías
  - Selector de estado
  - Selección múltiple de etiquetas con badges (popover)
- Se implementó un componente `MultiSelect` personalizado usando Popover de shadcn/ui.
- Se instalaron `@radix-ui/react-popover` y `cmdk`.
- Se corrigieron claves de i18n para el módulo de artículos.

### Mejoras de UI (Admin)
- Espaciado de los botones de acción en el listado en pantallas pequeñas para mejor legibilidad.
- Vista previa del artículo (modal) con mayor padding alrededor de la imagen y mayor separación entre secciones.
- Mantener el contenido del post en su idioma original; solo el texto de la UI se traduce.

### Slug y SEO
- Sistema de slug automático en creación (se genera desde el título).
- Slug editable en el formulario de creación/edición.
- Validación de unicidad en backend.
- Índice único en la base de datos para el campo slug.
- Visualización del slug en la lista de artículos y en la vista previa.

### Correcciones de Errores
- Corrección de UI de selección de etiquetas: se reemplazó la lista de casillas por un dropdown Multi-Select funcional.
- Corrección de resultados de artículos: se cambió `$request->has()` por `$request->filled()` en filtros del controlador.

- [x] Recurso: Blog - Categorías & CRUD de Etiquetas.
- [x] Recurso: Blog - Lista de Artículos (Paginada, Filtrable, Buscable).
- [x] Recurso: Blog - Formulario de Artículo Parte A (Título, Contenido/Tiptap, Portada).
- [x] Recurso: Blog - Formulario de Artículo Parte B (Categoría, Estado, Etiquetas Multiselect).
- [x] Recurso: Blog - Formulario de Artículo Parte C (Galería de Imágenes con Arrastrar y Soltar).
- [x] Recurso: Vistas públicas de Artículos (Lista y Detalle).
- [x] Recurso: Botón de vista previa en la tabla de Admin.
- [x] Recurso: Slug automático y editable en artículos.

---

## [2026-02-28] - Core System Implementation

### Backend
- Initialized Laravel 11 API with MySQL.
- Configured Sanctum for token-based authentication.
- Implemented Full CRUDs for `Users`, `Roles`, and `Permissions`.
- Implemented Many-to-Many relationships:
    - `role_user`: Assign multiple roles to a user.
    - `permission_role`: Assign multiple permissions to a role.
- Advanced API: Pagination, Global Search, Advanced Filters, and Dynamic Sorting.
- Custom Seeders for Admin users, 20 test users, and basic permissions.
- **Authorization:** Implemented dynamic Gates and `CheckPermission` middleware.
- **Localization:** Full-stack i18n with `Accept-Language` header detection.
- **Media:** Integrated `spatie/laravel-medialibrary` for file management.
- **Audit:** Integrated `spatie/laravel-activitylog` for automated audit trails.

### Frontend
- Initialized React (Vite) with Tailwind CSS v4 and PostCSS.
- Integrated **shadcn/ui** with a professional Dashboard Sidebar layout.
- Implemented **Fintech Premium Style**: Deep Navy palette, Cyan acents, and Glassmorphism.
- Implemented **Dark/Light Mode** switching with persistence.
- Implemented **Internationalization (i18n)** with English and Spanish support.
- Created a `LanguageToggle` component to switch languages on the fly.
- Refactored all main views (Login, Users, Roles, Permissions) and the Sidebar to use translation hooks.
- Implemented global **Sonner** notifications for all actions.
- Built sophisticated CRUD interfaces for Users, Roles, and Permissions:
    - Interactive tables with Pagination, Sorting, and Search.
    - Collapsible Advanced Search panels.
    - Forms with dynamic Role/Permission assignment using Checkboxes.
- **Media Upload:** Integrated `react-easy-crop` for avatar processing.
- **Audit UI:** Created Activity Logs browser with pagination.
- **Dashboard:** Connected to real-time database statistics.
- **Profile:** Built dedicated user profile management with password security toggle.

### Progress
- [x] Create project structure and context.
- [x] Backend API: Auth & Sanctum setup.
- [x] Frontend UI: Theme, Sidebar, and Notifications.
- [x] Feature: Users CRUD (Paginated, Filterable, Searchable).
- [x] Feature: Roles & Permissions CRUD.
- [x] Feature: RBAC (Role-Based Access Control) assignment UI.
- [x] UI Polish: Centered Layout, Padding, and Stable Table Loading.
- [x] Feature: Internationalization (i18n) support (EN/ES).
- [x] Integration: Authorization Middleware (Frontend & Backend gates).
- [x] Integration: Full-stack localization (Laravel + React).
- [x] Feature: Media System (Avatar Upload & Crop).
- [x] Feature: Activity Logs & Audit Trail.
- [x] Feature: Real-time Dashboard Statistics.

## [2026-03-06] - Feature: Business Info & Article Form Enhancements

### Backend
- Nuevo endpoint público `/api/public/business-info` para info de contacto y redes sociales
- Seeder `BusinessSettingsSeeder` con 10 campos (phone, email, address, hours, whatsapp, facebook, instagram, linkedin, youtube, tiktok)
- Dashboard stats: cambio de roles/permissions a solo users/posts

### Frontend - Admin Panel
- Nueva sección "Info de negocio" en Configuraciones
- Componente `BusinessInfoSettings.jsx` para gestionar datos de contacto
- Tema light: mayor contraste (background 96%, muted 88%, borders 80%)
- Logout: confirmación con AlertDialog antes de cerrar sesión
- Profile: muestra roles del usuario con badges
- Dashboard: cards traducidas (Active User, Total Users, Total Posts)
- RichTextEditor: fondo blanco para simular blog real

### Frontend - Article Form
- Layout reorganizado:
  - Card 1: Título, Slug, Categoría, Etiquetas y Contenido
  - Card 2: Imágenes (Cover + Galería)
  - Card 3: Estado, Orden, Destacado (sin label)
- Ancho completo (sin max-w-4xl)
- Gallery: sin mensaje de "no hay imágenes"
- Traducciones completadas (select_category, title_placeholder, content_placeholder, etc.)

### Traducciones
- ES/EN: dashboard.welcome, dashboard.subtitle, dashboard.active_user, dashboard.total_users, dashboard.total_posts
- ES/EN: articles.select_category, articles.title_placeholder, articles.content_placeholder
- ES/EN: articles.order, articles.featured, articles.advanced_options

---

## [2026-03-06] - Feature: Dynamic Frontend Business Info

### Web Frontend
- [x] 1. Modificar `web/app/layout.tsx` para obtener `businessInfo` y pasarlo al `Navbar`.
- [x] 2. Actualizar `web/components/Navbar.tsx` para aceptar `businessInfo` y mostrar datos dinámicos si es necesario.
- [x] 3. Actualizar `web/components/sections/Home/ContactSection.tsx`:
    - [x] Hacer dinámicos Email, Teléfono y Dirección.
    - [x] Implementar iconos de redes sociales condicionales (WhatsApp, IG, FB, LinkedIn, etc.).
- [x] 4. Crear `web/components/ui/FloatingWhatsApp.tsx` e integrarlo en el `RootLayout`.
- [x] 5. Mejorar metadatos en `layout.tsx` usando la información del backend.

- [x] Fix hardcoded baseURL in frontend/src/lib/axios-public.js to use VITE_API_URL fallback

---
