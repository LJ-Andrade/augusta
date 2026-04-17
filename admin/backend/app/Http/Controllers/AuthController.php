<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user->load(['roles.permissions', 'media'])),
        ]);
    }

    public function dashboard(Request $request)
    {
        $user = $request->user()->load('roles');
        
        return response()->json([
            'message' => 'Welcome to the dashboard!',
            'user' => $user,
            'stats' => [
                'total_users' => User::count(),
                'total_posts' => \App\Models\Post::count(),
            ]
        ]);
    }
}
