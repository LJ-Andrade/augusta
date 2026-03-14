# Technical Specification: Product Tags Enhancement

## 1. Overview

**Objective:** Align the Product Tags section with the Product Categories implementation to provide a consistent user experience, including bulk operations, advanced filtering, and standardized UI components.

**Scope:** Backend API enhancements and Frontend UI/UX improvements for the tags management module.

---

## 2. Backend Changes

### 2.1 ProductTagController

#### New Method: `bulkDelete(Request $request)`

**Location:** `backend/app/Http/Controllers/ProductTagController.php`

**Implementation:**
```php
public function bulkDelete(Request $request)
{
    $validated = $request->validate([
        'ids' => 'required|array',
        'ids.*' => 'integer|exists:product_tags,id'
    ]);

    $ids = $validated['ids'];
    $deletedCount = 0;

    DB::transaction(function () use ($ids, &$deletedCount) {
        $deletedCount = ProductTag::whereIn('id', $ids)->delete();
    });

    return response()->json([
        'message' => "{$deletedCount} tags deleted successfully",
        'deleted_count' => $deletedCount
    ]);
}
```

**Parameters:**
- `ids` (required, array): Array of tag IDs to delete
- `ids.*` (integer): Each ID must exist in product_tags table

**Response:**
- Success (200): `{ "message": "X tags deleted successfully", "deleted_count": X }`
- Validation Error (422): `{ "message": "The ids field is required.", "errors": { ... } }`

### 2.2 API Routes

**File:** `backend/routes/api.php`

**Add:**
```php
Route::post('/product-tags/bulk-delete', [ProductTagController::class, 'bulkDelete'])
    ->middleware('auth:sanctum');
```

**Verify existing routes have auth middleware:**
- `GET /api/product-tags` - should use `auth:sanctum`
- `POST /api/product-tags` - should use `auth:sanctum`
- `PUT /api/product-tags/{id}` - should use `auth:sanctum`
- `DELETE /api/product-tags/{id}` - should use `auth:sanctum`

### 2.3 Enhanced `index()` Method

**Current:** Basic listing with optional filtering

**Enhanced:** Add advanced filters matching ProductCategoryController

**Implementation:**
```php
public function index(Request $request)
{
    $query = ProductTag::query();

    // Existing filters
    if ($request->has('search')) {
        $query->where('name', 'like', "%{$request->search}%");
    }

    // New filters
    if ($request->has('filter_id')) {
        $query->where('id', $request->filter_id);
    }

    if ($request->has('filter_name')) {
        $query->where('name', 'like', "%{$request->filter_name}%");
    }

    // Sorting
    $sortField = $request->get('sort_field', 'created_at');
    $sortOrder = $request->get('sort_order', 'desc');
    $query->orderBy($sortField, $sortOrder);

    // Pagination
    $perPage = $request->get('per_page', 15);
    return $query->paginate($perPage);
}
```

**Query Parameters:**
- `search` (string, optional): General search in name
- `filter_id` (integer, optional): Exact ID match
- `filter_name` (string, optional): Partial name match
- `sort_field` (string, optional): Field to sort by (default: created_at)
- `sort_order` (string, optional): asc or desc (default: desc)
- `per_page` (integer, optional): Items per page (default: 15)

---

## 3. Frontend Changes

### 3.1 TagsList.jsx

**File:** `frontend/src/views/product-tags/TagsList.jsx`

#### Imports to Add:
```jsx
import { PageHeader } from '@/components/ui/PageHeader';
import { BulkActionsBar } from '@/components/ui/BulkActionsBar';
import { useBulkSelect } from '@/hooks/useBulkSelect';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
```

#### State Additions:
```jsx
// Existing state
const [tags, setTags] = useState([]);
const [loading, setLoading] = useState(false);

// New state for advanced filters
const [filters, setFilters] = useState({
  filter_id: '',
  filter_name: ''
});
const [showFilters, setShowFilters] = useState(false);

// Bulk selection hook
const {
  selectedIds,
  isSelected,
  toggleSelection,
  toggleAll,
  isAllSelected,
  isIndeterminate,
  clearSelection
} = useBulkSelect(tags, 'id');
```

#### UI Changes:

**Replace header:**
```jsx
// OLD:
<h1 className="text-2xl font-bold">Tags</h1>

// NEW:
<PageHeader 
  title={t('tags.title')}
  breadcrumbs={[
    { label: t('dashboard.title'), href: '/dashboard' },
    { label: t('tags.title') }
  ]}
  actions={
    <Button onClick={() => navigate('/product-tags/create')}>
      <Plus className="mr-2 h-4 w-4" />
      {t('tags.create')}
    </Button>
  }
/>
```

