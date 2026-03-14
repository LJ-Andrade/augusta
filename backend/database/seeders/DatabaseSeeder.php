<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
            CategorySeeder::class,
            TagSeeder::class,
        ]);

        $permissions = Permission::all();
        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin']);
		$admin = Role::firstOrCreate(['name' => 'Admin']);
        $superAdmin->permissions()->sync($permissions);

        // $admin = User::firstOrCreate(
        //     ['email' => 'sadmin@vadmin3.com'],
        //     [
        //         'name' => 'Super Admin',
        //         'password' => bcrypt('123456'),
        //     ]
        // );
        // $admin->roles()->sync($superAdmin);

        $javzero = User::firstOrCreate(
            ['email' => 'javzero1@gmail.com'],
            [
                'name' => 'Leandro Andrade',
                'password' => bcrypt('12121212'),
            ]
        );
        $javzero->roles()->sync($superAdmin);

		
        $violeta = User::firstOrCreate(
            ['email' => 'violetaraffin@gmail.com'],
            [
                'name' => 'Violeta Raffin',
                'password' => bcrypt('12121212'),
            ]
        );
        $violeta->roles()->sync($superAdmin);


		$geo = User::firstOrCreate(
            ['email' => 'geo@gmail.com'],
            [
                'name' => 'Geo Georgie',
                'password' => bcrypt('12121212'),
            ]
        );
        $geo->roles()->sync($admin);

        // $roles = Role::where('name', '!=', 'Super Admin')->get();
        // User::factory(10)->create()->each(function ($user) use ($roles) {
        //     if ($roles->isNotEmpty()) {
        //         $user->roles()->sync($roles->random());
        //     }
        // });

        $this->call([
            PostSeeder::class,
        ]);
    }
}
