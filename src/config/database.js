import { Sequelize } from 'sequelize';

const connectionString = process.env.MYSQL_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('MYSQL_URL or DATABASE_URL is not defined');
}

export const sequelize = new Sequelize(connectionString, {
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export async function connectDB() {
  await sequelize.authenticate();
  console.log('Database connected');
}