**Add filters section:**
```jsx
{showFilters && (
  <Card className="mb-4">
    <CardContent className="pt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="filter_id">ID</Label>
          <Input
            id="filter_id"
            type="number"
            value={filters.filter_id}
            onChange={(e) => setFilters({ ...filters, filter_id: e.target.value })}
            placeholder={t('filters.id_placeholder')}
          />
        </div>
        <div>
          <Label htmlFor="filter_name">{t('tags.name')}</Label>
          <Input
            id="filter_name"
            value={filters.filter_name}
            onChange={(e) => setFilters({ ...filters, filter_name: e.target.value })}
            placeholder={t('filters.name_placeholder')}
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={handleClearFilters}>
          {t('common.clear')}
        </Button>
        <Button onClick={handleApplyFilters}>
          {t('common.apply')}
        </Button>
      </div>
    </CardContent>
  </Card>
)}
```

**Add BulkActionsBar:**
```jsx
{selectedIds.length > 0 && (
  <BulkActionsBar
    selectedCount={selectedIds.length}
    onClearSelection={clearSelection}
    actions={[
      {
        label: t('common.delete'),
        icon: Trash2,
        variant: 'destructive',
        onClick: handleBulkDelete,
        confirmMessage: t('tags.bulk_delete_confirm', { count: selectedIds.length })
      }
    ]}
  />
)}
```

**Table header with checkbox:**
```jsx
<TableHeader>
  <TableRow>
    <TableHead className="w-12">
      <Checkbox
        checked={isAllSelected}
        indeterminate={isIndeterminate}
        onCheckedChange={toggleAll}
      />
    </TableHead>
    <TableHead>ID</TableHead>
    <TableHead>{t('tags.name')}</TableHead>
    <TableHead>{t('common.created_at')}</TableHead>
    <TableHead className="text-right">{t('common.actions')}</TableHead>
  </TableRow>
</TableHeader>
```

**Table row with checkbox:**
```jsx
<TableRow key={tag.id}>
  <TableCell>
    <Checkbox
      checked={isSelected(tag.id)}
      onCheckedChange={() => toggleSelection(tag.id)}
    />
  </TableCell>
  <TableCell>{tag.id}</TableCell>
  <TableCell>{tag.name}</TableCell>
  <TableCell>{formatDate(tag.created_at)}</TableCell>
  <TableCell className="text-right">
    {/* Action buttons */}
  </TableCell>
</TableRow>
```

#### New Methods:

```jsx
const handleApplyFilters = () => {
  fetchTags({ ...filters, page: 1 });
};

const handleClearFilters = () => {
  setFilters({ filter_id: '', filter_name: '' });
  fetchTags({ page: 1 });
};

const handleBulkDelete = async () => {
  if (!window.confirm(t('tags.bulk_delete_confirm', { count: selectedIds.length }))) {
    return;
  }

  try {
    await axios.post('/api/product-tags/bulk-delete', { ids: selectedIds });
    toast.success(t('tags.bulk_delete_success', { count: selectedIds.length }));
    clearSelection();
    fetchTags();
  } catch (error) {
    toast.error(t('tags.bulk_delete_error'));
  }
};
```

### 3.2 TagForm.jsx

**File:** `frontend/src/views/product-tags/TagForm.jsx`

#### Imports to Add:
```jsx
import { PageHeader } from '@/components/ui/PageHeader';
```

#### Form Submission Change:

**Current:**
```jsx
if (isEditMode) {
  await axios.put(`/api/product-tags/${id}`, values);
} else {
  await axios.post('/api/product-tags', values);
}
```

**New:**
```jsx
if (isEditMode) {
  await axios.post(`/api/product-tags/${id}`, {
    ...values,
    _method: 'PUT'
  });
} else {
  await axios.post('/api/product-tags', values);
}
```

#### PageHeader Integration:

```jsx
<PageHeader
  title={isEditMode ? t('tags.edit_title') : t('tags.create_title')}
  breadcrumbs={[
    { label: t('dashboard.title'), href: '/dashboard' },
    { label: t('tags.title'), href: '/product-tags' },
    { label: isEditMode ? t('tags.edit') : t('tags.create') }
  ]}
/>
```

---

## 4. Data Contracts

### 4.1 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/product-tags | List tags with pagination and filters | Yes |
| POST | /api/product-tags | Create new tag | Yes |
| POST | /api/product-tags/{id} | Update tag (with _method=PUT) | Yes |
| DELETE | /api/product-tags/{id} | Delete single tag | Yes |
| POST | /api/product-tags/bulk-delete | Delete multiple tags | Yes |

### 4.2 Request/Response Examples

