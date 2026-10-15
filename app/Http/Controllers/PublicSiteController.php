<?php

namespace App\Http\Controllers;

use App\Models\MembershipPlan;
use App\Models\ContactMessage;
use App\Http\Requests\ContactMessageRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PublicSiteController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('Public/Home', [
            'plans' => $this->plans(),
        ]);
    }

    public function memberships(): Response
    {
        return Inertia::render('Public/Memberships/Index', [
            'plans' => $this->plans(),
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('Public/Contact');
    }

    public function storeContact(ContactMessageRequest $request): RedirectResponse
    {
        ContactMessage::create($request->validated());

        return to_route('contact.create')->with('status', 'Thanks for reaching out. We will be in touch soon.');
    }

    /** @return \Illuminate\Support\Collection<int, MembershipPlan> */
    private function plans()
    {
        return MembershipPlan::query()
            ->where('enabled', true)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'description',
                'price',
                'type',
                'valid_days',
                'total_classes',
            ]);
    }
}
