import { pgTable, serial, text } from 'drizzle-orm/pg-core';

const DbAccountAuthority = pgTable('account_authority', {
  authorityID: serial('authority_id'),
  authorityName: text('authority_name'),
});

export { DbAccountAuthority };
