#!/usr/bin/env node
import { execSync } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to sequelize-cli's entry point
const sequelizeCli = join(__dirname, 'node_modules', 'sequelize-cli', 'lib', 'sequelize');

try {
    console.log('📦 Running migrations...');
    execSync(`node ${sequelizeCli} db:migrate`, { stdio: 'inherit' });
    
    console.log('🌱 Running seeds...');
    execSync(`node ${sequelizeCli} db:seed:all`, { stdio: 'inherit' });
    
    console.log('✅ Migrations and seeds completed successfully');
    process.exit(0);
} catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
}
