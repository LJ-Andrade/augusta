# DEVLOG - Listados Uniformes (Patrón shadcn)

## Completed Features

- [x] 1. Refactorizar ChatbotsList con búsqueda, filtros, paginación, sorting, bulk
- [x] 2. Agregar dropdown mobile para acciones en ProductsList
- [x] 3. Actualizar CustomersList al estilo shadcn puro
- [x] 4. Agregar bulkDelete endpoint en ChatbotController

### Patrón aplicado a todos los listados:
- Card simple shadcn (sin decoraciones)
- Búsqueda con debounce
- Filtros Collapsible
- Sorting por columnas
- Paginación completa
- Bulk delete con checkboxes
- Acciones inline en desktop, dropdown en mobile (lg breakpoint)

---

# DEVLOG - Chatbot Form Responsiveness

## Completed Features

- [x] 1. Fix mobile layout: single column below 1024px
- [x] 2. Add padding p-4 to main container for mobile
- [x] 3. Adjust gaps: gap-4 for mobile, gap-6 for lg
- [x] 4. Configuration cards: 1 col < xl, 3 col ≥ xl (1280px)

---

# DEVLOG - QR Codes y System Settings

## Implementation Checklist

### BACKEND

- [x] 1. Crear migración para tabla system_settings
- [x] 2. Crear modelo SystemSetting con métodos get(), set(), all()
- [x] 3. Crear SystemSettingResource para API
- [x] 4. Crear SystemSettingsController con endpoints CRUD
- [x] 5. Agregar rutas api para system-settings en api.php
- [x] 6. Agregar campo qr_url a migración de products (si no existe)
- [x] 7. Agregar qr_url al modelo Product en $fillable
- [x] 8. Agregar método generateQrUrl() al modelo Product
- [x] 9. Actualizar método boot del modelo Product para generar QR al crear
- [x] 10. Agregar qr_url a ProductResource

### FRONTEND

- [x] 11. Instalar librería qrcode.react
- [x] 12. Crear ProductsShow.jsx con QR display
- [x] 13. Crear SettingsList.jsx para site_url
- [x] 14. Agregar ruta /products/:id en App.jsx
- [x] 15. Agregar ruta /settings en App.jsx
- [x] 16. Agregar Settings al sidebar
- [x] 17. Agregar traducciones en es.json
- [x] 18. Agregar traducciones en en.json

---

# DEVLOG - Login Redesign

## Completed Features

- [x] 1. Rediseño de página de login con glassmorphism
- [x] 2. Título VADMIN3 con gradiente cyan-teal-blue
- [x] 3. Fondo con efecto espacio: 80 estrellas
- [x] 4. Estrellas con animación de flotación
- [x] 5. Estrellas con bloom (glow) - ~20%
- [x] 6. Interacción: estrellas se separan al pasar mouse
- [x] 7. Fondo: gradiente oscuro arriba, más claro abajo
- [x] 8. Card: azul oscuro con blur y borde cyan
- [x] 9. Inputs estilizados para tema oscuro
- [x] 10. Checkbox Recordarme
- [x] 11. Link ¿Olvidaste tu contraseña?
- [x] 12. Botón con gradiente cyan-blue
- [x] 13. Traducciones agregado (es/en)

## UI/UX Improvements

- [x] Custom scrollbar más discreto para sidebar

---

# DEVLOG - Sistema de Configuración de Imágenes

## Completed Features

### BACKEND

- [x] 1. Crear migración `image_settings` table
- [x] 2. Crear modelo ImageSetting con métodos de validación
- [x] 3. Crear ImageValidationService
- [x] 4. Crear ImageSettingsController con endpoints CRUD
- [x] 5. Crear ImageSettingResource para API
- [x] 6. Agregar rutas API para image-settings
- [x] 7. Integrar validación en PostController (Blog)
- [x] 8. Validación dinámica según configuración (tamaño, extensiones, dimensiones, aspect ratio)

