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
        string $outputQuality = 'high'
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

        /*
         * Make sure only supported quality values
         * can reach the generation pipeline.
         */
        if (!in_array(
            $outputQuality,
            ['standard', 'high', 'ultra'],
            true
        )) {
            throw new RuntimeException(
                'The selected output quality is not supported.'
            );
        }

        /*
         * Ultra is currently a placeholder in the frontend.
         * Actual 4K/upscaling will be implemented later.
         */
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
            $referenceImages
        ) {
            $generation = Generation::create([
                'user_id' => $userId,
                'product_id' => $productId,
                'ai_provider_id' => $provider->id,
                'ai_model_id' => $model->id,
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

        /*
         * Send the generation to the queue.
         *
         * ProcessGeneration will read output_quality
         * from the Generation record and pass it to
         * the AI provider.
         */
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
            ])
            ->findOrFail($generationId);
    }

    public function deleteUserGeneration(
        int $userId,
        int $generationId
    ): void {
        $generation = Generation::where('user_id', $userId)
            ->findOrFail($generationId);

        foreach (
            $generation->referenceImages
            as $referenceImage
        ) {
            \Illuminate\Support\Facades\Storage::disk(
                'public'
            )->delete(
                $referenceImage->file_path
            );
        }

        if ($generation->output_image_path) {
            \Illuminate\Support\Facades\Storage::disk(
                'public'
            )->delete(
                $generation->output_image_path
            );
        }

        $generation->delete();
    }
}
