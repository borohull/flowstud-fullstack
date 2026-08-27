<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            ['name' => 'Urgent',     'color' => '#f87171', 'is_global' => true],
            ['name' => 'Important',  'color' => '#fbbf24', 'is_global' => true],
            ['name' => 'Group Work', 'color' => '#38bdf8', 'is_global' => true],
            ['name' => 'Exam Prep',  'color' => '#a78bfa', 'is_global' => true],
            ['name' => 'Research',   'color' => '#34d399', 'is_global' => true],
            ['name' => 'Revision',   'color' => '#fb923c', 'is_global' => true],
        ];

        foreach ($tags as $tag) {
            Tag::create($tag);
        }
    }
}
