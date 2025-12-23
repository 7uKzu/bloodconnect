import 'dotenv/config';
import { createApp } from './app.js';
import logger from './config/logger.js';

async function startServer() {
  const PORT = process.env.PORT || 4000;
  const { httpServer } = await createApp();
  httpServer.listen(PORT, () => {
    logger.info(`HTTP server listening on :${PORT}`);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
