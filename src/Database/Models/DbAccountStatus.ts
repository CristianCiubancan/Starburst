import { pgTable, serial, text } from 'drizzle-orm/pg-core';

const DbAccountStatus = pgTable('account_status', {
  statusID: serial('status_id'),
  statusName: text('status_name'),
});

export { DbAccountStatus };
