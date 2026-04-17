<?php

namespace App\Core\Contracts;

interface ModuleInterface
{
    public function getName(): string;
    public function getVersion(): string;
    public function getDependencies(): array;
    public function register(): void;
    public function boot(): void;
    public function isEnabled(): bool;
}