### FRONTEND

- [x] 1. Crear ImageSettings.jsx con formulario de configuración
- [x] 2. Crear BlogSettings.jsx - página unificada de configuración del Blog
- [x] 3. Crear ProductSettings.jsx - página de configuración de Productos
- [x] 4. Crear hook useImageValidation.jsx para validación cliente
- [x] 5. Agregar rutas /blog-settings, /product-settings en App.jsx
- [x] 6. Menú horizontal en páginas de configuración
- [x] 7. Selector de tamaño de imagen con opciones predefinidas
- [x] 8. UI con tabs para seleccionar sección (portada/galería)

### SIDEBAR REORGANIZATION

- [x] 1. Agregar "AutoBlog" directamente en menú Blog
- [x] 2. Agregar "Configuraciones" como submenú en Blog y Productos
- [x] 3. Crear grupo "Configuraciones" general abajo del perfil
- [x] 4. Páginas de configuración con menús horizontales

### TRANSLATIONS

- [x] 1. Agregar traducciones en es.json para image_settings
- [x] 2. Agregar traducciones en en.json
- [x] 3. Agregar traducciones para blog_settings y product_settings

## Database Schema - image_settings

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | Primary key |
| section | varchar(255) | Identificador único (blog_cover, blog_gallery, etc.) |
| name | varchar(255) | Nombre para mostrar |
| max_size_kb | integer | Tamaño máximo en KB |
| allowed_extensions | varchar(255) | Extensiones permitidas separadas por coma |
| min_width | integer (nullable) | Ancho mínimo en px |
| min_height | integer (nullable) | Alto mínimo en px |
| max_width | integer (nullable) | Ancho máximo en px |
| max_height | integer (nullable) | Alto máximo en px |
| aspect_ratio | varchar(50) (nullable) | Ratio (16:9, 4:3, etc.) |
| active | boolean | Si las validaciones están activas |
| timestamps | timestamps | created_at, updated_at |

## API Endpoints

- `GET /api/image-settings` - Listar todas las configuraciones
- `GET /api/image-settings/{section}` - Obtener config por sección
- `POST /api/image-settings` - Crear configuración
- `PUT /api/image-settings/{id}` - Actualizar configuración
- `DELETE /api/image-settings/{id}` - Eliminar configuración

## Secciones de Imagen

- `blog_cover` - Imagen de portada del Blog
- `blog_gallery` - Galería de imágenes del Blog
- `product_cover` - Imagen de portada de Productos
- `product_gallery` - Galería de imágenes de Productos

---

# DEVLOG - Checkpoint Marzo 2026

## Completed Features

### Project Restructure
- [x] 1. Remove legacy `frontend/` directory (consolidated into `adminpanel/`)
- [x] 2. Update adminpanel index.html with new favicon
- [x] 3. Clean up unused vite.svg assets

### Admin Panel UI Improvements
- [x] 4. Enhanced app-sidebar with new navigation structure
- [x] 5. Unified list view components across all modules
- [x] 6. Activity logs list improvements
- [x] 7. Articles list view updates
- [x] 8. Categories list view updates
- [x] 9. Permissions management list updates
- [x] 10. Product categories list improvements
- [x] 11. Product tags list improvements
- [x] 12. Products list view enhancements
- [x] 13. Roles management list updates
- [x] 14. Tags management list updates
- [x] 15. Users management list improvements

### Backend Updates
- [x] 16. PostController modifications and improvements

## Changes Summary

**Files Modified:** 12
**Files Deleted:** 93 (frontend/ directory cleanup)
**Files Added:** 1 (adminpanel/public/favicon.svg)

### Affected Modules
- Blog (Articles, Categories, Tags)
- Products (Products, Categories, Tags)
- User Management (Users, Roles, Permissions)
- Activity Logs
- Admin Panel Core (Sidebar, Layout)

---

*Last updated: March 5, 2026*
