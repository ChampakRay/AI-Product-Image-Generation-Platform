<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiUsageLog;
use App\Models\Generation;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index(): JsonResponse
    {
        /*
        |--------------------------------------------------------------------------
        | Generation statistics
        |--------------------------------------------------------------------------
        */

        $generationStats = Generation::query()
            ->select(
                'status',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('status')
            ->pluck('total', 'status');

        $totalGenerations = Generation::count();

        $completedGenerations =
            (int) $generationStats->get(
                'completed',
                0
            );

        $failedGenerations =
            (int) $generationStats->get(
                'failed',
                0
            );

        $successRate = $totalGenerations > 0
            ? round(
                ($completedGenerations /
                    $totalGenerations) * 100,
                2
            )
            : 0;

        /*
        |--------------------------------------------------------------------------
        | Generations per day
        |--------------------------------------------------------------------------
        */

        $startDate = Carbon::today()->subDays(6);

        $dailyGenerations = Generation::query()
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total')
            )
            ->where(
                'created_at',
                '>=',
                $startDate
            )
            ->groupBy(
                DB::raw('DATE(created_at)')
            )
            ->orderBy('date')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Fill missing days with zero
        |--------------------------------------------------------------------------
        */

        $generationsPerDay = collect();

        for (
            $date = $startDate->copy();
            $date->lte(Carbon::today());
            $date->addDay()
        ) {
            $dateString = $date->toDateString();

            $record = $dailyGenerations->firstWhere(
                'date',
                $dateString
            );

            $generationsPerDay->push([
                'date' => $dateString,
                'total' => $record
                    ? (int) $record->total
                    : 0,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Provider usage
        |--------------------------------------------------------------------------
        */

        $providerUsage = ApiUsageLog::query()
            ->select(
                'ai_provider_id',
                DB::raw('COUNT(*) as total_requests')
            )
            ->with(
                'aiProvider:id,name,slug'
            )
            ->groupBy('ai_provider_id')
            ->orderByDesc('total_requests')
            ->get()
            ->map(function ($record) {
                return [
                    'provider' =>
                        $record->aiProvider?->name ??
                        'Unknown provider',

                    'slug' =>
                        $record->aiProvider?->slug,

                    'total_requests' =>
                        (int) $record->total_requests,
                ];
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | API usage statistics
        |--------------------------------------------------------------------------
        */

        $totalApiRequests =
            ApiUsageLog::count();

        $successfulApiRequests =
            ApiUsageLog::where(
                'response_status',
                '>=',
                200
            )
                ->where(
                    'response_status',
                    '<',
                    300
                )
                ->count();

        $failedApiRequests =
            ApiUsageLog::where(
                'response_status',
                '>=',
                400
            )
                ->count();

        $averageResponseTime =
            ApiUsageLog::avg(
                'response_time_ms'
            );

        $apiSuccessRate =
            $totalApiRequests > 0
                ? round(
                    ($successfulApiRequests /
                        $totalApiRequests) * 100,
                    2
                )
                : 0;

        return response()->json([
            'message' =>
                'Analytics data retrieved successfully.',

            'data' => [
                'generations' => [
                    'total' =>
                        $totalGenerations,

                    'completed' =>
                        $completedGenerations,

                    'processing' =>
                        (int) $generationStats->get(
                            'processing',
                            0
                        ),

                    'pending' =>
                        (int) $generationStats->get(
                            'pending',
                            0
                        ),

                    'failed' =>
                        $failedGenerations,

                    'success_rate' =>
                        $successRate,
                ],

                'generations_per_day' =>
                    $generationsPerDay,

                'providers' =>
                    $providerUsage,

                'api_usage' => [
                    'total_requests' =>
                        $totalApiRequests,

                    'successful_requests' =>
                        $successfulApiRequests,

                    'failed_requests' =>
                        $failedApiRequests,

                    'success_rate' =>
                        $apiSuccessRate,

                    'average_response_time_ms' =>
                        $averageResponseTime !== null
                            ? round(
                                $averageResponseTime,
                                2
                            )
                            : 0,
                ],
            ],
        ]);
    }
}
