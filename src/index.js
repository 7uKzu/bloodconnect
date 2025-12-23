import { createApp } from './app.js';
import logger from './config/logger.js';
import { sequelize } from './config/database.js';
import { User } from './models/index.js';

/* =======================
   ONE-TIME ADMIN FIX
======================= */
async function ensureAdmin() {
  const admin = await User.findOne({
    where: { email: 'admin@bloodconnect.com' },
  });

  if (!admin) {
    console.log('Admin user not found');
    return;
  }

  if (admin.role_id !== 5 || admin.status !== 'active') {
    admin.role_id = 5;   // Admin role
    admin.status = 'active';
    await admin.save();
    console.log('Admin user fixed');
  }
}

/* =======================
   SERVER START
======================= */
async function startServer() {
  // Ensure DB is reachable
  await sequelize.authenticate();

  // 🔴 TEMPORARY DATA REPAIR
  await ensureAdmin();

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
