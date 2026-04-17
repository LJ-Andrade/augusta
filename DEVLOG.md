# Development Plan - E-Commerce Web

1. [x] `web`: Create Next.js Commerce application inside `web/` using Vercel template.
2. [x] `admin/config/cors.php`: Configure CORS in VADMIN to allow requests from e-commerce domain.
3. [x] `admin/database/migrations/xxxx_create_orders_table.php`: Create Orders migration in VADMIN.
4. [x] `admin/database/migrations/xxxx_create_order_items_table.php`: Create OrderItems migration.
5. [x] `admin/app/Models/Order.php`: Create Order Model in VADMIN.
6. [x] `admin/app/Models/OrderItem.php`: Create OrderItem Model in VADMIN.
7. [x] `admin/app/Http/Controllers/Api/OrderController.php`: Create REST endpoints for creating and viewing Orders.
8. [x] `admin/app/Http/Controllers/Api/CustomerAuthController.php`: Create Auth endpoints for Customer Login & Register.
9. [x] `admin/routes/api.php`: Register new API routes for auth, products, and orders.
10. [ ] `web/lib/vadmin/index.ts`: Implement Next.js Commerce custom provider data fetching (Products, Collections).
11. [ ] `web/lib/vadmin/auth.ts`: Implement Auth fetching logic (Login, Register).
12. [ ] `web/components/cart/actions.ts`: Adapt cart logic to use VADMIN custom provider.
13. [ ] `web/.env.local`: Add ENV variables pointing to VADMIN API.
14. [x] `admin/frontend/src/components/dashboard-layout.jsx`: Implement Dark Mode switch in user dropdown.
15. [x] `admin/backend/database/migrations/..._create_product_variants_table.php`: Add min_stock.
16. [x] `admin/backend/app/Models/ProductVariant.php`: Update fillable and casts.
17. [x] `admin/frontend/src/views/products/ProductForm.jsx`: Add min_stock fields to variants table.
18. [x] `admin/frontend/src/i18n/locales/*.json`: Add translations for min/max stock.

