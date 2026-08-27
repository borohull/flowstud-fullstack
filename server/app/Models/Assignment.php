<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'title',
        'description',
        'color_theme',
        'assignment_type',
        'status',
        'priority',
        'due_date',
        'due_time',
        'completed_at',
        'is_public_progress_visible',
        'attachment',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'completed_at' => 'datetime',
            'is_public_progress_visible' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'assignment_tag');
    }

    public function studySessions()
    {
        return $this->belongsToMany(StudySession::class, 'session_items')
            ->withPivot('sort_order');
    }
}
