<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class ModuleController extends Controller
{
    public function index(): JsonResponse
    {
        $modules = [];
        
        // Detectar si el módulo Products está instalado
        if (class_exists(\Vimana\Products\ProductsModule::class)) {
            $modules[] = [
                'name' => 'products',
                'version' => '1.0.0',
                'title' => 'Productos',
                'description' => 'Gestión de productos, categorías y etiquetas',
                'enabled' => true,
            ];
        }
        
        return response()->json([
            'data' => $modules,
            'meta' => [
                'total' => count($modules),
                'core_version' => '1.0.0'
            ]
        ]);
    }
}
