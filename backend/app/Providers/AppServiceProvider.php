<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('generation', function (Request $request) {
            return Limit::perHour(10)->by(
                $request->user()?->id ?? $request->ip()
            );
        });

        ResetPassword::createUrlUsing(function ($user, string $token) {
            return 'http://localhost:5173/reset-password/' . $token
                . '?email=' . urlencode(
                    $user->getEmailForPasswordReset()
                );
        });
    }
}
