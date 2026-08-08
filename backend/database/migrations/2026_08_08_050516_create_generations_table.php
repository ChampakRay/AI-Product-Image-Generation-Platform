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
    Schema::create('generations', function (Blueprint $table) {
        $table->id();

        $table->foreignId('user_id')->constrained('users');
        $table->foreignId('product_id')->constrained('products');
        $table->foreignId('ai_provider_id')->constrained('ai_providers');

        $table->foreignId('parent_generation_id')
            ->nullable()
            ->constrained('generations');

        $table->text('prompt');
        $table->string('aspect_ratio', 20)->nullable();

        $table->enum('status', [
            'pending',
            'processing',
            'completed',
            'failed'
        ])->default('pending');

        $table->string('output_image_path')->nullable();
        $table->text('error_message')->nullable();
        $table->integer('generation_time_ms')->nullable();

        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('generations');
    }
};
