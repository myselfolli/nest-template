import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as Entities from '../libs/database/src/entities';
import fs from 'fs';

const getConfig = async (): Promise<DataSource> => {
  console.debug(process.cwd());
  dotenv.config();

  const PG_USER = process.env.PG_USER;
  const PG_PASSWORD = process.env.PG_PASS;
  const PG_HOST = process.env.PG_HOST;

  const isRunningInDocker = fs.existsSync('/.dockerenv');

  return new DataSource({
    type: 'postgres',
    host: isRunningInDocker ? PG_HOST : 'localhost',
    port: 5432,
    username: PG_USER,
    password: PG_PASSWORD,
    useUTC: true,
    entities: Object.values(Entities),
    migrations: ['migrations/postgres/*.ts'],
  });
};

export default getConfig();
