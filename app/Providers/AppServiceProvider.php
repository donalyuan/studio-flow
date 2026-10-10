<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Fortify\Fortify;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Authentication routes will be added with the approved authentication flow.
        Fortify::ignoreRoutes();
    }

    public function boot(): void
    {
        //
    }
}
