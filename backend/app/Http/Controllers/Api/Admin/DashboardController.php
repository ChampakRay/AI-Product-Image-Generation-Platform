<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiProvider;
use App\Models\ApiUsageLog;
use App\Models\Generation;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $generationStats = Generation::selectRaw(
            'status, COUNT(*) as total'
        )
            ->groupBy('status')
            ->pluck('total', 'status');

        $averageResponseTime = ApiUsageLog::avg('response_time_ms');

        return response()->json([
            'message' => 'Admin dashboard data retrieved successfully.',
            'data' => [
                'users' => [
                    'total' => User::count(),
                    'active' => User::where('status', 'active')->count(),
                ],

                'products' => [
                    'total' => Product::count(),
                    'active' => Product::where('is_active', true)->count(),
                ],

                'generations' => [
                    'total' => Generation::count(),
                    'pending' => $generationStats->get('pending', 0),
                    'processing' => $generationStats->get('processing', 0),
                    'completed' => $generationStats->get('completed', 0),
                    'failed' => $generationStats->get('failed', 0),
                ],

                'ai_providers' => [
                    'total' => AiProvider::count(),
                    'active' => AiProvider::where('is_active', true)->count(),
                ],

                'api_usage' => [
                    'total_requests' => ApiUsageLog::count(),
                    'successful_requests' => ApiUsageLog::where(
                        'response_status',
                        '>=',
                        200
                    )->where(
                        'response_status',
                        '<',
                        300
                    )->count(),

                    'failed_requests' => ApiUsageLog::where(
                        'response_status',
                        '>=',
                        400
                    )->count(),

                    'average_response_time_ms' => $averageResponseTime !== null
                        ? round($averageResponseTime, 2)
                        : 0,
                ],
            ],
        ]);
    }
}
