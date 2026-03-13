<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Permission;
use App\Models\User;
use App\Services\LLM\LLMProviderInterface;
use App\Services\LLM\GroqService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(LLMProviderInterface::class, GroqService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Grant all permissions to Super Admin role
        Gate::before(function (User $user, string $ability) {
            return $user->roles()->where('name', 'Super Admin')->exists() ? true : null;
        });

        // Register dynamic gates for all permissions
        try {
            foreach (Permission::all() as $permission) {
                Gate::define($permission->name, function (User $user) use ($permission) {
                    return $user->roles()->whereHas('permissions', function ($query) use ($permission) {
                        $query->where('permissions.id', $permission->id);
                    })->exists();
                });
            }
        } catch (\Exception $e) {
            // Silence error if database doesn't exist yet during migrations/seeds
        }
    }
}
