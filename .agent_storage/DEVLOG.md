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
