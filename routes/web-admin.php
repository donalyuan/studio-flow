<?php

use App\Http\Controllers\Admin\ClassSessionController;
use App\Http\Controllers\Admin\CourseTypeController;
use App\Http\Controllers\Admin\MembershipPlanController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'admin'])->group(function (): void {
    Route::get('/admin', fn () => Inertia::render('Admin/Dashboard'))->name('admin.dashboard');
    Route::get('/admin/membership-plans', [MembershipPlanController::class, 'index'])->name('admin.membership-plans.index');
    Route::post('/admin/membership-plans', [MembershipPlanController::class, 'store'])->name('admin.membership-plans.store');
    Route::patch('/admin/membership-plans/{membershipPlan}', [MembershipPlanController::class, 'update'])->name('admin.membership-plans.update');
    Route::patch('/admin/membership-plans/{membershipPlan}/status', [MembershipPlanController::class, 'updateStatus'])->name('admin.membership-plans.status');
    Route::delete('/admin/membership-plans/{membershipPlan}', [MembershipPlanController::class, 'destroy'])->name('admin.membership-plans.destroy');
    Route::get('/admin/course-types', [CourseTypeController::class, 'index'])->name('admin.course-types.index');
    Route::post('/admin/course-types', [CourseTypeController::class, 'store'])->name('admin.course-types.store');
    Route::patch('/admin/course-types/{courseType}', [CourseTypeController::class, 'update'])->name('admin.course-types.update');
    Route::patch('/admin/course-types/{courseType}/status', [CourseTypeController::class, 'updateStatus'])->name('admin.course-types.status');
    Route::delete('/admin/course-types/{courseType}', [CourseTypeController::class, 'destroy'])->name('admin.course-types.destroy');
    Route::get('/admin/class-sessions', [ClassSessionController::class, 'index'])->name('admin.class-sessions.index');
    Route::post('/admin/class-sessions', [ClassSessionController::class, 'store'])->name('admin.class-sessions.store');
    Route::patch('/admin/class-sessions/{classSession}', [ClassSessionController::class, 'update'])->name('admin.class-sessions.update');
});
