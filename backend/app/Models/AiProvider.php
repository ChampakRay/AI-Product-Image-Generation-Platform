<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiProvider extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'driver_key',
        'api_key',
        'endpoint_url',
        'is_active',
        'is_default',
    ];

    public function generations(): HasMany
    {
        return $this->hasMany(Generation::class);
    }

    public function apiUsageLogs(): HasMany
    {
        return $this->hasMany(ApiUsageLog::class);
    }
    public function aiModels(): HasMany
    {
        return $this->hasMany(AiModel::class);
    }
}
