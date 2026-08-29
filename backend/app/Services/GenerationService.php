<?php

namespace App\Services;

use App\Jobs\ProcessGeneration;
use App\Models\AiModel;
use App\Models\AiProvider;
use App\Models\Generation;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class GenerationService
{
    public function createGeneration(
        int $userId,
        int $productId,
        int $aiModelId,
        string $prompt,
        array $referenceImages = [],
        ?string $aspectRatio = null,
        string $outputQuality = 'high',
        ?int $parentGenerationId = null
    ): Generation {
        $product = Product::where('id', $productId)
            ->where('is_active', true)
            ->firstOrFail();

        $model = AiModel::query()
            ->where('id', $aiModelId)
            ->where('is_active', true)
            ->whereHas('aiProvider', function ($query) {
                $query->where('is_active', true);
            })
            ->with('aiProvider')
            ->first();

        if (!$model) {
            throw new RuntimeException(
                'The selected AI model is not available.'
            );
        }

        $provider = $model->aiProvider;

        if (!$provider) {
            throw new RuntimeException(
                'The selected AI model does not have a valid AI provider.'
            );
        }

        if (!in_array(
            $outputQuality,
            ['standard', 'high', 'ultra'],
            true
        )) {
            throw new RuntimeException(
                'The selected output quality is not supported.'
            );
        }

        if ($outputQuality === 'ultra') {
            throw new RuntimeException(
                'Ultra / 4K output is not available yet.'
            );
        }

        $generation = DB::transaction(function () use (
            $userId,
            $productId,
            $provider,
            $model,
            $prompt,
            $aspectRatio,
            $outputQuality,
            $parentGenerationId,
            $referenceImages
        ) {
            $generation = Generation::create([
                'user_id' => $userId,
                'product_id' => $productId,
                'ai_provider_id' => $provider->id,
                'ai_model_id' => $model->id,
                'parent_generation_id' => $parentGenerationId,
                'prompt' => $prompt,
                'aspect_ratio' => $aspectRatio,
                'output_quality' => $outputQuality,
                'status' => 'pending',
            ]);

            foreach ($referenceImages as $image) {
                $generation->referenceImages()->create([
                    'file_path' => $image['path'],
                    'original_filename' =>
                        $image['original_filename'],
                    'mime_type' =>
                        $image['mime_type'],
                    'size_bytes' =>
                        $image['size_bytes'],
                ]);
            }

            return $generation;
        });

        ProcessGeneration::dispatch(
            $generation->id
        );

        return $generation->fresh([
            'product',
            'aiProvider',
            'aiModel',
            'referenceImages',
            'apiUsageLogs',
        ]);
    }

    public function regenerateGeneration(
        int $userId,
        int $generationId
    ): Generation {
        $originalGeneration = Generation::where('user_id', $userId)
            ->with([
                'product',
                'aiProvider',
                'aiModel',
                'referenceImages',
            ])
            ->findOrFail($generationId);

        if ($originalGeneration->status !== 'completed') {
            throw new RuntimeException(
                'Only completed generations can be regenerated.'
            );
        }

        if (!$originalGeneration->aiModel) {
            throw new RuntimeException(
                'The AI model for this generation is no longer available.'
            );
        }

        $referenceImages = $originalGeneration->referenceImages
            ->map(function ($image) {
                return [
                    'path' =>
                        $image->file_path,
                    'original_filename' =>
                        $image->original_filename,
                    'mime_type' =>
                        $image->mime_type,
                    'size_bytes' =>
                        $image->size_bytes,
                ];
            })
            ->values()
            ->all();

        return $this->createGeneration(
            userId: $userId,
            productId: $originalGeneration->product_id,
            aiModelId: $originalGeneration->ai_model_id,
            prompt: $originalGeneration->prompt,
            referenceImages: $referenceImages,
            aspectRatio: $originalGeneration->aspect_ratio,
            outputQuality: $originalGeneration->output_quality,
            parentGenerationId: $originalGeneration->id,
        );
    }

    public function getUserGenerations(int $userId)
    {
        return Generation::where('user_id', $userId)
            ->with([
                'product',
                'aiProvider',
                'aiModel',
                'referenceImages',
            ])
            ->latest()
            ->paginate(20);
    }

    public function getUserGeneration(
        int $userId,
        int $generationId
    ): Generation {
        return Generation::where('user_id', $userId)
            ->with([
                'product',
                'aiProvider',
                'aiModel',
                'referenceImages',
                'parentGeneration',
                'childGenerations',
            ])
            ->findOrFail($generationId);
    }

    public function deleteUserGeneration(
    int $userId,
    int $generationId
    ): void {
    $generation = Generation::where(
        'user_id',
        $userId
    )
        ->with('referenceImages')
        ->findOrFail($generationId);

    /*
    |--------------------------------------------------------------------------
    | Delete reference image files
    |--------------------------------------------------------------------------
    */

    foreach ($generation->referenceImages as $referenceImage) {
        if ($referenceImage->file_path) {
            \Illuminate\Support\Facades\Storage::disk(
                'public'
            )->delete(
                $referenceImage->file_path
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Delete generated image
    |--------------------------------------------------------------------------
    */

    if ($generation->output_image_path) {
        \Illuminate\Support\Facades\Storage::disk(
            'public'
        )->delete(
            $generation->output_image_path
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Preserve child generations
    |--------------------------------------------------------------------------
    */

    Generation::where(
        'parent_generation_id',
        $generation->id
    )->update([
        'parent_generation_id' => null,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Delete related database records
    |--------------------------------------------------------------------------
    */

    $generation->referenceImages()->delete();

    $generation->apiUsageLogs()->delete();

    /*
    |--------------------------------------------------------------------------
    | Delete generation
    |--------------------------------------------------------------------------
    */

    $generation->delete();
    }
}
