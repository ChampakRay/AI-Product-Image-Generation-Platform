<?php

namespace Database\Seeders;

use App\Models\AiProvider;
use Illuminate\Database\Seeder;

class AiProviderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        AiProvider::updateOrCreate(
            ['slug' => 'openai'],
            [
                'name' => 'OpenAI Image Provider',
                'driver_key' => 'openai',
                'api_key' => null,
                'endpoint_url' => null,
                'is_active' => true,
                'is_default' => true,
            ]
        );
    }
}
