import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres({
  host: 'localhost',
  port: 5432,
  database: 'mydatabase',
  username: 'myuser',
  password: 'mypassword',
});

export const db = drizzle(client);
