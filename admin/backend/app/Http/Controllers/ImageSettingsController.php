<?php

namespace App\Http\Controllers;

use App\Http\Resources\ImageSettingResource;
use App\Models\ImageSetting;
use App\Services\ImageValidationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ImageSettingsController extends Controller
{
    protected $validationService;

    public function __construct(ImageValidationService $validationService)
    {
        $this->validationService = $validationService;
    }

    public function index()
    {
        return ImageSettingResource::collection(ImageSetting::all());
    }

    public function show(string $section)
    {
        $config = $this->validationService->getConfig($section);
        
        if (!$config) {
            return response()->json(['error' => 'Configuración no encontrada'], 404);
        }

        return new ImageSettingResource($config);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'section' => 'required|string|unique:image_settings,section',
            'name' => 'required|string|max:255',
            'max_size_kb' => 'required|integer|min:1|max:10240',
            'allowed_extensions' => 'required|string',
            'min_width' => 'nullable|integer|min:1',
            'min_height' => 'nullable|integer|min:1',
            'max_width' => 'nullable|integer|min:1',
            'max_height' => 'nullable|integer|min:1',
            'aspect_ratio' => 'nullable|string',
            'active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $config = ImageSetting::create($validator->validated());

        return new ImageSettingResource($config);
    }

    public function update(Request $request, ImageSetting $imageSetting)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'max_size_kb' => 'sometimes|integer|min:1|max:10240',
            'allowed_extensions' => 'sometimes|string',
            'min_width' => 'nullable|integer|min:1',
            'min_height' => 'nullable|integer|min:1',
            'max_width' => 'nullable|integer|min:1',
            'max_height' => 'nullable|integer|min:1',
            'aspect_ratio' => 'nullable|string',
            'active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $imageSetting->update($validator->validated());

        return new ImageSettingResource($imageSetting->fresh());
    }

    public function destroy(ImageSetting $imageSetting)
    {
        $imageSetting->delete();
        
        return response()->json(['message' => 'Configuración eliminada correctamente']);
    }
}
