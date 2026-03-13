<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/storage/{path}', function ($path) {
    $path = storage_path('app/public/' . $path);
    if (!File::exists($path)) {
        abort(404);
    }
    $mime = File::mimeType($path);
    return response()->file($path, ['Content-Type' => $mime]);
})->where('path', '.*');

Route::get('/storage/posts/{post_id}/{type}/{filename}', function ($post_id, $type, $filename) {
    $path = storage_path('app/public/posts/' . $post_id . '/' . $type . '/' . $filename);
    if (!File::exists($path)) {
        abort(404);
    }
    $mime = File::mimeType($path);
    return response()->file($path, ['Content-Type' => $mime]);
});
