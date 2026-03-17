# Technical Specifications - Coupon Module

> **Reference**: Follow the pattern of ProductSize/ProductColor module

---

## 1. Data Contract (API)

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/coupons` | List all coupons (paginated) |
| GET | `/api/coupons?all=1` | List all coupons (no pagination) |
| GET | `/api/coupons/{id}` | Get single coupon |
| POST | `/api/coupons` | Create coupon |
| PUT | `/api/coupons/{id}` | Update coupon |
| DELETE | `/api/coupons/{id}` | Delete coupon |
| POST | `/api/coupons/bulk-delete` | Bulk delete coupons |

### Request/Response

**GET /api/coupons (List)**
```json
{
  "data": [
    {
      "id": 1,
      "code": "DESCUENTO20",
      "discount_type": "percentage",
      "amount": 20,
      "expires_at": "2026-12-31T23:59:59Z",
      "active": true,
      "created_at": "2026-03-14T10:00:00Z",
      "updated_at": "2026-03-14T10:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 10,
    "total": 1
  }
}
```

**POST /api/coupons (Create)**
```json
// Request
{
  "code": "DESCUENTO20",
  "discount_type": "percentage",
  "amount": 20,
  "expires_at": "2026-12-31",
  "active": true
}

// Response (201)
{
  "data": {
    "id": 1,
    "code": "DESCUENTO20",
    "discount_type": "percentage",
    "amount": 20,
    "expires_at": "2026-12-31T23:59:59Z",
    "active": true,
    "created_at": "2026-03-14T10:00:00Z",
    "updated_at": "2026-03-14T10:00:00Z"
  }
}
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by code |
| `filter_id` | integer | Filter by ID |
| `filter_code` | string | Filter by code |
| `filter_active` | boolean | Filter by active status |
| `sort_by` | string | Sort field (id, code, amount, expires_at, created_at) |
| `sort_dir` | string | Sort direction (asc, desc) |
| `all` | boolean | Return all records without pagination |

---

## 2. Database Schema

### Migration: coupons

```php
// File: backend/database/migrations/YYYY_MM_DD_HHMMSS_create_coupons_table.php
Schema::create('coupons', function (Blueprint $table) {
    $table->id();
    $table->string('code')->unique();
    $table->enum('discount_type', ['percentage', 'fixed']);
    $table->decimal('amount', 10, 2);
    $table->timestamp('expires_at')->nullable();
    $table->boolean('active')->default(true);
    $table->timestamps();
});
```

### Model: Coupon

```php
// File: backend/app/Models/Coupon.php
class Coupon extends Model
{
    protected $fillable = ['code', 'discount_type', 'amount', 'expires_at', 'active'];
    
    protected $casts = [
        'expires_at' => 'datetime',
        'active' => 'boolean',
        'amount' => 'decimal:2',
    ];
}
```

---

## 3. Backend Components

### Controller: CouponController

- Follow same pattern as `ProductSizeController`
- Endpoints: index, store, show, update, destroy, bulkDelete
- Validation: 
  - `code` required, string, max 50, unique
  - `discount_type` required, enum (percentage, fixed)
  - `amount` required, numeric, min 0
  - `expires_at` nullable, date
  - `active` nullable, boolean

### API Resource: CouponResource

```php
// File: backend/app/Http/Resources/CouponResource.php
class CouponResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'discount_type' => $this->discount_type,
            'amount' => $this->amount,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'active' => $this->active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

---

## 4. Frontend Components

### Routes (App.jsx)

```jsx
import CouponList from './views/coupons/CouponList';
import CouponForm from './views/coupons/CouponForm';

// Add routes:
<Route path="/coupons" element={<CouponList />} />
<Route path="/coupons/create" element={<CouponForm />} />
<Route path="/coupons/edit/:id" element={<CouponForm />} />
```

### Sidebar (app-sidebar.jsx)

```jsx
{
  url: "/coupons",
  title: t('coupons.title') || 'Cupones',
  icon: Ticket,
}
```

### i18n Keys

Add to translation files:
```json
{
  "coupons": {
    "title": "Cupones",
    "create": "Crear Cupón",
    "create_title": "Crear Cupón",
    "editing": "Editando cupón",
    "code": "Código",
    "code_placeholder": "Ej: DESC20",
    "discount_type": "Tipo de descuento",
    "discount_type_percentage": "Porcentaje",
    "discount_type_fixed": "Monto fijo",
    "amount": "Monto",
    "amount_placeholder": "Ej: 20",
    "expires_at": "Fecha de vencimiento",
    "active": "Activo",
    "search_placeholder": "Buscar cupones...",
    "delete_success": "Cupón eliminado correctamente",
    "delete_error": "Error al eliminar el cupón",
    "create_success": "Cupón creado correctamente",
    "create_error": "Error al crear el cupón",
    "update_success": "Cupón actualizado correctamente",
    "update_error": "Error al actualizar el cupón"
  }
}
```

### List View: CouponList.jsx

**Location**: `frontend/src/views/coupons/CouponList.jsx`

- Follow pattern from `ProductSizesList.jsx`
- Use `useCrudList` hook with endpoint `coupons`
- Columns: id, code, discount_type (badge), amount, expires_at, active (toggle), created_at
- Filter keys: `search`, `filter_id`, `filter_code`, `filter_active`

### Form: CouponForm.jsx

**Location**: `frontend/src/views/coupons/CouponForm.jsx`

- Follow pattern from `ProductSizeForm.jsx`
- Schema:
  - `code`: required string, max 50
  - `discount_type`: required enum (percentage, fixed)
  - `amount`: required number, min 0
  - `expires_at`: optional date
  - `active`: optional boolean
- Fields:
  - `code`: Input text (uppercase)
  - `discount_type`: Select (percentage/fixed)
  - `amount`: Input number
  - `expires_at`: Input date
  - `active`: Switch/Checkbox

---

## 5. Acceptance Criteria

- [ ] Migration creates `coupons` table
- [ ] Coupon model exists
- [ ] CouponController has full CRUD
- [ ] CouponResource returns correct JSON
- [ ] Frontend routes work: /coupons, /coupons/create, /coupons/edit/:id
- [ ] CouponList displays all coupons with pagination
- [ ] CouponForm creates and edits coupons
- [ ] Discount type and amount work correctly
- [ ] Expiration date is optional and works correctly
- [ ] Active toggle works correctly

> **Reference**: Follow the pattern of ProductColor module

---

## 1. Data Contract (API)

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/product-sizes` | List all sizes (paginated) |
| GET | `/api/product-sizes?all=1` | List all sizes (no pagination) |
| GET | `/api/product-sizes/{id}` | Get single size |
| POST | `/api/product-sizes` | Create size |
| PUT | `/api/product-sizes/{id}` | Update size |
| DELETE | `/api/product-sizes/{id}` | Delete size |
| POST | `/api/product-sizes/bulk-delete` | Bulk delete sizes |

### Request/Response

**GET /api/product-sizes (List)**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Small",
      "created_at": "2026-03-14T10:00:00Z",
      "updated_at": "2026-03-14T10:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 10,
    "total": 1
  }
}
```

**POST /api/product-sizes (Create)**
```json
// Request
{
  "name": "Large"
}

