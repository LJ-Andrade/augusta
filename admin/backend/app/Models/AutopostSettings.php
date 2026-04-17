<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AutopostSettings extends Model
{
    protected $table = 'autopost_settings';

    protected $fillable = [
        'gemini_api_key',
        'pre_prompt',
        'model',
        'author_id',
    ];

    public static function getSettings()
    {
        return self::firstOrCreate(
            ['id' => 1],
            [
                'pre_prompt' => '
				
				Actúa como un experto en Content Marketing y Copywriting especializado en el sector de tecnología y desarrollo de software. Tu objetivo es redactar un artículo de blog de alta conversión para mi sitio web profesional, con el fin de convencer a dueños de negocios y gerentes de que necesitan una web moderna, rápida y escalable hecha por profesionales.

				**Contexto del Servicio:** Soy desarrollador experto con dominio en tecnologías como React, Next.js, Laravel y despliegue en servidores optimizados. Mis soluciones no son simples plantillas; son herramientas de negocio de alto rendimiento.

				**Instrucciones del Post:**
				1. **Tema:** Elige un tema de tendencia tecnológica que impacte directamente en el dinero o la eficiencia del cliente (por ejemplo: la importancia de la velocidad de carga para el SEO, el paso de webs estáticas a aplicaciones interactivas, o por qué un backend robusto con Laravel previene desastres de seguridad).
				2. **Estructura:**
				- **Título Gancho:** Un título que prometa un beneficio claro o resuelva un miedo.
				- **Introducción:** Debe empatizar con un problema común del cliente (pérdida de ventas, web lenta, errores técnicos).
				- **Cuerpo:** Explica conceptos técnicos de forma sencilla pero autoritaria. Usa comparaciones (por ejemplo, comparar un servidor mal configurado con un motor que consume demasiada gasolina).
				- **Sección de Autoridad:** Menciona sutilmente los beneficios de usar stacks modernos (React/Next.js) sobre soluciones obsoletas.
				- **Llamado a la Acción (CTA):** Un cierre potente que invite al lector a agendar una asesoría técnica para diagnosticar su sitio actual.

				**Tono y Estilo:**
				- Profesional, visionario y directo.
				- Evita el lenguaje excesivamente críptico, pero demuestra que dominas la arquitectura de software.
				- El texto debe tener una extensión mínima de 800 palabras.
				- Usa subtítulos (H2, H3) y listas de puntos para mejorar la legibilidad.

				**Restricción Importante:** No hables solo de "diseño bonito"; enfócate en la arquitectura, la seguridad, la escalabilidad y el retorno de inversión (ROI) tecnológico.',
                'model' => 'gemini-2.5-flash',
                'author_id' => 1,
            ]
        );
    }

    public static function updateSettings($data)
    {
        $settings = self::find(1);
        if (!$settings) {
            $settings = new self();
            $settings->id = 1;
        }

        if (!empty($data['gemini_api_key'])) {
            $settings->gemini_api_key = $data['gemini_api_key'];
        }
        if (isset($data['pre_prompt'])) {
            $settings->pre_prompt = $data['pre_prompt'];
        }
        if (isset($data['model'])) {
            $settings->model = $data['model'];
        }
        if (isset($data['author_id'])) {
            $settings->author_id = $data['author_id'];
        }

        $settings->save();
        return $settings;
    }
}
