import { pgTable, serial, integer, timestamp } from 'drizzle-orm/pg-core';

const DbLogin = pgTable('login', {
  loginID: serial('login_id'),
  accountID: integer('account_id'),
  loginTime: timestamp('login_time'),
});

export { DbLogin };
