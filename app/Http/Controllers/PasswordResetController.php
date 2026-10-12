<?php

namespace App\Http\Controllers;

use App\Http\Requests\PasswordResetLinkRequest;
use App\Http\Requests\PasswordResetRequest;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetController extends Controller
{
    public function request(): Response
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function email(PasswordResetLinkRequest $request): RedirectResponse
    {
        $status = DB::transaction(fn () => Password::broker()->sendResetLink($request->validated()));

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages(['email' => __($status)]);
        }

        return to_route('password.request')->with('status', __($status));
    }

    public function reset(Request $request, string $token): Response
    {
        $email = $request->query('email');
        $email = is_string($email) ? Str::lower($email) : '';
        $broker = Password::broker();
        $user = $email !== '' ? $broker->getUser(['email' => $email]) : null;

        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $email,
            'resetLinkInvalid' => $user === null || ! $broker->tokenExists($user, $token),
        ]);
    }

    public function store(PasswordResetRequest $request): RedirectResponse
    {
        $status = DB::transaction(fn () => Password::broker()->reset(
            $request->validated(),
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            },
        ));

        if ($status !== Password::PASSWORD_RESET) {
            $field = $status === Password::INVALID_TOKEN ? 'token' : 'email';

            throw ValidationException::withMessages([$field => __($status)]);
        }

        return to_route('login')->with('status', 'Your password has been reset. Log in with your new password.');
    }
}
