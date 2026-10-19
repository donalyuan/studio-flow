<?php

namespace App\Models;

use App\Enums\ClassSessionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassSession extends Model
{
    protected $fillable = [
        'course_type_id',
        'starts_at',
        'ends_at',
        'capacity',
        'instructor_name',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'course_type_id' => 'integer',
            'starts_at' => 'immutable_datetime',
            'ends_at' => 'immutable_datetime',
            'capacity' => 'integer',
            'status' => ClassSessionStatus::class,
        ];
    }

    public function courseType(): BelongsTo
    {
        return $this->belongsTo(CourseType::class);
    }
}
