<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AiProviderController extends Controller
{
    public function index(): JsonResponse
    {
        $providers = AiProvider::query()
            ->withCount('aiModels')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'slug',
                'driver_key',
                'endpoint_url',
                'is_active',
                'is_default',
                'created_at',
                'updated_at',
            ]);

        return response()->json([
            'data' => $providers,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:255',
                'alpha_dash',
                'unique:ai_providers,slug',
            ],

            'driver_key' => [
                'required',
                'string',
                'max:100',
            ],

            'api_key' => [
                'required',
                'string',
                'max:5000',
            ],

            'endpoint_url' => [
                'nullable',
                'url',
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
        ]);

        $provider = AiProvider::create([
            'name' => $validated['name'],

            'slug' => $validated['slug']
                ?? Str::slug($validated['name']),

            'driver_key' => $validated['driver_key'],

            'api_key' => $validated['api_key'],

            'endpoint_url' =>
                $validated['endpoint_url'] ?? null,

            'is_active' =>
                $validated['is_active'] ?? true,

            'is_default' => false,
        ]);

        if ($request->boolean('is_default')) {
            $this->makeDefault($provider);
        }

        return response()->json([
            'message' =>
                'AI provider created successfully.',

            'data' => $provider->makeHidden([
                'api_key',
            ]),
        ], 201);
    }

    public function show(
        AiProvider $aiProvider
    ): JsonResponse {
        $aiProvider->load('aiModels');

        return response()->json([
            'data' => $aiProvider->makeHidden([
                'api_key',
            ]),
        ]);
    }

    public function update(
        Request $request,
        AiProvider $aiProvider
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                'alpha_dash',

                Rule::unique(
                    'ai_providers',
                    'slug'
                )->ignore($aiProvider->id),
            ],

            'driver_key' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],

            'api_key' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'endpoint_url' => [
                'nullable',
                'url',
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
        ]);

        /*
         * If the API key field is left empty,
         * keep the existing key.
         */
        if (
            array_key_exists(
                'api_key',
                $validated
            )
            && empty($validated['api_key'])
        ) {
            unset($validated['api_key']);
        }

        $aiProvider->update($validated);

        if ($request->boolean('is_default')) {
            $this->makeDefault($aiProvider);
        }

        return response()->json([
            'message' =>
                'AI provider updated successfully.',

            'data' => $aiProvider
                ->fresh()
                ->makeHidden([
                    'api_key',
                ]),
        ]);
    }

    public function destroy(
        AiProvider $aiProvider
    ): JsonResponse {
        if (
            $aiProvider
                ->generations()
                ->exists()
        ) {
            return response()->json([
                'message' =>
                    'This provider cannot be deleted because it has generation history. Disable it instead.',
            ], 422);
        }

        $aiProvider->delete();

        return response()->json([
            'message' =>
                'AI provider deleted successfully.',
        ]);
    }

    private function makeDefault(
        AiProvider $provider
    ): void {
        AiProvider::whereKeyNot(
            $provider->id
        )->update([
            'is_default' => false,
        ]);

        $provider->update([
            'is_default' => true,
        ]);
    }
}
