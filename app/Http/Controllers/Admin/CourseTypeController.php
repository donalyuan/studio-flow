<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CourseTypeRequest;
use App\Http\Requests\CourseTypeStatusRequest;
use App\Models\CourseType;
use App\Services\SchedulingService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CourseTypeController extends Controller
{
    public function __construct(private readonly SchedulingService $scheduling) {}

    public function index(): Response
    {
        return Inertia::render('Admin/Scheduling/Index', [
            'view' => 'courses',
            'courseTypes' => $this->scheduling->courseTypesForIndex(),
            'classSessions' => [],
            'timezone' => 'UTC',
        ]);
    }

    public function store(CourseTypeRequest $request): RedirectResponse
    {
        $this->scheduling->createCourseType($request->validated());

        return to_route('admin.course-types.index')->with('status', 'Course type created.');
    }

    public function update(CourseTypeRequest $request, CourseType $courseType): RedirectResponse
    {
        $this->scheduling->updateCourseType($courseType, $request->validated());

        return to_route('admin.course-types.index')->with('status', 'Course type changes saved.');
    }

    public function updateStatus(CourseTypeStatusRequest $request, CourseType $courseType): RedirectResponse
    {
        $courseType = $this->scheduling->setCourseTypeEnabled($courseType, $request->boolean('enabled'));

        return to_route('admin.course-types.index')
            ->with('status', $courseType->enabled ? 'Course type enabled.' : 'Course type disabled.');
    }

    public function destroy(CourseType $courseType): RedirectResponse
    {
        $this->scheduling->deleteCourseType($courseType);

        return to_route('admin.course-types.index')->with('status', 'Course type deleted.');
    }
}
