<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\MembershipPlanRequest;
use App\Http\Requests\MembershipPlanStatusRequest;
use App\Models\MembershipPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MembershipPlanController extends Controller
{
    public function index(): Response
    {
        $plans = MembershipPlan::query()
            ->withExists(['orders as has_paid_orders' => fn ($query) => $query->where('status', OrderStatus::Paid)])
            ->orderBy('name')
            ->get()
            ->map(fn (MembershipPlan $plan): array => [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->description,
                'price' => $plan->price,
                'type' => $plan->type,
                'valid_days' => $plan->valid_days,
                'total_classes' => $plan->total_classes,
                'enabled' => $plan->enabled,
                'has_paid_orders' => (bool) $plan->has_paid_orders,
            ]);

        return Inertia::render('Admin/MembershipPlans/Index', [
            'plans' => $plans,
            'selectedPlanId' => request()->integer('plan') ?: null,
        ]);
    }

    public function store(MembershipPlanRequest $request): RedirectResponse
    {
        $plan = MembershipPlan::create($this->payload($request));

        return to_route('admin.membership-plans.index', ['plan' => $plan->id])
            ->with('status', 'Plan created.');
    }

    public function update(MembershipPlanRequest $request, MembershipPlan $membershipPlan): RedirectResponse
    {
        $membershipPlan->update($this->payload($request));

        return to_route('admin.membership-plans.index', ['plan' => $membershipPlan->id])
            ->with('status', 'Plan changes saved.');
    }

    public function updateStatus(MembershipPlanStatusRequest $request, MembershipPlan $membershipPlan): RedirectResponse
    {
        $membershipPlan->update([
            'enabled' => $request->boolean('enabled'),
        ]);

        return to_route('admin.membership-plans.index', ['plan' => $membershipPlan->id])
            ->with('status', $membershipPlan->enabled ? 'Plan enabled.' : 'Plan disabled.');
    }

    public function destroy(MembershipPlan $membershipPlan): RedirectResponse
    {
        DB::transaction(function () use ($membershipPlan): void {
            $plan = MembershipPlan::query()->lockForUpdate()->findOrFail($membershipPlan->id);

            if ($plan->orders()->where('status', OrderStatus::Paid)->exists()) {
                throw ValidationException::withMessages([
                    'plan' => 'Purchased plans cannot be deleted.',
                ]);
            }

            $plan->delete();
        });

        return to_route('admin.membership-plans.index')->with('status', 'Plan deleted.');
    }

    /** @return array<string, mixed> */
    private function payload(MembershipPlanRequest $request): array
    {
        $data = $request->validated();

        if ($data['type'] === 'monthly') {
            $data['total_classes'] = null;
        }

        return $data;
    }
}
