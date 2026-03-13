<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$settings = \App\Models\AutopostSettings::first();
$key = $settings->gemini_api_key;

// 1. Test predict
$url = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=' . $key;
$data = [
    'instances' => [['prompt' => 'A cute running dog']],
    'parameters' => ['sampleCount' => 1]
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response1 = curl_exec($ch);

// 2. Test generateImages
$url2 = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=' . $key;
$data2 = [
    'prompt' => 'A cute running dog'
];

$ch2 = curl_init($url2);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_POST, true);
curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode($data2));
curl_setopt($ch2, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response2 = curl_exec($ch2);

echo "Predict endpoint:\n$response1\n\n";
echo "GenerateImages endpoint:\n$response2\n";
