#!/usr/bin/env node
/**
 * Script de instalación automática de módulos frontend
 * Uso: node scripts/module-install.js <path-al-modulo>
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ADMIN_DIR = path.resolve(__dirname, '..');
const MODULES_DIR = path.join(ADMIN_DIR, 'src/modules');

async function installModule(modulePath) {
  const moduleName = path.basename(modulePath);
  const manifestPath = path.join(modulePath, 'admin-manifest.json');
  
  console.log(`📦 Instalando módulo: ${moduleName}`);
  
  try {
    await fs.access(manifestPath);
  } catch {
    console.error(`❌ No se encontró admin-manifest.json en ${modulePath}`);
    process.exit(1);
  }
  
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  console.log(`   Versión: ${manifest.version}`);
  
  await fs.mkdir(MODULES_DIR, { recursive: true });
  
  const sourceFrontendDir = path.join(modulePath, 'frontend');
  const targetDir = path.join(MODULES_DIR, manifest.name);
  
  try {
    await fs.access(sourceFrontendDir);
    await copyDir(sourceFrontendDir, targetDir);
    console.log(`   ✅ Archivos copiados a src/modules/${manifest.name}/`);
  } catch {
    console.error(`❌ No se encontró directorio 'frontend' en ${modulePath}`);
    process.exit(1);
  }
  
  console.log(`\n✅ Módulo ${manifest.name} instalado correctamente`);
  console.log(`⚠️  Reinicia el servidor de desarrollo: npm run dev`);
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

const modulePath = process.argv[2];
if (!modulePath) {
  console.error('❌ Uso: node scripts/module-install.js <path-al-modulo>');
  process.exit(1);
}

installModule(path.resolve(modulePath)).catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