// Response (201)
{
  "data": {
    "id": 2,
    "name": "Large",
    "created_at": "2026-03-14T10:00:00Z",
    "updated_at": "2026-03-14T10:00:00Z"
  }
}
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name |
| `filter_id` | integer | Filter by ID |
| `filter_name` | string | Filter by name |
| `sort_by` | string | Sort field (id, name, created_at) |
| `sort_dir` | string | Sort direction (asc, desc) |
| `all` | boolean | Return all records without pagination |

---

## 2. Database Schema

### Migration: product_sizes

```php
// File: backend/database/migrations/YYYY_MM_DD_HHMMSS_create_product_sizes_table.php
Schema::create('product_sizes', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->timestamps();
});
```

### Migration: product_product_size (Pivot Table)

```php
// File: backend/database/migrations/YYYY_MM_DD_HHMMSS_create_product_product_size_table.php
Schema::create('product_product_size', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')->constrained()->onDelete('cascade');
    $table->foreignId('product_size_id')->constrained('product_sizes')->onDelete('cascade');
    $table->timestamps();
    
    $table->unique(['product_id', 'product_size_id']);
});
```

### Model: ProductSize

```php
// File: backend/app/Models/ProductSize.php
class ProductSize extends Model
{
    protected $fillable = ['name'];
    
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_product_size', 'product_size_id', 'product_id');
    }
}
```

