<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class UploadController extends Controller
{
    public function referenceImage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,webp',
                'max:10240',
            ],
        ]);

        $file = $validated['image'];

        /*
        |--------------------------------------------------------------------------
        | Verify that the uploaded file is a real readable image
        |--------------------------------------------------------------------------
        */

        try {
            $manager = ImageManager::usingDriver(
                Driver::class
            );

            $manager->decodeSplFileInfo($file);

        } catch (\Throwable $exception) {
            Log::warning('Invalid reference image upload.', [
                'user_id' => $request->user()?->id,
                'filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'error' => $exception->getMessage(),
            ]);

            throw ValidationException::withMessages([
                'image' => [
                    'The uploaded file is not a valid image.',
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Store the image in the authenticated user's directory
        |--------------------------------------------------------------------------
        */

        $userId = $request->user()->id;

        $path = $file->store(
            'reference-images/' . $userId,
            'public'
        );

        if (!$path) {
            throw ValidationException::withMessages([
                'image' => [
                    'The image could not be uploaded.',
                ],
            ]);
        }

        return response()->json([
            'message' =>
                'Reference image uploaded successfully.',

            'data' => [
                'path' => $path,
                'original_filename' =>
                    $file->getClientOriginalName(),
                'mime_type' =>
                    $file->getMimeType(),
                'size_bytes' =>
                    $file->getSize(),
            ],
        ], 201);
    }
}
