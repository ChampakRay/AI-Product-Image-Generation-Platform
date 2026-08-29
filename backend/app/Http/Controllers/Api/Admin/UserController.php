<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim(
            (string) $request->query('search', '')
        );

        $status = $request->query('status');

        $users = User::query()
            ->withCount('generations')
            ->when(
                $search !== '',
                function ($query) use ($search) {
                    $query->where(function ($query) use ($search) {
                        $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere(
                                'email',
                                'like',
                                "%{$search}%"
                            );
                    });
                }
            )
            ->when(
                $status !== null &&
                    in_array(
                        $status,
                        ['active', 'suspended'],
                        true
                    ),
                function ($query) use ($status) {
                    $query->where('status', $status);
                }
            )
            ->latest()
            ->paginate(20);

        return response()->json([
            'message' => 'Users retrieved successfully.',
            'data' => $users,
        ]);
    }

    public function updateStatus(
        Request $request,
        User $user
    ): JsonResponse {
        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    'active',
                    'suspended',
                ]),
            ],
        ]);

        /*
         * Prevent an administrator from accidentally
         * suspending their own account.
         */
        if (
            $request->user()->id === $user->id &&
            $validated['status'] === 'suspended'
        ) {
            return response()->json([
                'message' =>
                    'You cannot suspend your own account.',
            ], 422);
        }

        /*
         * Do not allow the last active admin
         * to be suspended.
         */
        if (
            $user->role === 'admin' &&
            $validated['status'] === 'suspended'
        ) {
            $activeAdmins = User::where(
                'role',
                'admin'
            )
                ->where(
                    'status',
                    'active'
                )
                ->count();

            if ($activeAdmins <= 1) {
                return response()->json([
                    'message' =>
                        'The last active administrator cannot be suspended.',
                ], 422);
            }
        }

        $user->update([
            'status' => $validated['status'],
        ]);

        /*
         * If an account is suspended, revoke
         * all existing Sanctum sessions.
         */
        if ($validated['status'] === 'suspended') {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' =>
                $validated['status'] === 'suspended'
                    ? 'User suspended successfully.'
                    : 'User activated successfully.',
            'user' => $user->fresh(),
        ]);
    }
}
