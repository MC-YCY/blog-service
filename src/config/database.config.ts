import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  name: process.env.MYSQL_DB,
}));
