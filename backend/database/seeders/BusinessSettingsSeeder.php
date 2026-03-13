<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class BusinessSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'business_phone', 'value' => '', 'description' => 'Teléfono de contacto'],
            ['key' => 'business_email', 'value' => '', 'description' => 'Email de contacto'],
            ['key' => 'business_address', 'value' => '', 'description' => 'Dirección del negocio'],
            ['key' => 'business_hours', 'value' => '', 'description' => 'Horario de atención'],
            ['key' => 'business_whatsapp', 'value' => '', 'description' => 'Número de WhatsApp'],
            ['key' => 'business_facebook', 'value' => '', 'description' => 'URL de Facebook'],
            ['key' => 'business_instagram', 'value' => '', 'description' => 'URL de Instagram'],
            ['key' => 'business_linkedin', 'value' => '', 'description' => 'URL de LinkedIn'],
            ['key' => 'business_youtube', 'value' => '', 'description' => 'URL de YouTube'],
            ['key' => 'business_tiktok', 'value' => '', 'description' => 'URL de TikTok'],
            ['key' => 'mail_to_address', 'value' => '', 'description' => 'Email destino para formulario de contacto'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::firstOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
