<?php

use App\Http\Controllers\Api\AuthController;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me', [AuthController::class, 'me']);

    Route::post('/email/verification-notification', function (Request $request) {

        if ($request->user()->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified.',
            ]);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Verification link sent.',
        ]);
    });
});

Route::get('/email/verify/{id}/{hash}', function ($id, $hash) {

    $user = User::findOrFail($id);

    if (!hash_equals(
        sha1($user->getEmailForVerification()),
        $hash
    )) {
        abort(403, 'Invalid verification link.');
    }

    if ($user->hasVerifiedEmail()) {
        return response()->json([
            'message' => 'Email already verified.',
        ]);
    }

    if ($user->markEmailAsVerified()) {
        event(new Verified($user));

        return response()->json([
            'message' => 'Email verified successfully.',
        ]);
    }

    return response()->json([
        'message' => 'Email verification failed.',
    ], 500);

})->middleware('signed')->name('verification.verify');