### Model: Product (Add Relationship)

```php
// File: backend/app/Models/Product.php
// Add to existing relationships:
public function sizes(): BelongsToMany
{
    return $this->belongsToMany(ProductSize::class, 'product_product_size', 'product_id', 'product_size_id');
}
```

---

## 3. Backend Components

### Controller: ProductSizeController

- Follow same pattern as `ProductColorController`
- Endpoints: index, store, show, update, destroy, bulkDelete
- Validation: `name` required, string, max 255

### API Resource: ProductSizeResource

```php
// File: backend/app/Http/Resources/ProductSizeResource.php
class ProductSizeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

---

## 4. Frontend Components

### Routes (App.jsx)

```jsx
import ProductSizesList from './views/product-sizes/ProductSizesList';
import ProductSizeForm from './views/product-sizes/ProductSizeForm';

// Add routes:
<Route path="/product-sizes" element={<ProductSizesList />} />
<Route path="/product-sizes/create" element={<ProductSizeForm />} />
<Route path="/product-sizes/edit/:id" element={<ProductSizeForm />} />
```

### Sidebar (app-sidebar.jsx)

```jsx
{
  url: "/product-sizes",
  title: t('product_sizes.title') || 'Talles',
  icon: Ruler,
}
```

### i18n Keys

Add to translation files:
```json
{
  "product_sizes": {
    "title": "Talles",
    "create": "Crear Talle",
    "create_title": "Crear Talle",
    "editing": "Editando talle",
    "name": "Nombre",
    "name_placeholder": "Ej: Large",
    "search_placeholder": "Buscar talles...",
    "delete_success": "Talle eliminado correctamente",
    "delete_error": "Error al eliminar la talla",
    "create_success": "Talle creada correctamente",
    "create_error": "Error al crear la talla",
    "update_success": "Talle actualizada correctamente",
    "update_error": "Error al actualizar la talla"
  }
}
```

### List View: ProductSizesList.jsx

**Location**: `frontend/src/views/product-sizes/ProductSizesList.jsx`

- Follow pattern from `ProductColorsList.jsx`
- Use `useCrudList` hook with endpoint `product-sizes`
- Columns: id, name, created_at
- No custom render needed (simple list like tags)
- Filter keys: `search`, `filter_id`, `filter_name`

### Form: ProductSizeForm.jsx

**Location**: `frontend/src/views/product-sizes/ProductSizeForm.jsx`

- Follow pattern from `ProductColorForm.jsx`
- Schema: `name` required string
- Fields:
  - `name`: Input text
- No color picker (unlike ProductColor)

---

## 5. Integration with ProductForm

### Update ProductForm.jsx

1. Add state for sizes:
```jsx
const [sizes, setSizes] = useState([]);
```

2. Fetch sizes on mount:
```jsx
const [sizesRes] = await Promise.all([
    axiosClient.get("product-sizes?all=1")
]);
setSizes(sizesRes.data.data || []);
```

3. Add form field for size_ids:
```jsx
<FormField
    control={form.control}
    name="size_ids"
    render={({ field }) => (
        <FormItem>
            <FormLabel>{t('products.sizes')}</FormLabel>
            <FormControl>
                <MultiSelect
                    value={field.value || []}
                    onValueChange={field.onChange}
                    options={sizes}
                    placeholder={t('products.select_sizes')}
                />
            </FormControl>
            <FormMessage />
        </FormItem>
    )}
