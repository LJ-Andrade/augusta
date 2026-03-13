#!/usr/bin/env node
/**
 * Script de desinstalación de módulos frontend
 * Uso: node scripts/module-uninstall.js <nombre-modulo>
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ADMIN_DIR = path.resolve(__dirname, '..');
const MODULES_DIR = path.join(ADMIN_DIR, 'src/modules');

async function uninstallModule(moduleName) {
  console.log(`🗑️  Desinstalando módulo: ${moduleName}`);
  
  const moduleDir = path.join(MODULES_DIR, moduleName);
  try {
    await fs.access(moduleDir);
    await fs.rm(moduleDir, { recursive: true, force: true });
    console.log(`   ✅ Directorio src/modules/${moduleName}/ eliminado`);
  } catch {
    console.warn(`   ⚠️  No se encontró directorio del módulo`);
  }
  
  console.log(`\n✅ Módulo ${moduleName} desinstalado`);
  console.log(`⚠️  Reinicia el servidor de desarrollo: npm run dev`);
}

const moduleName = process.argv[2];
if (!moduleName) {
  console.error('❌ Uso: node scripts/module-uninstall.js <nombre-modulo>');
  console.error('Ejemplo: node scripts/module-uninstall.js products');
  process.exit(1);
}

uninstallModule(moduleName).catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