#### Bulk Delete Request
```http
POST /api/product-tags/bulk-delete
Content-Type: application/json
Authorization: Bearer {token}

{
  "ids": [1, 2, 3, 4, 5]
}
```

#### Bulk Delete Response (Success)
```json
{
  "message": "5 tags deleted successfully",
  "deleted_count": 5
}
```

#### Bulk Delete Response (Partial - some not found)
```json
{
  "message": "3 tags deleted successfully",
  "deleted_count": 3
}
```

#### Bulk Delete Response (Validation Error)
```json
{
  "message": "The ids field is required.",
  "errors": {
    "ids": ["The ids field is required."]
  }
}
```

#### List Tags with Filters Request
```http
GET /api/product-tags?filter_id=123&filter_name=electronics&sort_field=created_at&sort_order=desc&per_page=15&page=1
Authorization: Bearer {token}
```

#### List Tags Response
```json
{
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z"
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

---

## 5. UI/UX Specifications

### 5.1 TagsList Layout

```
┌─────────────────────────────────────────────────────────────┐
│ PageHeader                                                  │
│ [Breadcrumbs: Dashboard > Tags]            [+ Create Button]│
├─────────────────────────────────────────────────────────────┤
│ [Filters Button] [Search Input]              [Refresh Icon] │
├─────────────────────────────────────────────────────────────┤
│ [Collapsible Filter Card - ID | Name]                       │
│                    [Clear] [Apply]                          │
├─────────────────────────────────────────────────────────────┤
│ BulkActionsBar (shown when selected > 0)                    │
│ 3 items selected [Clear] [Delete Selected]                  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [☐] | ID | Name | Created At | Actions                 │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ [☑] | 1  | Electronics | 2024-01-15 | [Edit] [Delete]  │ │
│ │ [☑] | 2  | Books       | 2024-01-14 | [Edit] [Delete]  │ │
│ │ [☐] | 3  | Clothing    | 2024-01-13 | [Edit] [Delete]  │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ [Prev] Page 1 of 3 [Next]                    [15 per page]  │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Selection States

#### No Selection
- Header checkbox: unchecked
- Row checkboxes: unchecked
- BulkActionsBar: hidden

#### Partial Selection
- Header checkbox: indeterminate (minus icon)
- Some row checkboxes: checked
- BulkActionsBar: visible with count

#### Full Selection (current page)
- Header checkbox: checked
- All visible row checkboxes: checked
- BulkActionsBar: visible with count

#### Mobile Responsive
- Checkboxes always visible
- BulkActionsBar: full width, sticky bottom
- Filter inputs: stacked vertically
- Action buttons: icon only

---

## 6. Error Handling

### 6.1 Backend Errors

#### Validation Errors
```php
// Invalid IDs format
{
  "message": "The ids.0 must be an integer.",
  "errors": {
    "ids.0": ["The ids.0 must be an integer."]
  }
}

// Non-existent IDs (handled gracefully, only delete existing)
// Returns success with actual deleted count
```

#### Database Errors
- Wrap in transaction for atomicity
- Return 500 with generic error message
- Log detailed error server-side

### 6.2 Frontend Error Handling

```jsx
const handleBulkDelete = async () => {
  try {
    const response = await axios.post('/api/product-tags/bulk-delete', { 
      ids: selectedIds 
    });
    
    const { deleted_count } = response.data;
    
    if (deleted_count === 0) {
      toast.warning(t('tags.bulk_delete_none'));
    } else if (deleted_count < selectedIds.length) {
      toast.warning(t('tags.bulk_delete_partial', { 
        deleted: deleted_count, 
        total: selectedIds.length 
      }));
    } else {
      toast.success(t('tags.bulk_delete_success', { count: deleted_count }));
    }
    
    clearSelection();
    fetchTags();
  } catch (error) {
    if (error.response?.status === 422) {
      toast.error(t('tags.validation_error'));
    } else if (error.response?.status === 403) {
      toast.error(t('tags.permission_denied'));
    } else {
      toast.error(t('tags.bulk_delete_error'));
    }
  }
};
```

### 6.3 Error Messages (i18n)

**es.json additions:**
```json
{
  "tags": {
    "bulk_delete_confirm": "¿Estás seguro de que deseas eliminar {count} etiquetas?",
    "bulk_delete_success": "{count} etiquetas eliminadas correctamente",
    "bulk_delete_partial": "{deleted} de {total} etiquetas eliminadas",
    "bulk_delete_none": "No se pudieron eliminar las etiquetas seleccionadas",
    "bulk_delete_error": "Error al eliminar etiquetas",
    "validation_error": "Error de validación. Verifica los datos ingresados.",
    "permission_denied": "No tienes permisos para realizar esta acción"
  }
}
```

