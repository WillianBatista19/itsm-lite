<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@itsm.local',
            'password' => Hash::make('password'),
            'role' => UserRole::Admin,
        ]);

        User::create([
            'name' => 'Agent One',
            'email' => 'agent1@itsm.local',
            'password' => Hash::make('password'),
            'role' => UserRole::Agent,
        ]);

        User::create([
            'name' => 'Agent Two',
            'email' => 'agent2@itsm.local',
            'password' => Hash::make('password'),
            'role' => UserRole::Agent,
        ]);

        for ($i = 1; $i <= 5; $i++) {
            User::create([
                'name' => "Regular User {$i}",
                'email' => "user{$i}@itsm.local",
                'password' => Hash::make('password'),
                'role' => UserRole::User,
            ]);
        }
    }
}
