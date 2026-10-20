<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\MembershipCard;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CenterController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $card = MembershipCard::query()
            ->where('user_id', $request->user()->id)
            ->where('starts_at', '<=', now())
            ->where('expires_at', '>', now())
            ->latest('starts_at')
            ->first();

        return Inertia::render('Member/Center', [
            'membershipCard' => $card ? [
                'name' => $card->plan_snapshot['name'],
                'type' => $card->plan_snapshot['type'],
                'startsAt' => $card->starts_at->toIso8601String(),
                'expiresAt' => $card->expires_at->toIso8601String(),
                'totalClasses' => $card->total_classes,
                'remainingClasses' => $card->remaining_classes,
            ] : null,
            'nextBooking' => null,
        ]);
    }
}