/>
```

4. Add to formSchema:
```jsx
size_ids: z.array(z.number()).default([]),
```

5. Add to form defaultValues:
```jsx
size_ids: [],
```

6. Add to formData submission:
```jsx
values[key].forEach((sizeId) => formData.append('size_ids[]', sizeId));
```

7. Load existing sizes on edit:
```jsx
size_ids: data.data.sizes?.map(size => size.id) || [],
```

### Update Product API Resource

Add sizes to ProductResource response:
```php
'sizes' => SizeResource::collection($this->whenLoaded('sizes')),
```

---

## 6. Permissions

Add to permissions system:
- `manage product sizes` - Full CRUD access

---

## 7. Acceptance Criteria

- [ ] Migration creates `product_sizes` table
- [ ] Migration creates `product_product_size` pivot table
- [ ] ProductSize model exists with `products()` relationship
- [ ] Product model has `sizes()` relationship
- [ ] ProductSizeController has full CRUD
- [ ] ProductSizeResource returns correct JSON
- [ ] Frontend routes work: /product-sizes, /product-sizes/create, /product-sizes/edit/:id
- [ ] ProductSizesList displays all sizes with pagination
- [ ] ProductSizeForm creates and edits sizes
- [ ] ProductForm integrates sizes via MultiSelect
- [x] ProductForm integrates sizes via MultiSelect
- [x] Sizes are saved/loaded correctly with products

---

# Technical Specifications - Products & Variants Module

## 1. Data Contract (API)

### Endpoints (Products with Variants)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/{id}` | Get product with variants, colors, and sizes |
| POST | `/api/products` | Create product and its variants |
| PUT | `/api/products/{id}` | Update product and sync variants |

### Request/Response (Variants)

**POST /api/products (Partial sample for variants)**
```json
{
  "name": "Product Name",
  "variants": [
    {
      "product_color_id": 1,
      "product_size_id": 2,
      "sku": "PROD-RED-M",
      "stock": 10,
      "price": 1500.00,
      "active": true
    }
  ]
}
```

---

## 2. Database Schema

### Migration: product_variants

```php
// File: backend/database/migrations/YYYY_MM_DD_HHMMSS_create_product_variants_table.php
Schema::create('product_variants', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')->constrained()->onDelete('cascade');
    $table->foreignId('product_color_id')->nullable()->constrained('product_colors')->onDelete('set null');
    $table->foreignId('product_size_id')->nullable()->constrained('product_sizes')->onDelete('set null');
    $table->string('sku')->unique()->nullable();
    $table->integer('stock')->default(0);
    $table->decimal('price', 15, 2)->nullable(); // Overrides product price if set
    $table->boolean('active')->default(true);
    $table->timestamps();
});
```

### Migration: product_product_color (Pivot Table)

```php
// File: backend/database/migrations/YYYY_MM_DD_HHMMSS_create_product_product_color_table.php
Schema::create('product_product_color', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')->constrained()->onDelete('cascade');
    $table->foreignId('product_color_id')->constrained('product_colors')->onDelete('cascade');
    $table->timestamps();
    
    $table->unique(['product_id', 'product_color_id']);
});
```

### Model: Product (Relationships)

```php
// File: backend/app/Models/Product.php
public function colors(): BelongsToMany
{
    return $this->belongsToMany(ProductColor::class, 'product_product_color', 'product_id', 'product_color_id');
}

public function variants(): HasMany
{
    return $this->hasMany(ProductVariant::class);
}
```

---

## 3. Frontend Components

### i18n Keys (Products/Variants)

```json
{
  "products": {
    "variants_title": "Variantes y Stock",
    "generate_variants": "Generar Variantes",
    "stock": "Stock",
    "sku": "SKU",
    "price_override": "Precio Unitario",
    "no_variants": "No hay variantes generadas",
    "variant_combination": "Combinación",
    "apply_to_all_price": "Mismo precio a todos",
    "apply_to_all_stock": "Misma cantidad a todos"
  }
}
```

### Updated Form: ProductForm.jsx

1. **Matrix logic**:
   - Watch `color_ids` and `size_ids`.
   - Function `generateVariants()`: Creates Cartesian product of colors and sizes.
   - Preserves existing variant data (stock/SKU) when regenerating if possible.

2. **UI for Variants**:
   - Table displaying rows of variants.
   - Inputs for Stock, SKU, and Price.
   - Switches for Active status.

---

## 4. Acceptance Criteria

- [ ] Migration for `product_variants` exists and is applied.
- [ ] Migration for `product_product_color` pivot exists and is applied.
- [ ] `Product` model has `colors()` and `variants()` relations.
- [ ] `ProductForm.jsx` allows selecting colors.
- [ ] `ProductForm.jsx` displays variants matrix with stock/price/SKU inputs.
- [ ] Saving product correctly syncs variants (Create/Update/Delete).
- [ ] Individual stock is correctly saved in `product_variants`.
