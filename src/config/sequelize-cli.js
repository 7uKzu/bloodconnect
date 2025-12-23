import 'dotenv/config';

if (!process.env.MYSQL_URL) {
  throw new Error('MYSQL_URL is not defined');
}

export default {
  development: {
    url: process.env.MYSQL_URL,
    dialect: 'mysql',
  },
  production: {
    url: process.env.MYSQL_URL,
    dialect: 'mysql',
  },
};
