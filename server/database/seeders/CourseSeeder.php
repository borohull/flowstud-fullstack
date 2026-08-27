<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $students = User::where('role', 'student')->get();

        $courseSets = [
            [
                ['title' => 'Algorithms & Data Structures', 'color_theme' => 'purple'],
                ['title' => 'Web Development',              'color_theme' => 'blue'],
                ['title' => 'Operating Systems',            'color_theme' => 'green'],
            ],
            [
                ['title' => 'Database Systems',             'color_theme' => 'red'],
                ['title' => 'Software Engineering',         'color_theme' => 'orange'],
            ],
            [
                ['title' => 'Computer Networks',            'color_theme' => 'blue'],
                ['title' => 'Machine Learning',             'color_theme' => 'purple'],
                ['title' => 'Linear Algebra',               'color_theme' => 'yellow'],
            ],
            [
                ['title' => 'Discrete Mathematics',         'color_theme' => 'green'],
                ['title' => 'Programming Paradigms',        'color_theme' => 'red'],
            ],
            [
                ['title' => 'Advanced Web Programming',     'color_theme' => 'purple'],
                ['title' => 'Compiler Design',              'color_theme' => 'orange'],
            ],
        ];

        foreach ($students as $i => $student) {
            $set = $courseSets[$i % count($courseSets)];
            foreach ($set as $data) {
                Course::create(array_merge($data, [
                    'user_id'     => $student->id,
                    'description' => 'A course for ' . $data['title'],
                ]));
            }
        }
    }
}
