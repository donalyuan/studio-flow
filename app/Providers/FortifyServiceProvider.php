<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Requests\LoginRequest;
use App\Http\Responses\LoginResponse;
use App\Http\Responses\LogoutResponse;
use App\Http\Responses\RegisterResponse;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\LogoutResponse as LogoutResponseContract;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\Http\Requests\LoginRequest as FortifyLoginRequest;

class FortifyServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(FortifyLoginRequest::class, LoginRequest::class);
        $this->app->singleton(LoginResponseContract::class, LoginResponse::class);
        $this->app->singleton(RegisterResponseContract::class, RegisterResponse::class);
        $this->app->singleton(LogoutResponseContract::class, LogoutResponse::class);
    }

    public function boot(): void
    {
        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::loginView(fn () => Inertia::render('Auth/Login'));
        Fortify::registerView(fn () => Inertia::render('Auth/Register'));

        $rateLimitResponse = function (Request $request, array $headers) {
            throw ValidationException::withMessages([
                'email' => 'Too many attempts. Please try again in '.$headers['Retry-After'].' seconds.',
            ]);
        };

        RateLimiter::for('login', function (Request $request) use ($rateLimitResponse) {
            $email = $request->input('email');
            $key = is_string($email) ? Str::lower($email) : '';

            return Limit::perMinute(5)
                ->by(hash('sha256', $key.'|'.$request->ip()))
                ->response($rateLimitResponse);
        });

        RateLimiter::for('registration', fn (Request $request) => Limit::perMinute(5)
            ->by($request->ip())
            ->response($rateLimitResponse));
    }
}
