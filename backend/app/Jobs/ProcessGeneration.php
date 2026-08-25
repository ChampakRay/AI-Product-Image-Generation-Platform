<?php

namespace App\Jobs;

use App\Models\ApiUsageLog;
use App\Models\Generation;
use App\Models\AiProvider;
use App\Services\AI\AiProviderManager;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class ProcessGeneration implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 180;

    public function __construct(
        public int $generationId
    ) {
    }

    public function handle(
        AiProviderManager $aiProviderManager
    ): void {
        $generation = Generation::with([
            'aiProvider',
            'aiModel',
            'referenceImages',
        ])->find($this->generationId);

        if (!$generation) {
            return;
        }

        if ($generation->status === 'completed') {
            return;
        }

        $provider = $generation->aiProvider;
        $model = $generation->aiModel;

        if (!$provider || !$model) {
            $this->failGeneration(
                $generation,
                'The selected AI model or provider is not available.'
            );

            return;
        }

        $generation->update([
            'status' => 'processing',
            'error_message' => null,
        ]);

        $referenceImages = $generation->referenceImages
            ->map(function ($image) {
                return [
                    'path' => $image->file_path,
                    'original_filename' =>
                        $image->original_filename,
                    'mime_type' => $image->mime_type,
                    'size_bytes' => $image->size_bytes,
                ];
            })
            ->values()
            ->all();

        $startTime = microtime(true);

        try {
            $driver = $aiProviderManager->resolve(
                $provider
            );

            $result = $driver->generate(
                $generation->prompt,
                $referenceImages,
                $generation->aspect_ratio,
                [
                    'model' => $model->model_key,
                    'output_quality' =>
                        $generation->output_quality,
                ]
            );

            $generationTimeMs = (int) round(
                (microtime(true) - $startTime) * 1000
            );

            $requestPayload = [
                'model' => $model->model_key,
                'model_id' => $model->id,
                'provider' => $provider->slug,
                'prompt' => $generation->prompt,
                'aspect_ratio' =>
                    $generation->aspect_ratio,
                'output_quality' =>
                    $generation->output_quality,
                'reference_image_count' =>
                    count($referenceImages),
            ];

            if (!($result['success'] ?? false)) {
                $errorMessage =
                    $result['message'] ??
                    'Image generation failed.';

                $this->logApiUsage(
                    $generation,
                    $provider,
                    $requestPayload,
                    502,
                    $generationTimeMs,
                    $errorMessage
                );

                $this->failGeneration(
                    $generation,
                    $errorMessage,
                    $generationTimeMs
                );

                return;
            }

            $this->logApiUsage(
                $generation,
                $provider,
                $requestPayload,
                200,
                $generationTimeMs
            );

            $generation->update([
                'status' => 'completed',
                'output_image_path' =>
                    $result['output_image_path'] ?? null,
                'generation_time_ms' =>
                    $generationTimeMs,
                'error_message' => null,
            ]);
        } catch (Throwable $exception) {
            $generationTimeMs = (int) round(
                (microtime(true) - $startTime) * 1000
            );

            $this->failGeneration(
                $generation,
                $exception->getMessage(),
                $generationTimeMs
            );
        }
    }

    private function failGeneration(
        Generation $generation,
        string $errorMessage,
        ?int $generationTimeMs = null
    ): void {
        $generation->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'generation_time_ms' =>
                $generationTimeMs ??
                $generation->generation_time_ms,
        ]);
    }

    private function logApiUsage(
        Generation $generation,
        AiProvider $provider,
        array $requestPayload,
        int $responseStatus,
        int $responseTimeMs,
        ?string $errorMessage = null
    ): void {
        ApiUsageLog::create([
            'user_id' => $generation->user_id,
            'generation_id' => $generation->id,
            'ai_provider_id' => $provider->id,
            'endpoint' => 'images/generations',
            'request_payload' => $requestPayload,
            'response_status' => $responseStatus,
            'response_time_ms' => $responseTimeMs,
            'error_message' => $errorMessage,
        ]);
    }
}
