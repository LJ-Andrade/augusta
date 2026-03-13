<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = ['Super Admin', 'Admin', 'Editor'];

        foreach ($roles as $name) {
            Role::updateOrCreate(['name' => $name]);
        }
    }
}
