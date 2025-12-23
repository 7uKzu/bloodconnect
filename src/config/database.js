import { Sequelize } from 'sequelize';

if (!process.env.MYSQL_URL) {
  throw new Error('MYSQL_URL is not defined');
}

export const sequelize = new Sequelize(process.env.MYSQL_URL, {
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
