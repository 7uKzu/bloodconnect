import { createApp } from './app.js';
import { sequelize } from './config/database.js';
import logger from './config/logger.js';

async function startServer() {
  // 🔴 TEMPORARY: force DB schema creation
  try {
    await sequelize.sync({ alter: true });
    console.log('DB tables synced');
  } catch (e) {
    console.error('DB sync failed');
    console.error(e);
    process.exit(1);
  }
  // 🔴 END TEMPORARY

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
