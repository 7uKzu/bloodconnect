import { createApp } from './app.js';
import { sequelize } from './config/database.js';
import { Role, User } from './models/index.js';
import bcrypt from 'bcryptjs';
import logger from './config/logger.js';

async function seedRolesOnce() {
  const now = new Date();

  const roles = [
    { id: 1, name: 'Donor' },
    { id: 2, name: 'Recipient' },
    { id: 3, name: 'Technician' },
    { id: 4, name: 'Staff' },
    { id: 5, name: 'Admin' },
    { id: 6, name: 'MedicalStaff' },
  ];

  for (const role of roles) {
    await Role.findOrCreate({
      where: { id: role.id },
      defaults: {
        name: role.name,
        created_at: now,
        updated_at: now,
      },
    });
  }

  console.log('Roles ensured');
}

async function seedAdminOnce() {
  const adminRole = await Role.findOne({ where: { name: 'Admin' } });
  if (!adminRole) {
    throw new Error('Admin role missing AFTER role seeding');
  }

  const email = 'admin@bloodconnect.com';

  await User.findOrCreate({
    where: { email },
    defaults: {
      email,
      password_hash: await bcrypt.hash('admin123', 10),
      full_name: 'System Admin',
      status: 'active',
      RoleId: adminRole.id,
    },
  });

  console.log('Admin ensured');
}

async function startServer() {
  try {
    await sequelize.sync({ alter: true }); // tables
    await seedRolesOnce();                 // roles
    await seedAdminOnce();                 // admin
    console.log('DB initialized');
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
