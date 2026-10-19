<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClassSessionRequest;
use App\Models\ClassSession;
use App\Services\SchedulingService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClassSessionController extends Controller
{
    public function __construct(private readonly SchedulingService $scheduling) {}

    public function index(): Response
    {
        return Inertia::render('Admin/Scheduling/Index', [
            'view' => 'sessions',
            'courseTypes' => $this->scheduling->courseTypesForIndex(),
            'classSessions' => $this->scheduling->classSessionsForIndex(),
            'timezone' => 'UTC',
        ]);
    }

    public function store(ClassSessionRequest $request): RedirectResponse
    {
        $this->scheduling->createClassSession($request->validated());

        return to_route('admin.class-sessions.index')->with('status', 'Class session created.');
    }

    public function update(ClassSessionRequest $request, ClassSession $classSession): RedirectResponse
    {
        $this->scheduling->updateClassSession($classSession, $request->validated());

        return to_route('admin.class-sessions.index')->with('status', 'Class session changes saved.');
    }
}
