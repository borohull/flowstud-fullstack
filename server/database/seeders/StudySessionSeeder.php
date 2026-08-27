<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\StudySession;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class StudySessionSeeder extends Seeder
{
    public function run(): void
    {
        $students = User::where('role', 'student')->get();

        foreach ($students as $student) {
            $assignments = Assignment::where('user_id', $student->id)->get();

            for ($i = 0; $i < 3; $i++) {
                $session = StudySession::create([
                    'user_id'      => $student->id,
                    'title'        => 'Study Session ' . ($i + 1),
                    'description'  => 'Focused study block.',
                    'session_date' => Carbon::now()->addDays($i * 3)->toDateString(),
                    'status'       => $i === 0 ? 'completed' : 'planned',
                ]);

                if ($assignments->count() >= 2) {
                    $session->assignments()->sync(
                        $assignments->random(min(3, $assignments->count()))->pluck('id')->toArray()
                    );
                }
            }
        }
    }
}
