<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReferenceImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'generation_id',
        'file_path',
        'original_filename',
        'mime_type',
        'size_bytes',
    ];

    public function generation(): BelongsTo
    {
        return $this->belongsTo(Generation::class);
    }
}
