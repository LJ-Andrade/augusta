<?php

namespace App\Core\Support;

use App\Core\Contracts\ModuleInterface;
use Illuminate\Support\Collection;

class ModuleRegistrar
{
    private static ?self $instance = null;
    private Collection $modules;
    
    private function __construct()
    {
        $this->modules = collect();
    }
    
    public static function instance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function register(array $moduleClasses): self
    {
        foreach ($moduleClasses as $class) {
            $this->registerSingle($class);
        }
        return $this;
    }
    
    private function registerSingle(string $moduleClass): void
    {
        if (!class_exists($moduleClass)) {
            return;
        }
        
        $module = new $moduleClass();
        
        if (!$module instanceof ModuleInterface) {
            return;
        }
        
        // Verificar dependencias
        foreach ($module->getDependencies() as $dependency) {
            if (!$this->modules->has($dependency)) {
                throw new \Exception("Módulo {$module->getName()} requiere {$dependency}");
            }
        }
        
        $this->modules->put($module->getName(), $module);
        $module->register();
    }
    
    public function boot(): self
    {
        $this->modules->each(function (ModuleInterface $module) {
            if ($module->isEnabled()) {
                $module->boot();
            }
        });
        return $this;
    }
    
    public function getModules(): Collection
    {
        return $this->modules;
    }
    
    public function isInstalled(string $name): bool
    {
        return $this->modules->has($name);
    }
}
