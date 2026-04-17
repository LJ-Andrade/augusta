<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Permission;
use App\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create orders permissions
        $permissions = [
            'view orders',
            'manage orders'
        ];

        $createdPermissions = [];
        foreach ($permissions as $name) {
            $createdPermissions[] = Permission::firstOrCreate(['name' => $name])->id;
        }

        // Assign to Super Admin if role exists
        $superAdmin = Role::where('name', 'Super Admin')->first();
        if ($superAdmin) {
            $superAdmin->permissions()->syncWithoutDetaching($createdPermissions);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Permission::whereIn('name', ['view orders', 'manage orders'])->delete();
    }
};
