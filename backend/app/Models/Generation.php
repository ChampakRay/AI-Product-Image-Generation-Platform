<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Generation extends Model
{
    use HasFactory;

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
}
