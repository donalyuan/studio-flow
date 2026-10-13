<?php

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
});
