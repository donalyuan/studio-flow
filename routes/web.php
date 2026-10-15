<?php

use App\Http\Controllers\AccountSettingsController;
use App\Http\Controllers\PublicSiteController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PublicSiteController::class, 'home'])->name('home');
Route::get('/memberships', [PublicSiteController::class, 'memberships'])->name('memberships.index');
Route::get('/contact', [PublicSiteController::class, 'contact'])->name('contact.create');
Route::post('/contact', [PublicSiteController::class, 'storeContact'])
    ->middleware('throttle:10,1')
    ->name('contact.store');

Route::middleware('auth')->group(function () {
    Route::get('/settings/profile', [AccountSettingsController::class, 'profile'])->name('settings.profile');
    Route::patch('/settings/profile', [AccountSettingsController::class, 'updateProfile'])->middleware('throttle:profile-update')->name('settings.profile.update');
    Route::get('/settings/password', [AccountSettingsController::class, 'password'])->name('settings.password');
    Route::put('/settings/password', [AccountSettingsController::class, 'updatePassword'])->middleware('throttle:password-update')->name('settings.password.update');
});

require __DIR__.'/auth.php';
require __DIR__.'/web-admin.php';
