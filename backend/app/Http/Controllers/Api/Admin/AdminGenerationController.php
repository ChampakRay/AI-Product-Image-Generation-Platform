<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Generation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminGenerationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Generation::query()
            ->with([
                'user:id,name,email',
                'product:id,name',
                'aiProvider:id,name',
                'aiModel:id,name',
            ])
            ->latest();

        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */

        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($query) use ($search) {
                $query
                    ->where('prompt', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($query) use ($search) {
                        $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('product', function ($query) use ($search) {
                        $query->where(
                            'name',
                            'like',
                            "%{$search}%"
                        );
                    })
                    ->orWhereHas('aiModel', function ($query) use ($search) {
                        $query->where(
                            'name',
                            'like',
                            "%{$search}%"
                        );
                    });
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Status filter
        |--------------------------------------------------------------------------
        */

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->input('status')
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */

        $perPage = min(
            max((int) $request->input('per_page', 20), 1),
            100
        );

        $generations = $query->paginate($perPage);

        return response()->json([
            'message' => 'Admin generations retrieved successfully.',
            'data' => $generations,
        ]);
    }

    public function show(int $generationId): JsonResponse
    {
        $generation = Generation::query()
            ->with([
                'user:id,name,email',
                'product',
                'aiProvider',
                'aiModel',
                'referenceImages',
                'parentGeneration',
                'childGenerations',
                'apiUsageLogs',
            ])
            ->findOrFail($generationId);

        return response()->json([
            'message' => 'Generation retrieved successfully.',
            'data' => $generation,
        ]);
    }

    public function destroy(int $generationId): JsonResponse
{
    $generation = Generation::query()
        ->with('referenceImages')
        ->findOrFail($generationId);

    /*
    |--------------------------------------------------------------------------
    | Delete reference image files
    |--------------------------------------------------------------------------
    */

    foreach ($generation->referenceImages as $referenceImage) {
        if ($referenceImage->file_path) {
            Storage::disk('public')->delete(
                $referenceImage->file_path
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Delete generated image
    |--------------------------------------------------------------------------
    */

    if ($generation->output_image_path) {
        Storage::disk('public')->delete(
            $generation->output_image_path
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Preserve child generations
    |--------------------------------------------------------------------------
    |
    | If this generation was the parent of a regeneration,
    | detach the children instead of deleting them.
    |
    */

    Generation::where(
        'parent_generation_id',
        $generation->id
    )->update([
        'parent_generation_id' => null,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Remove related database records
    |--------------------------------------------------------------------------
    */

    $generation->referenceImages()->delete();

    $generation->apiUsageLogs()->delete();

    /*
    |--------------------------------------------------------------------------
    | Delete generation
    |--------------------------------------------------------------------------
    */

    $generation->delete();

    return response()->json([
        'message' =>
            'Generation deleted successfully.',
    ]);
}

}
