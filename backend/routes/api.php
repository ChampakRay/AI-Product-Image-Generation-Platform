<?php

use App\Http\Controllers\Api\Admin\AdminAiModelController;
use App\Http\Controllers\Api\Admin\AiProviderController;
use App\Http\Controllers\Api\Admin\ApiUsageLogController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\AiModelController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GenerationController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\UploadController;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\AdminGenerationController;
use App\Http\Controllers\Api\Admin\AnalyticsController;

Route::post(
    '/register',
    [AuthController::class, 'register']
);

Route::post(
    '/login',
    [AuthController::class, 'login']
);

Route::post(
    '/forgot-password',
    [AuthController::class, 'forgotPassword']
);

Route::post(
    '/reset-password',
    [AuthController::class, 'resetPassword']
);

Route::middleware('auth:sanctum')->group(function () {

    Route::post(
        '/logout',
        [AuthController::class, 'logout']
    );

    Route::get(
        '/me',
        [AuthController::class, 'me']
    );

    Route::get(
    '/profile',
    [AuthController::class, 'profile']
    );

    Route::put(
        '/profile',
        [AuthController::class, 'updateProfile']
    );

    Route::put(
        '/profile/password',
        [AuthController::class, 'updatePassword']
    );

    Route::post(
        '/generations',
        [GenerationController::class, 'store']
    );

    Route::get(
        '/generations',
        [GenerationController::class, 'index']
    );

    Route::get(
        '/generations/{generationId}',
        [GenerationController::class, 'show']
    );

    Route::get(
        '/generations/{generationId}/download',
        [GenerationController::class, 'download']
    );

    Route::delete(
        '/generations/{generationId}',
        [GenerationController::class, 'destroy']
    );

    Route::post(
        '/generations/{generationId}/regenerate',
        [GenerationController::class, 'regenerate']
    );

    Route::get(
        '/products',
        [ProductController::class, 'index']
    );

    Route::get(
        '/ai-models',
        [AiModelController::class, 'index']
    );

    Route::post(
        '/uploads/reference-image',
        [UploadController::class, 'referenceImage']
    );

    /*
    |--------------------------------------------------------------------------
    | Admin routes
    |--------------------------------------------------------------------------
    */

    Route::middleware('admin')
        ->prefix('admin')
        ->group(function () {

            Route::get(
                '/dashboard',
                [DashboardController::class, 'index']
            );

                Route::get(
                      '/analytics',
                       [AnalyticsController::class, 'index']
            );

                Route::get(
                    '/generations',
                    [AdminGenerationController::class, 'index']
                );

                Route::get(
                    '/generations/{generationId}',
                    [AdminGenerationController::class, 'show']
                );

                Route::delete(
                    '/generations/{generationId}',
                    [AdminGenerationController::class, 'destroy']
                );

            Route::get(
            '/users',
            [UserController::class, 'index']
            );

            Route::put(
                '/users/{user}/status',
                [UserController::class, 'updateStatus']
            );

            Route::get(
                '/api-usage-logs',
                [ApiUsageLogController::class, 'index']
            );

            Route::get(
                '/api-usage-logs/{id}',
                [ApiUsageLogController::class, 'show']
            );

            /*
            |--------------------------------------------------------------------------
            | AI Providers
            |--------------------------------------------------------------------------
            */

            Route::get(
                '/ai-providers',
                [AiProviderController::class, 'index']
            );

            Route::post(
                '/ai-providers',
                [AiProviderController::class, 'store']
            );

            Route::get(
                '/ai-providers/{aiProvider}',
                [AiProviderController::class, 'show']
            );

            Route::put(
                '/ai-providers/{aiProvider}',
                [AiProviderController::class, 'update']
            );

            Route::delete(
                '/ai-providers/{aiProvider}',
                [AiProviderController::class, 'destroy']
            );

            /*
            |--------------------------------------------------------------------------
            | AI Models
            |--------------------------------------------------------------------------
            */

            Route::get(
                '/ai-models',
                [AdminAiModelController::class, 'index']
            );

            Route::post(
                '/ai-models',
                [AdminAiModelController::class, 'store']
            );

            Route::get(
                '/ai-models/{aiModel}',
                [AdminAiModelController::class, 'show']
            );

            Route::put(
                '/ai-models/{aiModel}',
                [AdminAiModelController::class, 'update']
            );

            Route::delete(
                '/ai-models/{aiModel}',
                [AdminAiModelController::class, 'destroy']
            );
        });

    Route::post(
        '/email/verification-notification',
        function (Request $request) {

            if ($request->user()->hasVerifiedEmail()) {
                return response()->json([
                    'message' =>
                        'Email already verified.',
                ]);
            }

            $request
                ->user()
                ->sendEmailVerificationNotification();

            return response()->json([
                'message' =>
                    'Verification link sent.',
            ]);
        }
    );
});

Route::get(
    '/email/verify/{id}/{hash}',
    function ($id, $hash) {

        $user = User::findOrFail($id);

        if (
            !hash_equals(
                sha1(
                    $user->getEmailForVerification()
                ),
                $hash
            )
        ) {
            abort(
                403,
                'Invalid verification link.'
            );
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' =>
                    'Email already verified.',
            ]);
        }

        if (
            $user->markEmailAsVerified()
        ) {
            event(
                new Verified($user)
            );

            return response()->json([
                'message' =>
                    'Email verified successfully.',
            ]);
        }

        return response()->json([
            'message' =>
                'Email verification failed.',
        ], 500);
    }
)
    ->middleware('signed')
    ->name('verification.verify');
