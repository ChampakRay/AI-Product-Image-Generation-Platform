<?php

namespace App\Services\AI;

interface ImageGenerationProvider
{
    /**
     * Generate an image using the configured AI provider.
     *
     * @param string $prompt
     * @param array $referenceImages
     * @param string|null $aspectRatio
     * @param array $options
     * @return array
     */
    public function generate(
        string $prompt,
        array $referenceImages = [],
        ?string $aspectRatio = null,
        array $options = []
    ): array;
}
