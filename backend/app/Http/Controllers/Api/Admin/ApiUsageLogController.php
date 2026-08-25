<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiUsageLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApiUsageLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $logs = ApiUsageLog::with([
            'user:id,name,email',
            'generation:id,prompt,status',
            'aiProvider:id,name,slug,driver_key',
        ])
            ->latest()
            ->paginate(20);

        return response()->json([
            'message' => 'API usage logs retrieved successfully.',
            'data' => $logs,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $log = ApiUsageLog::with([
            'user:id,name,email',
            'generation:id,prompt,status',
            'aiProvider:id,name,slug,driver_key',
        ])->findOrFail($id);

        return response()->json([
            'message' => 'API usage log retrieved successfully.',
            'data' => $log,
        ]);
    }
}
