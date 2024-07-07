import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

const DbAccount = pgTable('account', {
  accountID: serial('account_id'),
  username: varchar('username', { length: 255 }),
  password: text('password'),
  salt: text('salt'),
  authorityID: integer('authority_id'),
  statusID: integer('status_id'),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  ipAddress: varchar('ip_address', { length: 255 }),
  registered: timestamp('registered'),
});

export { DbAccount };