**en.json additions:**
```json
{
  "tags": {
    "bulk_delete_confirm": "Are you sure you want to delete {count} tags?",
    "bulk_delete_success": "{count} tags deleted successfully",
    "bulk_delete_partial": "{deleted} of {total} tags deleted",
    "bulk_delete_none": "Could not delete selected tags",
    "bulk_delete_error": "Error deleting tags",
    "validation_error": "Validation error. Please check your input.",
    "permission_denied": "You don't have permission to perform this action"
  }
}
```

---

## 7. Testing Checklist

### Backend Tests
- [ ] `bulkDelete` method validates input correctly
- [ ] `bulkDelete` deletes only existing IDs
- [ ] `bulkDelete` handles empty array gracefully
- [ ] `bulkDelete` uses database transactions
- [ ] `index` method accepts `filter_id` parameter
- [ ] `index` method accepts `filter_name` parameter
- [ ] `index` method combines multiple filters correctly
- [ ] API route is protected by sanctum middleware
- [ ] Non-existent IDs in bulk delete don't cause errors

### Frontend Tests
- [ ] PageHeader displays correct breadcrumbs
- [ ] PageHeader shows create button
- [ ] BulkActionsBar appears when items selected
- [ ] BulkActionsBar shows correct count
- [ ] BulkActionsBar clear button works
- [ ] Checkboxes appear in table header and rows
- [ ] Select all checkbox works correctly
- [ ] Indeterminate state displays correctly
- [ ] Filter inputs visible when toggled
- [ ] Filter ID input accepts only numbers
- [ ] Apply filters button sends correct query params
- [ ] Clear filters resets inputs and fetches
- [ ] Bulk delete shows confirmation dialog
- [ ] Bulk delete sends correct POST request
- [ ] Success toast shows correct count
- [ ] Partial delete shows warning toast
- [ ] Error toast shows on API failure
- [ ] Table shows created_at column
- [ ] Created_at formatted correctly
- [ ] Mobile layout uses stacked filters

### Integration Tests
- [ ] End-to-end bulk delete flow works
- [ ] Filter + bulk delete combination works
- [ ] Pagination preserves selected items correctly
- [ ] Page refresh maintains filter state (optional)
- [ ] Concurrent bulk deletes handled correctly

---

## 8. Files to Modify

### Backend
1. `backend/app/Http/Controllers/ProductTagController.php`
   - Add `bulkDelete()` method
   - Enhance `index()` method with filters

2. `backend/routes/api.php`
   - Add POST route for `/product-tags/bulk-delete`
   - Verify existing routes use auth middleware

### Frontend
3. `frontend/src/views/product-tags/TagsList.jsx`
   - Import PageHeader, BulkActionsBar, useBulkSelect
   - Add filter state and UI
   - Implement selection checkboxes
   - Add bulk delete functionality
   - Add created_at column

4. `frontend/src/views/product-tags/TagForm.jsx`
   - Import PageHeader
   - Replace h1 with PageHeader
   - Change PUT to POST with _method
   - Update breadcrumbs

### i18n
5. `frontend/src/i18n/locales/es.json`
   - Add tags translation keys
   - Add bulk operation messages
   - Add filter-related strings

6. `frontend/src/i18n/locales/en.json`
   - Add tags translation keys
   - Add bulk operation messages
   - Add filter-related strings

### Dependencies to Verify
- `useBulkSelect` hook exists at `frontend/src/hooks/useBulkSelect.js`
- `PageHeader` component exists at `frontend/src/components/ui/PageHeader.jsx`
- `BulkActionsBar` component exists at `frontend/src/components/ui/BulkActionsBar.jsx`
- `Checkbox` component available from shadcn/ui
- `axios` configured for API calls

---

## 9. Implementation Notes

### Performance Considerations
- Bulk delete should handle up to 100 items efficiently
- Consider implementing chunked deletion for very large batches
- Filters should use database indexes on `id` and `name` columns
- Implement debouncing on filter inputs (300ms)

### Security
- Verify user has permission to delete tags
- Sanitize filter inputs to prevent SQL injection
- Use Laravel's validation for all inputs
- Log bulk delete operations for audit trail

### Accessibility
- Checkboxes should have proper aria-labels
- BulkActionsBar should be keyboard navigable
- Focus management after delete operations
- Screen reader announcements for selection changes

---

## 10. Rollback Plan

If issues occur:
1. Revert API route addition (comment out)
2. Remove bulkDelete method from controller
3. Revert TagsList.jsx to previous version
4. Revert TagForm.jsx form submission method
5. Remove new translation keys

---

**Last Updated:** 2024-01-15
**Author:** Agent
**Status:** Ready for Implementation
