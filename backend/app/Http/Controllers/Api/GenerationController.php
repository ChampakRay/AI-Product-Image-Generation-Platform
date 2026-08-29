<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GenerationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use RuntimeException;


class GenerationController extends Controller
{
    public function __construct(
        private GenerationService $generationService
    ) {
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => [
                'required',
                'integer',
                'exists:products,id',
            ],

            'ai_model_id' => [
                'required',
                'integer',
                'exists:ai_models,id',
            ],

            'prompt' => [
                'required',
                'string',
                'min:3',
                'max:5000',
            ],

            'aspect_ratio' => [
                'nullable',
                'string',
                'in:1:1,16:9,9:16',
            ],

            'output_quality' => [
                'required',
                'string',
                'in:standard,high,ultra',
            ],

            'reference_images' => [
                'nullable',
                'array',
                'max:16',
            ],

            'reference_images.*.path' => [
                'required',
                'string',
                function ($attribute, $value, $fail) use ($request) {
                    $prefix = 'reference-images/' . $request->user()->id . '/';

                    if (!str_starts_with($value, $prefix)) {
                        $fail('Invalid reference image.');
                    }

                    if (!Storage::disk('public')->exists($value)) {
                        $fail('Reference image not found.');
                    }
                },
            ],

            'reference_images.*.original_filename' => [
                'required',
                'string',
                'max:255',
            ],

            'reference_images.*.mime_type' => [
                'required',
                'string',
                'in:image/jpeg,image/png,image/webp',
            ],

            'reference_images.*.size_bytes' => [
                'required',
                'integer',
                'min:1',
                'max:10485760',
            ],
        ]);

        try {
            $generation = $this->generationService->createGeneration(
                userId: $request->user()->id,
                productId: $validated['product_id'],
                aiModelId: $validated['ai_model_id'],
                prompt: $validated['prompt'],
                referenceImages: $validated['reference_images'] ?? [],
                aspectRatio: $validated['aspect_ratio'] ?? null,
                outputQuality: $validated['output_quality'],
            );

            return response()->json([
                'message' => 'Generation created successfully.',
                'data' => $generation,
            ], 201);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => 'Image generation failed.',
                'error' => $exception->getMessage(),
            ], 502);
        }
    }

    public function index(Request $request): JsonResponse
    {
        $generations = $this->generationService->getUserGenerations(
            $request->user()->id
        );

        return response()->json([
            'message' => 'Generations retrieved successfully.',
            'data' => $generations,
        ]);
    }

    public function show(
        Request $request,
        int $generationId
    ): JsonResponse {
        $generation = $this->generationService->getUserGeneration(
            $request->user()->id,
            $generationId
        );

        return response()->json([
            'message' => 'Generation retrieved successfully.',
            'data' => $generation,
        ]);
    }

        public function regenerate(
        Request $request,
        int $generationId
        ): JsonResponse {
        try {
               $generation = $this->generationService->regenerateGeneration(
                userId: $request->user()->id,
                generationId: $generationId,
               );

            return response()->json([
                   'message' => 'Generation queued successfully.',
                'data' => $generation,
            ], 201);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => 'Regeneration failed.',
                'error' => $exception->getMessage(),
            ], 422);
        }
    }

            public function download(
            Request $request,
            int $generationId
        ) {
            $generation = $this->generationService->getUserGeneration(
                $request->user()->id,
                $generationId
            );

            if (!$generation->output_image_path) {
                return response()->json([
                    'message' => 'This generation does not have a downloadable image.',
                ], 404);
            }

            $disk = Storage::disk('public');

            if (!$disk->exists($generation->output_image_path)) {
                return response()->json([
                    'message' => 'The generated image file could not be found.',
                ], 404);
            }

            $extension = pathinfo(
                $generation->output_image_path,
                PATHINFO_EXTENSION
            ) ?: 'png';

            $filename =
                'generation-' .
                $generation->id .
                '.' .
                $extension;

            $filePath = $disk->path(
            $generation->output_image_path
            );

            $mimeType = mime_content_type($filePath)
                ?: 'application/octet-stream';

            return response()->download(
                $filePath,
                $filename,
                [
                    'Content-Type' => $mimeType,
                ]
            );
        }

    public function destroy(
        Request $request,
        int $generationId
    ): JsonResponse {
        $this->generationService->deleteUserGeneration(
            $request->user()->id,
            $generationId
        );

        return response()->json([
            'message' => 'Generation deleted successfully.',
        ]);
    }
}
