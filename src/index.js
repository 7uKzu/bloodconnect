import { createApp } from './app.js';
import logger from './config/logger.js';
import { sequelize } from './config/database.js';
import { User, Role } from './models/index.js';
import bcrypt from 'bcryptjs';

async function seedAdminIfNeeded() {
  const adminEmail = 'admin@bloodconnect.com';

  const adminRole = await Role.findOne({ where: { name: 'Admin' } });

  if (!adminRole) {
    console.error('❌ Admin role not found. Roles table is empty.');
    throw new Error('Admin role missing');
  }

  const existing = await User.findOne({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log('ℹ️ Admin already exists');
    return;
  }

  const hash = await bcrypt.hash('admin123', 10);

  await User.create({
    email: adminEmail,
    password_hash: hash,
    full_name: 'System Admin',
    RoleId: adminRole.id,
    status: 'active',
  });

  console.log('✅ Admin user seeded');
}

async function startServer() {
  // DB connection
  await sequelize.authenticate();

  // 🔴 TEMP: seed admin
  await seedAdminIfNeeded();

  const PORT = process.env.PORT || 4000;
  const { httpServer } = await createApp();

  httpServer.listen(PORT, () => {
    logger.info(`HTTP server listening on :${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('FAILED TO START SERVER');
  console.error(error);
  process.exit(1);
});
