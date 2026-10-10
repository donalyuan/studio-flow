<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'name' => config('app.name'),
    'status' => 'initialized',
    'stage' => 'foundation',
]));

require __DIR__.'/auth.php';
require __DIR__.'/web-admin.php';
