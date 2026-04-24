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
            ProductAttributeSeeder::class,
            RoleSeeder::class,
            PermissionSeeder::class,
            PaymentMethodSeeder::class,
            DeliveryMethodSeeder::class,
            CustomerSeeder::class,
        ]);

        $permissions = Permission::all();
        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin']);
		$admin = Role::firstOrCreate(['name' => 'Admin']);
        $superAdmin->permissions()->sync($permissions);

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

        $this->call([
            CategorySeeder::class,
            TagSeeder::class,
            BusinessSettingsSeeder::class,
            ProductSeeder::class,
            PostSeeder::class,
        ]);
    }
}
