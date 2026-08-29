<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make(
                $validated['password']
            ),
            'role' => 'user',
            'status' => 'active',
        ]);

        $token = $user
            ->createToken('auth_token')
            ->plainTextToken;

        return response()->json([
            'message' => 'Registration successful.',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where(
            'email',
            $validated['email']
        )->first();

        if (
            !$user ||
            !Hash::check(
                $validated['password'],
                $user->password
            )
        ) {
            throw ValidationException::withMessages([
                'email' => [
                    'The provided credentials are incorrect.',
                ],
            ]);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Your account is suspended.',
            ], 403);
        }

        $token = $user
            ->createToken('auth_token')
            ->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request
            ->user()
            ->currentAccessToken()
            ->delete();

        return response()->json([
            'message' => 'Logout successful.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Profile
    |--------------------------------------------------------------------------
    */

    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Profile retrieved successfully.',
            'user' => $request->user(),
        ]);
    }

    public function updateProfile(
        Request $request
    ): JsonResponse {
        $user = $request->user();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email,' . $user->id,
            ],
        ]);

        $emailChanged =
            $user->email !== $validated['email'];

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        /*
         * If the email changes, mark the new email
         * as unverified.
         */
        if ($emailChanged) {
            $user->email_verified_at = null;
        }

        $user->save();

        /*
         * Send a new verification email if the
         * email address was changed.
         */
        if ($emailChanged) {
            $user->sendEmailVerificationNotification();
        }

        return response()->json([
            'message' =>
                $emailChanged
                    ? 'Profile updated. Please verify your new email address.'
                    : 'Profile updated successfully.',
            'user' => $user->fresh(),
        ]);
    }

    public function updatePassword(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'current_password' => [
                'required',
                'string',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        $user = $request->user();

        if (
            !Hash::check(
                $validated['current_password'],
                $user->password
            )
        ) {
            throw ValidationException::withMessages([
                'current_password' => [
                    'The current password is incorrect.',
                ],
            ]);
        }

        $user->password = Hash::make(
            $validated['password']
        );

        $user->save();

        /*
         * Invalidate existing Sanctum tokens so that
         * changing the password also signs the user
         * out of other sessions.
         */
        $user->tokens()->delete();

        /*
         * Create a fresh token for the current session.
         */
        $token = $user
            ->createToken('auth_token')
            ->plainTextToken;

        return response()->json([
            'message' =>
                'Password updated successfully.',
            'token' => $token,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Password Reset
    |--------------------------------------------------------------------------
    */

    public function forgotPassword(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = Password::sendResetLink([
            'email' => $validated['email'],
        ]);

        if (
            $status !== Password::RESET_LINK_SENT
        ) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json([
            'message' =>
                'Password reset link sent.',
        ]);
    }

    public function resetPassword(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        $status = Password::reset(
            $validated,
            function (
                User $user,
                string $password
            ) {
                $user->forceFill([
                    'password' =>
                        Hash::make($password),
                ])->save();

                $user->tokens()->delete();
            }
        );

        if (
            $status !== Password::PASSWORD_RESET
        ) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json([
            'message' =>
                'Password reset successful.',
        ]);
    }
}
