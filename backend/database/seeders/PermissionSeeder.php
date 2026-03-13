<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'roles.view',
            'roles.manage',
            'permissions.view',
            'view blog',
            'manage categories',
            'manage tags',
            'view articles',
            'manage articles',
            'create articles',
            'edit articles',
            'delete articles',
            'view products',
            'manage products',
            'create products',
            'edit products',
            'delete products',
            'view product categories',
            'manage product categories',
            'view product tags',
            'manage product tags',
            'manage customers',
            'view activity logs',
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(['name' => $permission]);
        }
    }
}
