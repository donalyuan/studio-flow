<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipCard extends Model
{
    protected $fillable = [
        'user_id',
        'membership_plan_id',
        'plan_snapshot',
        'starts_at',
        'expires_at',
        'total_classes',
        'remaining_classes',
        'is_demo',
    ];

    protected function casts(): array
    {
        return [
            'plan_snapshot' => 'array',
            'starts_at' => 'immutable_datetime',
            'expires_at' => 'immutable_datetime',
            'total_classes' => 'integer',
            'remaining_classes' => 'integer',
            'is_demo' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function membershipPlan(): BelongsTo
    {
        return $this->belongsTo(MembershipPlan::class)->withTrashed();
    }
}
