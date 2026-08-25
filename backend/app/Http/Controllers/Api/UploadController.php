<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class UploadController extends Controller
{
    public function referenceImage(Request $request): JsonResponse
    {
        Log::info('Reference image upload debug', [
    'files' => $_FILES['image'] ?? null,
    ]);

        $validated = $request->validate([
            'image' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,webp',
                'max:10240',
            ],
        ]);

        $file = $validated['image'];

        $path = $file->store('reference-images', 'public');

        if (!$path) {
            throw ValidationException::withMessages([
                'image' => ['The image could not be uploaded.'],
            ]);
        }

        return response()->json([
            'message' => 'Reference image uploaded successfully.',
            'data' => [
                'path' => $path,
                'original_filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size_bytes' => $file->getSize(),
            ],
        ], 201);
    }
}
