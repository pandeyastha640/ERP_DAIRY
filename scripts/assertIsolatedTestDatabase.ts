export function assertIsolatedTestDatabase() {
  const databaseUrl = process.env.DATABASE_URL || '';
  const sqlitePath = databaseUrl.startsWith('file:') ? databaseUrl.slice('file:'.length).split('?')[0] : '';
  const allowedIsolatedPath = /^\.\/(?:test|(?:r0|ci)-[A-Za-z0-9][A-Za-z0-9._-]*)\.db$/i.test(sqlitePath);

  if (process.env.NODE_ENV !== 'test' || !allowedIsolatedPath) {
    throw new Error('This check requires NODE_ENV=test and DATABASE_URL=file:./test.db or a local r0-/ci-*.db SQLite file.');
  }
}
