<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Storage;
use OpenAI\Laravel\Facades\OpenAI;
use RuntimeException;

class OpenAIImageProvider implements ImageGenerationProvider
{
    public function generate(
        string $prompt,
        array $referenceImages = [],
        ?string $aspectRatio = null,
        array $options = []
    ): array {
        try {
            $model = $options['model'] ?? null;

            if (!$model) {
                throw new RuntimeException(
                    'AI image model was not specified.'
                );
            }

            if (empty($referenceImages)) {
                $response = OpenAI::images()->create([
                    'model' => $model,
                    'prompt' => $prompt,
                    'size' => $this->resolveSize($aspectRatio),
                ]);
            } else {
                $images = [];

                foreach ($referenceImages as $referenceImage) {
                    $path = $referenceImage['path'] ?? null;

                    if (!$path) {
                        throw new RuntimeException(
                            'Reference image path is missing.'
                        );
                    }

                    $fullPath = storage_path(
                        'app/public/' . $path
                    );

                    if (!is_file($fullPath)) {
                        throw new RuntimeException(
                            "Reference image not found: {$path}"
                        );
                    }

                    $images[] = fopen($fullPath, 'rb');
                }

                try {
                    $response = OpenAI::images()->edit([
                        'model' => $model,
                        'image' => $images,
                        'prompt' => $prompt,
                        'size' => $this->resolveSize($aspectRatio),
                    ]);
                } finally {
                    foreach ($images as $image) {
                        if (is_resource($image)) {
                            fclose($image);
                        }
                    }
                }
            }

            $image = $response->data[0] ?? null;

            if (!$image) {
                throw new RuntimeException(
                    'OpenAI did not return an image.'
                );
            }

            if (empty($image->b64_json)) {
                throw new RuntimeException(
                    'OpenAI returned an image without image data.'
                );
            }

            $imageData = base64_decode(
                $image->b64_json,
                true
            );

            if ($imageData === false) {
                throw new RuntimeException(
                    'Failed to decode the generated image.'
                );
            }

            $outputPath =
                'generated-images/' .
                uniqid('', true) .
                '.png';

            Storage::disk('public')->put(
                $outputPath,
                $imageData
            );

            return [
                'success' => true,
                'output_image_path' => $outputPath,
            ];
        } catch (\Throwable $exception) {
            return [
                'success' => false,
                'message' => $exception->getMessage(),
            ];
        }
    }

    private function resolveSize(
        ?string $aspectRatio
    ): string {
        return match ($aspectRatio) {
            '16:9' => '1536x1024',
            '9:16' => '1024x1536',
            default => '1024x1024',
        };
    }
}
