<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ai_models', function (Blueprint $table) {
            $table->id();

            $table->foreignId('ai_provider_id')
                ->constrained('ai_providers')
                ->cascadeOnDelete();

            $table->string('name');

            $table->string('model_key');

            $table->text('description')->nullable();

            $table->boolean('is_active')->default(true);

            $table->boolean('is_default')->default(false);

            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();

            $table->unique([
                'ai_provider_id',
                'model_key',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_models');
    }
};
