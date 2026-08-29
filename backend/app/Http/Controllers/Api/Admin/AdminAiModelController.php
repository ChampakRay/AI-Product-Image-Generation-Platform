<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAiModelController extends Controller
{
    public function index(): JsonResponse
    {
        $models = AiModel::query()
            ->with('aiProvider:id,name,slug')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $models,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ai_provider_id' => [
                'required',
                'integer',
                'exists:ai_providers,id',
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'model_key' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
                'max:2000',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],

            'is_default' => [
                'sometimes',
                'boolean',
            ],

            'sort_order' => [
                'sometimes',
                'integer',
                'min:0',
            ],
        ]);

        $model = AiModel::create([
            'ai_provider_id' =>
                $validated['ai_provider_id'],

            'name' =>
                $validated['name'],

            'model_key' =>
                $validated['model_key'],

            'description' =>
                $validated['description'] ?? null,

            'is_active' =>
                $validated['is_active'] ?? true,

            'is_default' => false,

            'sort_order' =>
                $validated['sort_order'] ?? 0,
        ]);

        if ($request->boolean('is_default')) {
            $this->makeDefault($model);
        }

        return response()->json([
            'message' =>
                'AI model created successfully.',

            'data' => $model->load(
                'aiProvider:id,name,slug'
            ),
        ], 201);
    }

    public function show(
        AiModel $aiModel
    ): JsonResponse {
        return response()->json([
            'data' => $aiModel->load(
                'aiProvider:id,name,slug'
            ),
        ]);
    }

    public function update(
        Request $request,
        AiModel $aiModel
    ): JsonResponse {
        $validated = $request->validate([
            'ai_provider_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:ai_providers,id',
            ],

            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'model_key' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
                'max:2000',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],

            'is_default' => [
                'sometimes',
                'boolean',
            ],

            'sort_order' => [
                'sometimes',
                'integer',
                'min:0',
            ],
        ]);

        $aiModel->update($validated);

        if ($request->boolean('is_default')) {
            $this->makeDefault($aiModel);
        }

        return response()->json([
            'message' =>
                'AI model updated successfully.',

            'data' => $aiModel
                ->fresh()
                ->load(
                    'aiProvider:id,name,slug'
                ),
        ]);
    }

    public function destroy(
        AiModel $aiModel
    ): JsonResponse {
        if (
            $aiModel
                ->generations()
                ->exists()
        ) {
            return response()->json([
                'message' =>
                    'This model cannot be deleted because it has generation history. Disable it instead.',
            ], 422);
        }

        $aiModel->delete();

        return response()->json([
            'message' =>
                'AI model deleted successfully.',
        ]);
    }

    private function makeDefault(
        AiModel $model
    ): void {
        AiModel::whereKeyNot(
            $model->id
        )->update([
            'is_default' => false,
        ]);

        $model->update([
            'is_default' => true,
        ]);
    }
}
