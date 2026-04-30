import { Sequelize } from 'sequelize';

if (!process.env.MYSQL_URL) {
  throw new Error('MYSQL_URL is not defined');
}

const sequelize = new Sequelize(process.env.MYSQL_URL, {
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export { sequelize };               // named export (kept for compatibility)
export default sequelize;           // default export – this will be used

export async function connectDB() {
  await sequelize.authenticate();
  console.log('Database connected');
}
