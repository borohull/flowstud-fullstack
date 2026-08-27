<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\Course;
use App\Models\Tag;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AssignmentSeeder extends Seeder
{
    public function run(): void
    {
        $students   = User::where('role', 'student')->get();
        $globalTags = Tag::where('is_global', true)->get();

        $types      = ['homework', 'exam', 'project', 'reading', 'lab', 'presentation'];
        $statuses   = ['pending', 'in_progress', 'completed', 'pending', 'completed', 'overdue', 'completed', 'pending'];
        $priorities = ['low', 'medium', 'high', 'critical', 'medium', 'high', 'low', 'medium'];

        foreach ($students as $student) {
            $courses = Course::where('user_id', $student->id)->get();

            for ($i = 0; $i < 8; $i++) {
                $status      = $statuses[$i % count($statuses)];
                $completedAt = $status === 'completed'
                    ? Carbon::now()->subDays(rand(1, 20))
                    : null;

                $assignment = Assignment::create([
                    'user_id'         => $student->id,
                    'course_id'       => $courses->isNotEmpty() ? $courses->random()->id : null,
                    'title'           => $this->makeTitle($types[$i % count($types)], $i),
                    'description'     => 'Complete this assignment before the deadline.',
                    'assignment_type' => $types[$i % count($types)],
                    'status'          => $status,
                    'priority'        => $priorities[$i % count($priorities)],
                    'due_date'        => Carbon::now()->addDays(rand(-5, 30))->toDateString(),
                    'completed_at'    => $completedAt,
                    'is_public_progress_visible' => (bool) ($i % 2),
                ]);

                $assignment->tags()->sync(
                    $globalTags->random(rand(1, 2))->pluck('id')->toArray()
                );
            }
        }
    }

    private function makeTitle(string $type, int $i): string
    {
        $map = [
            'homework'     => 'Problem Set ' . ($i + 1),
            'exam'         => ($i % 2 === 0 ? 'Midterm' : 'Final') . ' Exam',
            'project'      => 'Project Phase ' . ($i + 1),
            'reading'      => 'Chapter ' . ($i + 1) . ' Reading',
            'lab'          => 'Lab Report ' . ($i + 1),
            'presentation' => 'Presentation ' . ($i + 1),
        ];
        return $map[$type] ?? 'Assignment ' . ($i + 1);
    }
}
