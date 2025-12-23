import 'dotenv/config';
import { Sequelize } from 'sequelize';
import logger from './logger.js';

const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env;

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: (msg) => logger.info(msg),
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
});

export async function connectDB() {
  await sequelize.authenticate();
}
