<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'user',
            'status' => 'active',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

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

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Your account is suspended.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user,
            'token' => $token,
        ]);
    }
    public function logout(Request $request): JsonResponse
    {
    $request->user()->currentAccessToken()->delete();

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

    public function forgotPassword(Request $request): JsonResponse
{
    $validated = $request->validate([
        'email' => ['required', 'email'],
    ]);

    $status = Password::sendResetLink([
        'email' => $validated['email'],
    ]);

    if ($status !== Password::RESET_LINK_SENT) {
        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    return response()->json([
        'message' => 'Password reset link sent.',
    ]);
    }
    public function resetPassword(Request $request): JsonResponse
    {
    $validated = $request->validate([
        'email' => ['required', 'email'],
        'token' => ['required', 'string'],
        'password' => ['required', 'string', 'min:8', 'confirmed'],
    ]);

    $status = Password::reset(
        $validated,
        function (User $user, string $password) {
            $user->forceFill([
                'password' => Hash::make($password),
            ])->save();

            $user->tokens()->delete();
        }
    );

    if ($status !== Password::PASSWORD_RESET) {
        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    return response()->json([
        'message' => 'Password reset successful.',
    ]);
    }
}
