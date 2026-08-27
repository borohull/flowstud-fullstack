<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudySession extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'session_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'session_date' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignments()
    {
        return $this->belongsToMany(Assignment::class, 'session_items')
            ->withPivot('sort_order')
            ->orderByPivot('sort_order');
    }

    public function sessionItems()
    {
        return $this->hasMany(SessionItem::class);
    }
}
