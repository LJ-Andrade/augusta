<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * Update the authenticated user's profile.
     *
     * @param  Request  $request
     * @return UserResource
     */
    public function update(Request $request): UserResource
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:8',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return new UserResource($user->load(['roles.permissions', 'media']));
    }

    /**
     * Upload an avatar for the authenticated user.
     *
     * @param  Request  $request
     * @return UserResource
     */
    public function uploadAvatar(Request $request): UserResource
    {
        $request->validate([
            'avatar' => 'required|image|max:2048',
        ]);

        $user = $request->user();
        
        // Eliminar avatar anterior del storage
        $oldPath = 'users/' . $user->id . '/avatar.jpg';
        if (Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }
        
        // Eliminar de media library
        $user->clearMediaCollection('avatar');
        
        // Crear directorio y guardar avatar
        $directory = 'users/' . $user->id;
        Storage::disk('public')->makeDirectory($directory);
        
        $path = $directory . '/avatar.jpg';
        $request->file('avatar')->storeAs($directory, 'avatar.jpg', 'public');

        return new UserResource($user->load(['roles.permissions', 'media']));
    }
}
