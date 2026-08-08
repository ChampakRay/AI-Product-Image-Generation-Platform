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
        Schema::create('reference_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('generation_id')
            ->constrained('generations');

            $table->string('file_path');
            $table->string('original_filename');
            $table->string('mime_type', 100);
            $table->integer('size_bytes');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reference_images');
    }
};
