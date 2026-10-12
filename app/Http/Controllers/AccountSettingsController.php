<?php

namespace App\Http\Controllers;

use App\Http\Requests\PasswordUpdateRequest;
use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AccountSettingsController extends Controller
{
    public function profile(): Response
    {
        return Inertia::render('Member/Settings/Profile');
    }

    public function updateProfile(ProfileUpdateRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $user = $request->user();
            $data = $request->validated();

            if ($data['email'] !== $user->email) {
                Password::broker()->deleteToken($user);
            }

            $user->fill($data)->save();
        });

        return to_route('settings.profile')->with('status', 'Profile updated.');
    }

    public function password(): Response
    {
        return Inertia::render('Member/Settings/Password');
    }

    public function updatePassword(PasswordUpdateRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $user = $request->user();
            Password::broker()->deleteToken($user);

            $user->forceFill([
                'password' => Hash::make($request->validated('password')),
                'remember_token' => Str::random(60),
            ])->save();
        });

        return to_route('settings.password')->with('status', 'Password updated.');
    }
}
