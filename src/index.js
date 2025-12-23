import { createApp } from './app.js';
import { sequelize } from './config/database.js';
import { Role, User } from './models/index.js';
import bcrypt from 'bcryptjs';
import logger from './config/logger.js';

async function seedAdminOnce() {
  const adminRole = await Role.findOne({ where: { name: 'Admin' } });
  if (!adminRole) {
    throw new Error('Admin role not found');
  }

  const email = 'admin@bloodconnect.com';

  const [admin, created] = await User.findOrCreate({
    where: { email },
    defaults: {
      email,
      password_hash: await bcrypt.hash('admin123', 10),
      full_name: 'System Admin',
      status: 'active',
      RoleId: adminRole.id,
    },
  });

  if (created) {
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }
}

async function startServer() {
  try {
    // TEMPORARY DB INIT
    await sequelize.sync({ alter: true });
    await seedAdminOnce();
    console.log('DB initialized (admin ensured)');
  } catch (e) {
    console.error('DB init failed');
    console.error(e);
    process.exit(1);
  }

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
