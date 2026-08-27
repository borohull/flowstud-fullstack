<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'     => 'Admin User',
            'username' => 'admin',
            'email'    => 'admin@flowstud.test',
            'password' => Hash::make('password'),
            'role'     => 'admin',
            'bio'      => 'Platform administrator.',
            'is_profile_public' => true,
        ]);

        $students = [
            ['name' => 'Alice Byte',  'username' => 'alice', 'email' => 'alice@flowstud.test'],
            ['name' => 'Bob Coder',   'username' => 'bob',   'email' => 'bob@flowstud.test'],
            ['name' => 'Carol Debug', 'username' => 'carol', 'email' => 'carol@flowstud.test'],
            ['name' => 'Dave Kernel', 'username' => 'dave',  'email' => 'dave@flowstud.test'],
            ['name' => 'Eve Runtime', 'username' => 'eve',   'email' => 'eve@flowstud.test'],
        ];

        foreach ($students as $data) {
            User::create(array_merge($data, [
                'password' => Hash::make('password'),
                'role'     => 'student',
                'bio'      => 'Student on FlowStud.',
                'is_profile_public' => true,
                'show_completed_assignments_count' => true,
                'show_study_streak' => true,
                'show_study_sessions_count' => true,
            ]));
        }
    }
}
