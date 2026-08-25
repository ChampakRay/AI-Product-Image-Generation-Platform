<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'T-shirt',
                'slug' => 't-shirt',
                'description' => 'AI-generated product images for T-shirts.',
                'icon_or_thumbnail' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Mug',
                'slug' => 'mug',
                'description' => 'AI-generated product images for mugs.',
                'icon_or_thumbnail' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Photo Frame',
                'slug' => 'photo-frame',
                'description' => 'AI-generated product images for photo frames.',
                'icon_or_thumbnail' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Pillow',
                'slug' => 'pillow',
                'description' => 'AI-generated product images for pillows.',
                'icon_or_thumbnail' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Keychain',
                'slug' => 'keychain',
                'description' => 'AI-generated product images for keychains.',
                'icon_or_thumbnail' => null,
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(
                ['slug' => $product['slug']],
                $product
            );
        }
    }
}
