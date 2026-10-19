<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseType extends Model
{
    protected $fillable = [
        'name',
        'description',
        'default_duration_minutes',
        'enabled',
    ];

    protected function casts(): array
    {
        return [
            'default_duration_minutes' => 'integer',
            'enabled' => 'boolean',
        ];
    }

    public function classSessions(): HasMany
    {
        return $this->hasMany(ClassSession::class);
    }
}
