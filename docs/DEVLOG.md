# Development Checklist (DEVLOG)

This document tracks execution steps. One task per logical unit.

## Phase 2: Definition (Completed)
- [x] Review initial requirements / `augusta-specs.txt`.
- [x] Create initial `SPECS.md` proposing the Data Contracts.
- [x] User approve Option B (Product Variants) and Professional eCommerce features.

## Phase 3: Planning (Next)
Once SPECS are approved, the actionable checklist will be expanded.

### Step 1: Backend Setup
- [x] Create `ProductCategory` Model, Migration, Factory, Setup Controller & Routes (Differentiating from Blog Category)
- [ ] Create `Color` Model, Migration, Factory, Setup Controller & Routes
- [ ] Create `Size` Model, Migration, Factory, Setup Controller & Routes
- [ ] Create `Tag` Model, Migration, Factory, Setup Controller & Routes
- [ ] Create `Coupon` Model, Migration, Factory, Setup Controller & Routes
- [ ] Create `Product` Model, Migration, Factory, FormRequests, Resource, Controller & Routes
- [ ] Create `ProductVariant` Model, Migration, Factory, Setup Controller & Routes
- [ ] Setup relationships (Pivots/HasMany: `Product` HasMany `ProductVariant`, `ProductCategory` HasMany `Product` etc.)
- [ ] Implement Image handling (Spatie Media Library or basic Storage) for `Product` (thumb/gallery) and `ProductVariant` (image).

### Step 2: Frontend API Integration
- [x] Setup Axios service for `ProductCategory`
- [ ] Setup Axios service for Products

### Step 3: Admin UI Construction
- [ ] Build Taxonomy CRUD
  - [x] Product Categories CRUD
- [ ] Build Products CRUD
  - [ ] Product List Table (Pagination, Filters)
  - [ ] Product Form (Draft vs Published statuses, SEO fields)
  - [ ] Media Uploader Component (Thumb + Gallery)
  - [ ] Taxonomy selectors (Categories, Tags)
  - [ ] **Variant Manager Interface**: UI to generate and edit `ProductVariants` (assigning colors, sizes, SKUs, and stock).

## Phase 4: E-commerce Integration (Current)
- [x] `web`: Create Next.js Commerce application inside `web/` using Vercel template.
- [x] `admin/config/cors.php`: Configure CORS in VADMIN to allow requests from e-commerce domain.
- [x] `admin/database/migrations/xxxx_create_orders_table.php`: Create Orders migration in VADMIN.
- [x] `admin/database/migrations/xxxx_create_order_items_table.php`: Create OrderItems migration.
- [x] `admin/app/Models/Order.php`: Create Order Model in VADMIN.
- [x] `admin/app/Models/OrderItem.php`: Create OrderItem Model in VADMIN.
- [x] `admin/app/Http/Controllers/Api/OrderController.php`: Create REST endpoints for creating and viewing Orders.
- [x] `admin/app/Http/Controllers/Api/CustomerAuthController.php`: Create Auth endpoints for Customer Login & Register.
- [x] `admin/routes/api.php`: Register new API routes for auth, products, and orders.
- [ ] `web/lib/vadmin/index.ts`: Implement Next.js Commerce custom provider data fetching (Products, Collections).
- [ ] `web/lib/vadmin/auth.ts`: Implement Auth fetching logic (Login, Register).
- [ ] `web/components/cart/actions.ts`: Adapt cart logic to use VADMIN custom provider.
- [ ] `web/.env.local`: Add ENV variables pointing to VADMIN API.
- [x] `admin/frontend/src/components/dashboard-layout.jsx`: Implement Dark Mode switch in user dropdown.
- [x] `admin/backend/database/migrations/..._create_product_variants_table.php`: Add min_stock.
- [x] `admin/backend/app/Models/ProductVariant.php`: Update fillable and casts.
- [x] `admin/frontend/src/views/products/ProductForm.jsx`: Add min_stock fields to variants table.
- [x] `admin/frontend/src/i18n/locales/*.json`: Add translations for min/max stock.
- [x] `web` & `admin/frontend`: Update `baseline-browser-mapping` and clear Next.js cache.

## Phase 5: Maintenance Mode & Shopify Deprecation (Completed)
- [x] `web/app/maintenance/page.tsx`: Create a premium maintenance page.
- [x] `web/lib/vadmin/index.ts`: Update `vadminFetch` to detect connection errors and redirect to `/maintenance`.
- [x] `web/app/(store)`: Isolate store routes to prevent redirect loops on maintenance.
- [x] `web/lib/vadmin`: Complete migration of legacy Shopify references (getPage, sitemaps, OG images).
- [x] `docs/SPECS.md` & `web/README.md`: Document VADMIN as the official backend provider.
- [x] `web`: Validate project with `npm run build`.

## Phase 6: Aesthetic Refinement (In Progress)
- [ ] `web/app/globals.css`: Implement `--pb-radius` token and global styles for `img` and `button`.
- [ ] `web/components/grid/tile.tsx`: Standardize border radius for product tiles.
- [ ] `web/components/product/gallery.tsx`: Apply border radius to gallery images and thumbnail buttons.
- [x] `web/app/(store)/checkout`: Implement full checkout page with shipping/payment selection.
- [x] `web/components/checkout`: Create checkout UI components (Form, Summary, Method Selector).
- [x] `web/lib/vadmin/methods.ts`: Implement delivery/payment methods fetching.
