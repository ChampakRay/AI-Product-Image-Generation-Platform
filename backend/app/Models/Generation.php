<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Generation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'ai_provider_id',
        'ai_model_id',
        'parent_generation_id',
        'prompt',
        'aspect_ratio',
        'output_quality',
        'status',
        'output_image_path',
        'error_message',
        'generation_time_ms',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function aiProvider(): BelongsTo
    {
        return $this->belongsTo(AiProvider::class);
    }

    public function aiModel(): BelongsTo
    {
        return $this->belongsTo(AiModel::class);
    }

    public function parentGeneration(): BelongsTo
    {
        return $this->belongsTo(
            Generation::class,
            'parent_generation_id'
        );
    }

    public function childGenerations(): HasMany
    {
        return $this->hasMany(
            Generation::class,
            'parent_generation_id'
        );
    }

    public function referenceImages(): HasMany
    {
        return $this->hasMany(ReferenceImage::class);
    }

    public function apiUsageLogs(): HasMany
    {
        return $this->hasMany(ApiUsageLog::class);
    }
}
