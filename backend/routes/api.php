<?php

use App\Http\Controllers\Api\AuthController;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\GenerationController;
use App\Http\Controllers\Api\Admin\ApiUsageLogController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\AiModelController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);



Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me', [AuthController::class, 'me']);

    Route::post('/generations', [GenerationController::class, 'store']);

    Route::get('/generations', [GenerationController::class, 'index']);

    Route::get('/generations/{generationId}', [GenerationController::class, 'show']);

    Route::get(
    '/generations/{generationId}/download',
    [GenerationController::class, 'download']
    );

    Route::delete('/generations/{generationId}', [GenerationController::class, 'destroy']);

    Route::get('/products', [ProductController::class, 'index']);

    Route::get('/ai-models', [AiModelController::class, 'index']);

    Route::post(
    '/uploads/reference-image',
    [UploadController::class, 'referenceImage']
);

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    Route::get(
        '/api-usage-logs',
        [ApiUsageLogController::class, 'index']
    );

    Route::get(
        '/api-usage-logs/{id}',
        [ApiUsageLogController::class, 'show']
    );

    Route::get(
    '/dashboard',
    [DashboardController::class, 'index']
    );
});

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
