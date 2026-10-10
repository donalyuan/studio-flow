<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Public/Home'))->name('home');

require __DIR__.'/auth.php';
require __DIR__.'/web-admin.php';
