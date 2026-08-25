<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class HuggingFaceImageProvider implements ImageGenerationProvider
{
    public function generate(
        string $prompt,
        array $referenceImages = [],
        ?string $aspectRatio = null,
        array $options = []
    ): array {
        try {
            $apiKey = config(
                'services.huggingface.api_key'
            );

            if (!$apiKey) {
                throw new RuntimeException(
                    'Hugging Face API key is not configured.'
                );
            }

            $model = $options['model'] ?? null;

            if (!$model) {
                throw new RuntimeException(
                    'AI image model was not specified.'
                );
            }

            /*
             * Currently FLUX.1 Kontext requires
             * a reference image.
             */
            if (empty($referenceImages)) {
                throw new RuntimeException(
                    'A reference image is required when using FLUX.1 Kontext.'
                );
            }

            $referenceImage =
                $referenceImages[0];

            $path =
                $referenceImage['path']
                ?? null;

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

            $imageData =
                file_get_contents($fullPath);

            if ($imageData === false) {
                throw new RuntimeException(
                    'Unable to read the reference image.'
                );
            }

            /*
             * Output quality is persisted on the
             * generation and passed through the queue
             * job in $options.
             */
            $outputQuality =
                $options['output_quality']
                ?? 'high';

            if (!in_array(
                $outputQuality,
                ['standard', 'high'],
                true
            )) {
                throw new RuntimeException(
                    'The selected output quality is not supported.'
                );
            }

            /*
             * Hugging Face routes the request
             * to the configured FAL provider.
             */
            $url =
                'https://router.huggingface.co/fal-ai/fal-ai/flux-kontext/dev';

            $mimeType =
                $referenceImage['mime_type']
                ?? 'image/jpeg';

            $imageUrl = sprintf(
                'data:%s;base64,%s',
                $mimeType,
                base64_encode($imageData)
            );

            /*
             * Determine requested output size.
             *
             * Standard:
             * Smaller/faster output.
             *
             * High:
             * Larger output for better final quality.
             *
             * We keep the dimensions proportional
             * to the requested aspect ratio.
             */
            $imageSize = $this->resolveImageSize(
                $aspectRatio,
                $outputQuality
            );

            $requestBody = [
                'prompt' => $prompt,
                'image_url' => $imageUrl,
                'image_size' => $imageSize,
            ];

            $response = Http::withToken($apiKey)
                ->timeout(180)
                ->post(
                    $url,
                    $requestBody
                );

            if (!$response->successful()) {
                $message =
                    $response->json('error')
                    ?? $response->body()
                    ?? 'Hugging Face image generation failed.';

                throw new RuntimeException(
                    is_string($message)
                        ? $message
                        : 'Hugging Face image generation failed.'
                );
            }

            /*
             * FAL returns JSON containing the
             * generated image URL.
             */
            $generatedImageUrl =
                $response->json(
                    'images.0.url'
                );

            if (
                !is_string(
                    $generatedImageUrl
                )
                || empty(
                    $generatedImageUrl
                )
            ) {
                throw new RuntimeException(
                    'Hugging Face did not return a generated image URL.'
                );
            }

            /*
             * Download the actual generated image.
             */
            $generatedImageResponse =
                Http::timeout(120)
                    ->get(
                        $generatedImageUrl
                    );

            if (
                !$generatedImageResponse
                    ->successful()
            ) {
                throw new RuntimeException(
                    'Unable to download the generated image from the AI provider.'
                );
            }

            $generatedImage =
                $generatedImageResponse
                    ->body();

            if (
                empty($generatedImage)
            ) {
                throw new RuntimeException(
                    'The generated image response was empty.'
                );
            }

            /*
             * Determine the actual content type.
             *
             * Prefer the downloaded image's
             * Content-Type because this is the
             * actual file we are saving.
             */
            $contentType =
                $generatedImageResponse
                    ->header(
                        'Content-Type'
                    );

            /*
             * Some servers may include parameters,
             * e.g. image/jpeg; charset=utf-8.
             */
            if ($contentType) {
                $contentType =
                    strtolower(
                        trim(
                            explode(
                                ';',
                                $contentType
                            )[0]
                        )
                    );
            }

            /*
             * Fall back to FAL's metadata.
             */
            if (
                !$contentType ||
                !str_starts_with(
                    $contentType,
                    'image/'
                )
            ) {
                $contentType =
                    $response->json(
                        'images.0.content_type'
                    );
            }

            /*
             * Verify that the response is actually
             * an image before saving it.
             */
            $imageInfo =
                @getimagesizefromstring(
                    $generatedImage
                );

            if (
                $imageInfo === false
            ) {
                throw new RuntimeException(
                    'The AI provider returned data that is not a valid image.'
                );
            }

            /*
             * Determine the actual format from
             * the binary image when possible.
             */
            $extension =
                $this->resolveImageExtension(
                    $imageInfo,
                    $contentType
                );

            $outputPath =
                'generated-images/' .
                uniqid('', true) .
                '.' .
                $extension;

            Storage::disk('public')->put(
                $outputPath,
                $generatedImage
            );

            return [
                'success' => true,
                'output_image_path' =>
                    $outputPath,
            ];
        } catch (\Throwable $exception) {
            return [
                'success' => false,
                'message' =>
                    $exception->getMessage(),
            ];
        }
    }

    /**
     * Resolve the output dimensions according
     * to aspect ratio and requested quality.
     */
    private function resolveImageSize(
        ?string $aspectRatio,
        string $outputQuality
    ): array {
        /*
         * High quality uses larger dimensions.
         *
         * Standard uses smaller dimensions.
         */
        $longSide =
            $outputQuality === 'high'
                ? 1536
                : 1024;

        return match ($aspectRatio) {
            '16:9' => [
                'width' => $longSide,
                'height' =>
                    (int) round(
                        $longSide * 9 / 16
                    ),
            ],

            '9:16' => [
                'width' =>
                    (int) round(
                        $longSide * 9 / 16
                    ),
                'height' => $longSide,
            ],

            default => [
                'width' => $longSide,
                'height' => $longSide,
            ],
        };
    }

    /**
     * Determine the correct file extension from
     * the actual generated image.
     */
    private function resolveImageExtension(
        array $imageInfo,
        ?string $contentType
    ): string {
        $imageType =
            $imageInfo[2] ?? null;

        /*
         * IMAGETYPE constants:
         *
         * 1  = GIF
         * 2  = JPEG
         * 3  = PNG
         * 6  = BMP
         * 18 = WEBP
         */
        return match ($imageType) {
            IMAGETYPE_PNG =>
                'png',

            IMAGETYPE_WEBP =>
                'webp',

            IMAGETYPE_JPEG =>
                'jpg',

            default => match (
                $contentType
            ) {
                'image/png' =>
                    'png',

                'image/webp' =>
                    'webp',

                'image/jpeg',
                'image/jpg' =>
                    'jpg',

                default =>
                    'jpg',
            },
        };
    }
}
