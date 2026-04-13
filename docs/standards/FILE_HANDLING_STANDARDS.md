# File Handling Standards

This document establishes the patterns for managing file uploads, storage, and retrieval within the system. Agents modifying or creating features that involve files/images MUST adhere to these standards to prevent common issues (like browser caching of stale images) and maintain consistency.

There are two primary patterns used in the codebase:
1. **Spatie Media Library Pattern:** For complex entities with multiple images (e.g., Products, Posts).
2. **Manual Storage Pattern:** For simple, single-file relations stored physically in predictable paths (e.g., User Avatars).

---

## 1. Spatie Media Library Pattern (Preferred for Entities)

Use this pattern when the model requires multiple images, galleries, or structured media collections. 

**Examples:** `Product`, `Post`

### Uploading (Controller)
Always force specific file names and apply custom properties when ordering is required.

```php
// Single Image (Cover)
if ($request->hasFile('cover')) {
    $extension = $request->file('cover')->getClientOriginalExtension();
    $product->addMediaFromRequest('cover')
        ->usingFileName('cover.' . $extension) // Normalize file name
        ->toMediaCollection('cover');
}

// Multiple Images (Gallery)
if ($request->hasFile('gallery')) {
    foreach ($request->file('gallery') as $index => $image) {
        $extension = $image->getClientOriginalExtension();
        // Generate a random string to prevent caching and naming collisions
        $random = substr(str_shuffle('...'), 0, 8); 
        $filename = $product->id . '_' . $random . '.' . $extension;

        $product->addMedia($image)
            ->usingFileName($filename)
            ->withCustomProperties(['order' => $index]) // Store order
            ->toMediaCollection('gallery');
    }
}
```

### Retrieval (API Resource)
Fetch URLs natively via Spatie functions. The library naturally handles cache-busting by utilizing unique file paths based on media IDs.

```php
// In ProductResource.php
return [
    'cover_url' => $this->getFirstMediaUrl('cover'),
    'gallery' => $this->loadMedia('gallery')
        ->sortBy('order_column')
        ->values()
        ->map(function ($media) {
            return [
                'id' => $media->id,
                'url' => $media->getUrl(),
                'order' => $media->order_column,
            ];
        }),
];
```

---

## 2. Manual Storage Pattern (Legacy / Simple Storage)

Use this pattern only for extremely simple use cases where files are stored in predictable disk locations without database tracking (e.g., User avatars). 

**Examples:** `User` (Avatar)

### Uploading (Controller)
Save the file physically by manually forcing its target directory and path. **Wait** to delete the old cache until explicitly necessary, or just overwrite it entirely.

```php
// In ProfileController.php
$directory = 'users/' . $user->id;
Storage::disk('public')->makeDirectory($directory);

// Force overwrite the same exact file name
$request->file('avatar')->storeAs($directory, 'avatar.jpg', 'public');
```

### Retrieval (API Resource) - ⚠️ CRITICAL CACHE BUSTING
Because manual storage often overwrites the exact same file path (`storage/users/1/avatar.jpg`), the browser will cache the old image even after a successful upload. 
You **MUST** append a timestamp (cache-busting query parameter) to the generated URL to force the client to reload the new file.

```php
// In UserResource.php
$avatarPath = 'users/' . $this->id . '/avatar.jpg';

// Use updated_at timestamp as 'v' parameter to bust cache!
$avatarUrl = Storage::disk('public')->exists($avatarPath) 
    ? asset('storage/' . $avatarPath) . '?v=' . ($this->updated_at ? $this->updated_at->timestamp : time())
    : null;

return [
    'avatar_url' => $avatarUrl,
];
```

## Checklist for Agents
- [ ] Are you adding an image to a complex entity? Use **Spatie Media Library**.
- [ ] If using Spatie for a gallery, did you assign a random/unique generated name to the image to avoid cache collisions?
- [ ] If using manual storage with `Storage::disk`, did you add a `?v=` timestamp cache-buster to the Resource output string?
