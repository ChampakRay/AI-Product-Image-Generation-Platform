<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiModel;
use Illuminate\Http\JsonResponse;

class AiModelController extends Controller
{
    public function index(): JsonResponse
    {
        $models = AiModel::query()
            ->where('is_active', true)
            ->whereHas('aiProvider', function ($query) {
                $query->where('is_active', true);
            })
            ->with([
                'aiProvider:id,name,slug',
            ])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get([
                'id',
                'ai_provider_id',
                'name',
                'model_key',
                'description',
                'is_default',
                'sort_order',
            ]);

        return response()->json([
            'data' => $models,
        ]);
    }
}
