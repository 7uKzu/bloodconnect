import 'dotenv/config';

const connectionString = process.env.MYSQL_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('MYSQL_URL or DATABASE_URL is not defined');
}

export default {
  development: {
    url: connectionString,
    dialect: 'mysql',
  },
  production: {
    url: connectionString,
    dialect: 'mysql',
  },
};
