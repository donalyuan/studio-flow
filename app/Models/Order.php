<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'membership_plan_id',
        'number',
        'plan_snapshot',
        'amount',
        'status',
        'expires_at',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'plan_snapshot' => 'array',
            'amount' => 'decimal:2',
            'status' => OrderStatus::class,
            'expires_at' => 'datetime',
            'paid_at' => 'datetime',
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
