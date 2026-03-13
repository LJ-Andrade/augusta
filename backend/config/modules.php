<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Modulos Habilitados
    |--------------------------------------------------------------------------
    |
    | Lista de módulos activos en el sistema. Cada módulo debe estar
    | instalado y su ServiceProvider registrado.
    |
    */
    'enabled' => [],

    /*
    |--------------------------------------------------------------------------
    | Auto-descubrimiento de Módulos
    |--------------------------------------------------------------------------
    |
    | Si está habilitado, el sistema buscará automáticamente módulos
    | en el directorio de módulos.
    |
    */
    'auto_discover' => true,

    /*
    |--------------------------------------------------------------------------
    | Directorio de Módulos
    |--------------------------------------------------------------------------
    |
    | Ruta base donde se encuentran los módulos del sistema.
    |
    */
    'modules_path' => base_path('modules'),
];
