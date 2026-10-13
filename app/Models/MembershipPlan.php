<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MembershipPlan extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'price',
        'type',
        'valid_days',
        'total_classes',
        'enabled',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'valid_days' => 'integer',
            'total_classes' => 'integer',
            'enabled' => 'boolean',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
