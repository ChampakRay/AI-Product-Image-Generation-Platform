<?php

namespace App\Services\AI;

class DefaultImageProvider implements ImageGenerationProvider
{
    public function generate(
        string $prompt,
        array $referenceImages = [],
        ?string $aspectRatio = null,
        array $options = []
    ): array {
        return [
            'success' => false,
            'message' => 'AI image generation provider is not configured yet.',
        ];
    }
}
