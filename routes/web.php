<?php

use App\Http\Controllers\AccountSettingsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Public/Home'))->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/settings/profile', [AccountSettingsController::class, 'profile'])->name('settings.profile');
    Route::patch('/settings/profile', [AccountSettingsController::class, 'updateProfile'])->middleware('throttle:profile-update')->name('settings.profile.update');
    Route::get('/settings/password', [AccountSettingsController::class, 'password'])->name('settings.password');
    Route::put('/settings/password', [AccountSettingsController::class, 'updatePassword'])->middleware('throttle:password-update')->name('settings.password.update');
});

require __DIR__.'/auth.php';
require __DIR__.'/web-admin.php';
