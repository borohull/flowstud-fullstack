<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SessionItem extends Model
{
    protected $fillable = [
        'study_session_id',
        'assignment_id',
        'sort_order',
    ];

    public function studySession()
    {
        return $this->belongsTo(StudySession::class);
    }

    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }
}
