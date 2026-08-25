<?php

namespace App\Services\AI;

use App\Models\AiProvider;
use InvalidArgumentException;

class AiProviderManager
{
    public function resolve(AiProvider $provider): ImageGenerationProvider
    {
        return match ($provider->driver_key) {
            'openai' => app(OpenAIImageProvider::class),
            'huggingface' => app(HuggingFaceImageProvider::class),
            'default' => app(DefaultImageProvider::class),


            default => throw new InvalidArgumentException(
                "Unsupported AI provider driver: {$provider->driver_key}"
            ),
        };
    }
}
