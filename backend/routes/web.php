<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/reset-password/{token}', function (string $token) {
    return response()->json([
        'message' => 'Password reset page.',
        'token' => $token,
    ]);
})->name('password.reset');
