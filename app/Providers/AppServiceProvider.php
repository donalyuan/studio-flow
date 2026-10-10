<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Fortify\Fortify;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Mount only the authentication routes delivered in the current stage.
        Fortify::ignoreRoutes();
    }

    public function boot(): void
    {
        //
    }
}
